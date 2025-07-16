package com.service.guestgameservice.service;

import com.service.guestgameservice.dto.DecisionTreeDTO;
import com.service.guestgameservice.dto.GameRequestDTO;
import com.service.guestgameservice.dto.GuestInfoRequestDTO;
import com.service.guestgameservice.dto.TreeNodeDTO;
import com.service.guestgameservice.exception.UnauthorizedException;
import com.service.guestgameservice.model.Game;
import com.service.guestgameservice.model.GuestInfo;
import com.service.guestgameservice.repository.GameRepository;
import com.service.guestgameservice.repository.GuestGameRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import weka.classifiers.trees.J48;

import java.util.ArrayList;
import java.util.List;

@Service
public class GameService {
    private final GuestGameRepository guestGameRepository;
    private final GameRepository gameRepository;
    private final WebClient eventManagementWebClient;

    public GameService(
            GuestGameRepository guestGameRepository,
            GameRepository gameRepository,
            WebClient eventManagementWebClient
    ) {
        this.guestGameRepository = guestGameRepository;
        this.gameRepository = gameRepository;
        this.eventManagementWebClient = eventManagementWebClient;
    }

    public void createGame(GameRequestDTO gameRequestDTO, String token) {
        if (!authorizeAdmin(gameRequestDTO.getEventId(), gameRequestDTO.getUserMagicEventsTag(), token)) {
            throw new UnauthorizedException("Not authorized to create game for event ID: " + gameRequestDTO.getEventId());
        }

        Game game = new Game();
        game.setEventId(gameRequestDTO.getEventId());
        game.setDescription(gameRequestDTO.getDescription());
        gameRepository.save(game);
    }

    public void deleteGame(Long eventId, Long userMagicEventsTag, String token) {
        if (!authorizeAdmin(eventId, userMagicEventsTag, token)) {
            throw new UnauthorizedException("Not authorized to delete game for event ID: " + eventId);
        }

        Game game = gameRepository.findByEventId(eventId);
        if (game != null) {
            gameRepository.delete(game);
        }
    }

    public boolean gameExists(Long eventId) {
        return gameRepository.findByEventId(eventId) != null;
    }

    public void insertGuestInfo(GuestInfoRequestDTO guestInfoRequestDTO, String token) {
        Long userTagAsLong = Long.valueOf(guestInfoRequestDTO.getUserMagicEventsTag());
        if (!authorizePartecipant(guestInfoRequestDTO.getGameId(), userTagAsLong, token)) {
            throw new UnauthorizedException("Not authorized to insert guest info for game ID: " + guestInfoRequestDTO.getGameId());
        }

        GuestInfo guestInfo = new GuestInfo();
        guestInfo.setIsMen(guestInfoRequestDTO.getIsMen());
        guestInfo.setAge(guestInfoRequestDTO.getAge());
        guestInfo.setIsHostFamilyMember(guestInfoRequestDTO.getIsHostFamilyMember());
        guestInfo.setIsHostAssociate(guestInfoRequestDTO.getIsHostAssociate());
        guestInfo.setHaveBeard(guestInfoRequestDTO.getHaveBeard());
        guestInfo.setIsBald(guestInfoRequestDTO.getIsBald());
        guestInfo.setHaveGlasses(guestInfoRequestDTO.getHaveGlasses());
        guestInfo.setHaveDarkHair(guestInfoRequestDTO.getHaveDarkHair());
        guestInfo.setUserMagicEventsTag(guestInfoRequestDTO.getUserMagicEventsTag());

        Game game = gameRepository.findByEventId(guestInfoRequestDTO.getGameId());
        game.setEventId(guestInfoRequestDTO.getGameId());
        guestInfo.setGame(game);

        guestGameRepository.save(guestInfo);
    }

    public DecisionTreeDTO createDecisionTree(Long eventId, Long userMagicEventsTag, String token) {
        if (!authorizePartecipant(eventId, userMagicEventsTag, token)) {
            throw new UnauthorizedException("Not authorized to access decision tree for event ID: " + eventId);
        }

        try {
            Game game = gameRepository.findByEventId(eventId);
            if (game == null) {
                throw new RuntimeException("Game not found for event ID: " + eventId);
            }

            List<GuestInfo> guestInfoList = guestGameRepository.findByGame(game);

            if (guestInfoList.isEmpty()) {
                throw new RuntimeException("No guest data available to build decision tree");
            }

            ArrayList<Attribute> attributes = new ArrayList<>();
            attributes.add(new Attribute("isMen"));
            attributes.add(new Attribute("age"));
            attributes.add(new Attribute("isHostFamilyMember"));
            attributes.add(new Attribute("isHostAssociate"));
            attributes.add(new Attribute("haveBeard"));
            attributes.add(new Attribute("isBald"));
            attributes.add(new Attribute("haveGlasses"));
            attributes.add(new Attribute("haveDarkHair"));

            ArrayList<String> classValues = new ArrayList<>();
            for (GuestInfo guestInfo : guestInfoList) {
                String tag = guestInfo.getUserMagicEventsTag();
                if (!classValues.contains(tag)) {
                    classValues.add(tag);
                }
            }
            attributes.add(new Attribute("user_magic_events_tag", classValues));

            Instances dataset = getDatasetInstances(attributes, guestInfoList);

            J48 tree = getDecisionTree(dataset, classValues);

            double accuracy = getAccuracy(dataset, tree);

            String treeString = tree.toString();
            System.out.println("Decision Tree:\n" + treeString);
            TreeNodeDTO rootNode = parseTreeFromString(treeString);

            return new DecisionTreeDTO(rootNode, accuracy, dataset.size());
        } catch (Exception e) {
            throw new RuntimeException("Error creating decision tree: " + e.getMessage(), e);
        }
    }

    public boolean hasUserInsertedGuestInfo(Long eventId, Long userMagicEventsTag) {
        Game game = gameRepository.findByEventId(eventId);
        if (game == null) {
            return false;
        }

        GuestInfo existingGuestInfo = guestGameRepository.findByGameAndUserMagicEventsTag(game, userMagicEventsTag.toString());
        return existingGuestInfo != null;
    }

    private boolean authorizeAdmin(Long eventId, Long userMagicEventsTag, String token) {
        try {
            Boolean isAdmin = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/iscreator")
                    .queryParam("creatorId", userMagicEventsTag)
                    .queryParam("eventId", eventId)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isAdmin);
        } catch (Exception e) {
            System.err.println("-----> Error during admin authorization check: " + e.getMessage());
            return false;
        }
    }

    private boolean authorizePartecipant(Long eventId, Long userMagicEventsTag, String token) {
        try {
            Boolean isParticipant = eventManagementWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                    .path("/gestion/ispartecipant")
                    .queryParam("partecipantId", userMagicEventsTag)
                    .queryParam("eventId", eventId)
                    .build())
                    .headers(headers -> headers.setBearerAuth(token))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isParticipant);
        } catch (Exception e) {
            System.err.println("-----> Error during participant authorization check: " + e.getMessage());
            return false;
        }
    }

    private TreeNodeDTO parseTreeFromString(String treeString) {
        String[] lines = treeString.split("\n");
        // Find the first actual tree line (skip headers)
        int startLine = 0;
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (!line.isEmpty() && !line.startsWith("J48") && !line.startsWith("---") && !line.startsWith("=") 
                && !line.startsWith("Number of") && !line.startsWith("Size of")) {
                startLine = i;
                break;
            }
        }

        // Extract only the tree lines (stop at statistics)
        List<String> treeLines = new ArrayList<>();
        for (int i = startLine; i < lines.length; i++) {
            String line = lines[i];
            if (line.trim().isEmpty() || line.trim().startsWith("Number of") || line.trim().startsWith("Size of")) {
                break;
            }
            treeLines.add(line);
        }

        if (treeLines.isEmpty()) {
            return null;
        }

        // Caso speciale: albero con solo 2 linee (split semplice)
        if (treeLines.size() == 2) {
            return parseSimpleTree(treeLines);
        }

        int[] lineIndex = {0};
        return parseComplexNode(treeLines, 0, lineIndex);
    }

    private TreeNodeDTO parseSimpleTree(List<String> lines) {
        // Per alberi semplici con solo 2 linee: "condition1: class1" e "condition2: class2"
        String line1 = lines.get(0).trim();
        String line2 = lines.get(1).trim();
        
        // Estrai la condizione base dalla prima linea
        String condition1 = extractBaseCondition(line1);
        String condition2 = extractBaseCondition(line2);
        
        // Verifica che siano dello stesso attributo con <= e >
        if (areComplementaryConditions(condition1, condition2)) {
            String question = formatQuestion(condition1);
            
            // Crea i nodi foglia
            String class1 = extractClassFromLeaf(line1);
            String class2 = extractClassFromLeaf(line2);
            
            TreeNodeDTO leftChild = new TreeNodeDTO(class1);
            TreeNodeDTO rightChild = new TreeNodeDTO(class2);
            
            return new TreeNodeDTO(question, leftChild, rightChild);
        }
        
        // Se non sono complementari, tratta come nodi separati
        String class1 = extractClassFromLeaf(line1);
        return new TreeNodeDTO(class1);
    }

    private boolean areComplementaryConditions(String cond1, String cond2) {
        if (cond1.contains("<=") && cond2.contains(">")) {
            String attr1 = cond1.split("<=")[0].trim();
            String attr2 = cond2.split(">")[0].trim();
            return attr1.equals(attr2);
        }
        return false;
    }

    private TreeNodeDTO parseComplexNode(List<String> lines, int expectedDepth, int[] lineIndex) {
        if (lineIndex[0] >= lines.size()) {
            return null;
        }

        String currentLine = lines.get(lineIndex[0]);
        int currentDepth = getDepth(currentLine);
        
        // Se siamo tornati a un livello più superficiale, fermati
        if (currentDepth < expectedDepth) {
            return null;
        }
        
        // Se il livello è più profondo del previsto, errore
        if (currentDepth > expectedDepth) {
            return null;
        }

        // Consuma la linea corrente
        lineIndex[0]++;
        
        String cleanLine = currentLine.trim().replaceAll("^\\|+\\s*", "");
        
        // Se è una foglia, restituiscila
        if (isLeafNode(cleanLine)) {
            String className = extractClassFromLeaf(cleanLine);
            return new TreeNodeDTO(className);
        }

        // È un nodo di decisione
        String baseCondition = extractBaseCondition(cleanLine);
        String question = formatQuestion(baseCondition);

        // Parsa il sottoalbero sinistro (tutti i figli con profondità maggiore)
        TreeNodeDTO leftChild = parseSubtree(lines, expectedDepth + 1, lineIndex);

        // Cerca il ramo destro (stessa profondità, condizione complementare)
        TreeNodeDTO rightChild = findAndParseRightBranch(lines, expectedDepth, baseCondition, lineIndex);

        return new TreeNodeDTO(question, leftChild, rightChild);
    }

    private TreeNodeDTO parseSubtree(List<String> lines, int targetDepth, int[] lineIndex) {
        if (lineIndex[0] >= lines.size()) {
            return null;
        }

        String nextLine = lines.get(lineIndex[0]);
        int nextDepth = getDepth(nextLine);
        
        if (nextDepth == targetDepth) {
            return parseComplexNode(lines, targetDepth, lineIndex);
        }
        
        return null;
    }

    private TreeNodeDTO findAndParseRightBranch(List<String> lines, int expectedDepth, String leftCondition, int[] lineIndex) {
        // Cerca una linea alla stessa profondità con condizione complementare
        while (lineIndex[0] < lines.size()) {
            String currentLine = lines.get(lineIndex[0]);
            int currentDepth = getDepth(currentLine);
            
            // Se siamo tornati a un livello più superficiale, fermati
            if (currentDepth < expectedDepth) {
                break;
            }
            
            // Se troviamo una linea alla stessa profondità
            if (currentDepth == expectedDepth) {
                String cleanLine = currentLine.trim().replaceAll("^\\|+\\s*", "");
                String currentCondition = extractBaseCondition(cleanLine);
                
                // Verifica se è la condizione complementare
                if (areComplementaryConditions(leftCondition, currentCondition)) {
                    lineIndex[0]++; // Consuma la linea
                    
                    if (isLeafNode(cleanLine)) {
                        String className = extractClassFromLeaf(cleanLine);
                        return new TreeNodeDTO(className);
                    } else {
                        // Parsa il sottoalbero destro
                        return parseSubtree(lines, expectedDepth + 1, lineIndex);
                    }
                }
            }
            
            // Salta le linee più profonde fino a trovare quella giusta
            lineIndex[0]++;
        }
        
        return null;
    }

    private int getDepth(String line) {
        int depth = 0;
        for (char c : line.toCharArray()) {
            if (c == '|') {
                depth++;
            } else if (c != ' ') {
                break;
            }
        }
        return depth;
    }

    private boolean isLeafNode(String line) {
        return line.matches(".*:\\s*\\w+\\s*\\([0-9.]+\\)\\s*$");
    }

    private String extractClassFromLeaf(String line) {
        int colonIndex = line.indexOf(":");
        String afterColon = line.substring(colonIndex + 1).trim();
        int parenIndex = afterColon.indexOf("(");
        return afterColon.substring(0, parenIndex).trim();
    }

    private String extractBaseCondition(String line) {
        if (isLeafNode(line)) {
            return line.substring(0, line.indexOf(":")).trim();
        }
        return line.trim();
    }

    private String formatQuestion(String condition) {
        condition = condition.replaceAll("^[|\\s]+", "").trim();

        if (condition.contains("<=")) {
            String[] parts = condition.split("<=");
            if (parts.length == 2) {
                String attribute = parts[0].trim();
                String value = parts[1].trim();
                return formatAttributeQuestion(attribute, "<=", value);
            }
        } else if (condition.contains(">")) {
            String[] parts = condition.split(">");
            if (parts.length == 2) {
                String attribute = parts[0].trim();
                String value = parts[1].trim();
                return formatAttributeQuestion(attribute, ">", value);
            }
        }

        return condition;
    }

    private String formatAttributeQuestion(String attribute, String operator, String value) {
        switch (attribute) {
            case "isMen":
                return "L'ospite è uomo?";
            case "age":
                if (operator.equals("<=")) {
                    return "L'ospite ha meno di " + (Integer.parseInt(value.split("\\.")[0]) + 1) + " anni?";
                } else {
                    return "L'ospite ha più di " + value.split("\\.")[0] + " anni?";
                }
            case "isHostFamilyMember":
                return "L'ospite è un membro della famiglia ospitante?";
            case "isHostAssociate":
                return "L'ospite è un associato dell'ospitante?";
            case "haveBeard":
                return "L'ospite ha la barba?";
            case "isBald":
                return "L'ospite NON ha i capelli?";
            case "haveGlasses":
                return "L'ospite porta gli occhiali?";
            case "haveDarkHair":
                return "L'ospite ha i capelli scuri?";
            default:
                return attribute + " " + operator + " " + value + "?";
        }
    }

    private static J48 getDecisionTree(Instances dataset, ArrayList<String> classValues) throws Exception {
        J48 tree = new J48();
        tree.setUnpruned(true);
        tree.setMinNumObj(1);
        tree.setConfidenceFactor(0.60f);
        tree.buildClassifier(dataset);

        return tree;
    }

    private static double getAccuracy(Instances dataset, J48 tree) throws Exception {
        int correct = 0;
        for (int i = 0; i < dataset.size(); i++) {
            Instance instance = dataset.instance(i);
            double classIndex = tree.classifyInstance(instance);
            String predictedClass = dataset.classAttribute().value((int) classIndex);
            String actualClass = instance.stringValue(dataset.classIndex());

            if (predictedClass.equals(actualClass)) {
                correct++;
            }
        }

        double accuracy = (double) correct / dataset.size() * 100;
        return accuracy;
    }

    private static Instances getDatasetInstances(ArrayList<Attribute> attributes, List<GuestInfo> guestInfoList) {
        Instances dataset = new Instances("GuestInfo", attributes, guestInfoList.size());
        dataset.setClassIndex(attributes.size() - 1);

        for (GuestInfo guestInfo : guestInfoList) {
            DenseInstance instance = new DenseInstance(attributes.size());
            instance.setValue(attributes.get(0), guestInfo.getIsMen() ? 1.0 : 0.0);
            instance.setValue(attributes.get(1), guestInfo.getAge());
            instance.setValue(attributes.get(2), guestInfo.getIsHostFamilyMember() ? 1.0 : 0.0);
            instance.setValue(attributes.get(3), guestInfo.getIsHostAssociate() ? 1.0 : 0.0);
            instance.setValue(attributes.get(4), guestInfo.getHaveBeard() ? 1.0 : 0.0);
            instance.setValue(attributes.get(5), guestInfo.getIsBald() ? 1.0 : 0.0);
            instance.setValue(attributes.get(6), guestInfo.getHaveGlasses() ? 1.0 : 0.0);
            instance.setValue(attributes.get(7), guestInfo.getHaveDarkHair() ? 1.0 : 0.0);

            instance.setValue(attributes.get(8), guestInfo.getUserMagicEventsTag());

            instance.setDataset(dataset);
            dataset.add(instance);
        }
        return dataset;
    }
}

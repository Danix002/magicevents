import { useState } from 'react';
import GameNode from '../../../components/game-component/GameNode';
import { useEffect } from 'react';
import { getGame, isDataInGame } from '../../../api/gameAPI';
import { useNavigate, useParams } from 'react-router-dom';
import MysticalBackground from '../../../components/ui/MysticalBackground';
import CrystalBall from '../../../components/ui/CrystalBall';
import MagicalCard from '../../../components/ui/MagicalCard';

const GamePage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [tree, setTree] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchAPI() {
            const isInGameAPI = await isDataInGame(eventId);
            const res1 = await isInGameAPI.json();

            if (!res1) {
                navigate(`/${eventId}/game/form`);
                return;
            }

            try {
                const res = await getGame(eventId);
                const res2 = await res.json();
                setTree(res2.root);
            } catch (error) {
                setError('Non sono del umore, riprova più tardi');
            }
        }

        if (!eventId) {
            return;
        }

        fetchAPI();
    }, [eventId]);

    return (
        <MysticalBackground variant="game">
            {/* Floating Crystal Balls for decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large crystal balls */}
                <CrystalBall 
                    size="large" 
                    className="absolute items-center top-20 opacity-20 animate-pulse"
                >
                    <div className="text-6xl">🐰</div>
                </CrystalBall>
            </div>

            <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8">
                {tree ? (
                    <div className="w-full max-w-6xl mx-auto">
                        <GameNode startingNode={tree} />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <MagicalCard variant="error" className="max-w-md mx-auto">
                            <div className="text-center p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-red-300 mb-4">
                                    Oops! Qualcosa è andato storto
                                </h2>
                                <p className="text-purple-200 text-base md:text-lg mb-6">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                                             text-white font-bold py-3 px-6 rounded-xl transform transition-all duration-300 
                                             hover:scale-105 hover:shadow-lg text-sm md:text-base"
                                >
                                    🔄 Riprova
                                </button>
                            </div>
                        </MagicalCard>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        {/* Loading state with animated crystal ball */}
                        <CrystalBall size="large" className="mb-4 animate-pulse">
                            <div className="text-6xl animate-spin">🔮</div>
                        </CrystalBall>
                        
                        <MagicalCard variant="loading" className="max-w-md mx-auto">
                            <div className="text-center p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-purple-300 mb-4">
                                    Il Mago sta preparando il gioco...
                                </h2>
                                <p className="text-purple-200 text-base md:text-lg mb-6">
                                    Aspetta sto pensando alle domande...
                                </p>
                                
                                {/* Loading animation */}
                                <div className="flex justify-center space-x-2">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </MagicalCard>
                    </div>
                )}
            </div>

            {/* Bottom decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </MysticalBackground>
    );
};

export default GamePage;
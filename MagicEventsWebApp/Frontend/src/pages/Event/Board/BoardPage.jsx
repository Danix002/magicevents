import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import MessageList from '../../../components/lists/MessageList';
import { getMessages } from '../../../api/boardApi';
import { useNavigate, useParams } from 'react-router-dom';
import { subscribe } from '../../../utils/webSocket';
import Button from '../../../components/buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { isAdmin, url } from '../../../utils/utils';
import LoadingContainer from '../../../components/error/LoadingContainer';

const BoardPage = () => {
	const [messages, setMessages] = useState([]);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const board = document.getElementById('board');
	const board2 = document.getElementById('board2');
	const [stompClient, setStompClient] = useState(null);
	const [connected, setConnected] = useState(false);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const [page, setPage] = useState(0);

	const [messageFinish, setMessageFinish] = useState(false);

	const { eventId } = useParams();

	const [isAdminVar, setIsAdminVar] = useState(isAdmin(eventId));

	const boardUrl = `https://${url}:8081`;

	async function loadMore() {
		if (messageFinish) {
			return;
		}
		setPage((prev) => prev + 1);
		setIsAdminVar(isAdmin(eventId));
		console.log(page);

		let res = await getMessages(eventId, page);

		if (!res.ok) throw new Error('Error on load more messages');
		const data = await res.json();
		console.log(data);
		if (data.messages.length === 0) {
			setMessageFinish(true);
			return;
		}
		setMessages((prev) => [...prev, ...data.messages]);
	}

	useEffect(() => {
		if (board === null || board2 == null) {
			return;
		}

		setTimeout(() => {
			board?.scrollTo({ left: 0, top: board.scrollHeight, behavior: 'smooth' });
			board2?.scrollTo({ left: 0, top: board2.scrollHeight, behavior: 'smooth' });
		}, 500);
	}, [board, board?.scrollHeight, board2, board2?.scrollHeight]);

	useEffect(() => {
		async function fetchAPI() {
			let res = await getMessages(eventId, 0);

			if (!res.ok) throw new Error('Messages error');
			setPage(1);
			const data = await res.json();
			console.log(data);
			setTitle(data.title);
			setDescription(data.description);
			setMessages(data.messages);
			setLoading(false);
		}

		if (!eventId) return;

		connect();
		fetchAPI();

		// Cleanup on unmount
		return () => {
			if (stompClient) {
				stompClient.disconnect();
			}
		};
	}, [eventId]);

	const connect = () => {
		if (!eventId || connected) return;
		const socket = new SockJS(`${boardUrl}/chat`);
		const client = Stomp.over(socket);
		// Disable debug output (optional)
		client.debug = null;

		console.log('Connecting...');

		client.connect(
			{},
			(frame) => {
				setStompClient(client);
				setConnected(true);
				// Subscribe to the topic with the correct path format
				const subscription = subscribe(client, `/topic/chat/${eventId}`, (receivedMessage, hash) => {
					setMessages((prev) => [receivedMessage, ...prev.filter((item) => !(hash(item) === hash(receivedMessage)))]);
				});
				const deleteSubscription = subscribe(client, `/topic/chat/deleteMessage/${eventId}`, (deletedMessage, hash) => {
					setMessages((prev) => prev.filter((item) => !(item.messageID === deletedMessage.messageID)));
				});
				client.onclose = () => {
					console.log('Client disconesso');
				};
			},
			(error) => {
				setConnected(false);
			}
		);
	};

	const deleteMessage = (mex) => {
		if (!stompClient || !connected || !stompClient.connected) {
			console.log('Not connected to WebSocket');
			alert('Qualcosa è andato storto');
			navigate('/home');
			return;
		}

		let user = JSON.parse(sessionStorage.getItem('user'));

		const chatMessage = {
			messageID: mex.messageID,
			deletedBy: user.username,
			eventID: eventId,
			userMagicEventsTag: JSON.parse(sessionStorage.getItem('user')).magicEventTag,
		};
		console.log('pre - message:', mex);
		console.log('Deleting message:', chatMessage);

		try {
			stompClient.send(`/app/chat/deleteMessage/${eventId}`, {}, JSON.stringify(chatMessage));
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	const sendMessage = (content) => {
		if (!stompClient || !connected || !stompClient.connected) {
			console.log('Not connected to WebSocket');
			alert('Qualcosa è andato storto');
			navigate('/home');
			return;
		}

		let user = JSON.parse(sessionStorage.getItem('user'));

		const chatMessage = {
			content: content,
			username: user.username,
			dateTime: new Date().toISOString(),
			eventID: eventId,
			userMagicEventsTag: JSON.parse(sessionStorage.getItem('user')).magicEventTag,
		};

		console.log('Sending message:', chatMessage);

		try {
			stompClient.send(`/app/chat/sendMessage/${eventId}`, {}, JSON.stringify(chatMessage));
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	return loading ? (
		<LoadingContainer />
	) : (
		<div className="h-full bg-[#363540] relative bg-gradient-to-r  to-[#363540]  from-[#E4DCEF] flex flex-row ">
			<div className="w-64 mt-4 shadow-2xl h-fit rounded-r-2xl bg-[#363540] text-[#E4DCEF] p-4 max-sm:hidden ">
				<Button onClick={() => navigate('/' + eventId)} text={<FontAwesomeIcon icon={faArrowLeft} />}></Button>
				<h1 className="font-bold">{title}</h1>
				<p className="text-xs break-words text-clip  w-full ">{description}</p>
			</div>
			<MessageList
				isAdmin={isAdminVar}
				displayOnloadMore={!messageFinish}
				onLoadMore={loadMore}
				onSend={(value) => sendMessage(value)}
				messages={messages}
				onDelete={deleteMessage}
			/>
		</div>
	);
};

export default BoardPage;

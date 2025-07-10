import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import MessageList from '../../../components/lists/MessageList';
import { getMessages } from '../../../api/boardApi';
import { useNavigate, useParams } from 'react-router-dom';
import { subscribe } from '../../../utils/webSocket';
import Button from '../../../components/buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUsers, faComments } from '@fortawesome/free-solid-svg-icons';
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
		<div className="h-full bg-gradient-to-br from-[#505458] to-[#363540] sm:flex sm:flex-row">
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex lg:w-80 xl:w-96">
				<div className="m-6 w-full">
					<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col">
						{/* Header */}
						<div className="p-6 border-b border-[#E4DCEF] border-opacity-20">
							<Button
								onClick={() => navigate('/' + eventId)}
								custom="!bg-[#363540] !text-white hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-3 mb-4"
								text={<FontAwesomeIcon icon={faArrowLeft} />}
							/>
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] rounded-full flex items-center justify-center">
									<FontAwesomeIcon icon={faComments} className="text-white" />
								</div>
								<h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
							</div>
							<p className="text-[#1a1a1a] text-opacity-70 text-sm leading-relaxed">{description}</p>
						</div>

						{/* Event Info */}
						<div className="p-6 flex-1">
							<div className="bg-[#EE0E51] bg-opacity-10 rounded-xl p-4">
								<div className="flex justify-center mb-2">
									<FontAwesomeIcon icon={faUsers} className="text-black" />
									<span className="text-sm font-medium text-[#E4DCEF]">Bacheca</span>
								</div>
								<p className="text-xs text-[#E4DCEF] text-opacity-70">
									Condividi pensieri e aggiornamenti con tutti i partecipanti
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Header */}
			<div className="lg:hidden absolute top-0 left-0 right-0 z-10">
				<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-lg p-4">
					<div className="flex items-center gap-3">
						<Button 
							onClick={() => navigate('/' + eventId)} 
							custom="!bg-[#363540] !text-white hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-2"
							text={<FontAwesomeIcon icon={faArrowLeft} />}
						/>
						<div>
							<h1 className="font-bold text-[#1a1a1a] text-lg">{title}</h1>
							<p className="text-xs text-[#1a1a1a] text-opacity-70 line-clamp-1">{description}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col lg:m-6 lg:mr-6">
				<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col lg:mt-0 mt-20">
					<MessageList
						isAdmin={isAdminVar}
						displayOnloadMore={!messageFinish}
						onLoadMore={loadMore}
						onSend={(value) => sendMessage(value)}
						messages={messages}
						onDelete={deleteMessage}
					/>
				</div>
			</div>
		</div>
	);
};

export default BoardPage;

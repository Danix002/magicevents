import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import MessageList from '../../../components/lists/MessageList';
import { getMessages } from '../../../api/boardAPI';
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
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

	// Handle mobile keyboard detection
	useEffect(() => {
		const handleResize = () => {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.clientHeight;
			const threshold = 150; // Threshold to detect keyboard
			
			setIsKeyboardOpen(documentHeight - windowHeight > threshold);
		};

		const handleVisualViewport = () => {
			if (window.visualViewport) {
				const { height } = window.visualViewport;
				const windowHeight = window.innerHeight;
				setIsKeyboardOpen(windowHeight - height > 150);
			}
		};

		window.addEventListener('resize', handleResize);
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', handleVisualViewport);
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', handleVisualViewport);
			}
		};
	}, []);

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
			{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
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

				console.log('Connected');

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

		console.log('Deleting message:', chatMessage);

		try {
			stompClient.send(
				`/app/chat/deleteMessage/${eventId}`,
				{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
				JSON.stringify(chatMessage)
			);
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
			stompClient.send(
				`/app/chat/sendMessage/${eventId}`,
				{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
				JSON.stringify(chatMessage)
			);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	return loading ? (
		<LoadingContainer />
	) : (
		<div className={`${isKeyboardOpen ? 'h-screen' : 'h-full'} bg-gradient-to-br from-[#505458] to-[#363540] flex flex-col lg:flex-row`}>
			{/* Desktop Sidebar */}
			<div className="hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0">
				<div className="m-4 lg:m-6 w-full">
					<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col">
						{/* Header */}
						<div className="p-4 lg:p-6 border-b border-[#E4DCEF] border-opacity-20">
							<Button
								onClick={() => navigate('/' + eventId)}
								custom="!bg-[#363540] !text-white hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-2 lg:!p-3 mb-3 lg:mb-4"
								text={<FontAwesomeIcon icon={faArrowLeft} className="text-sm lg:text-base" />}
							/>
							<div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
								<div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] rounded-full flex items-center justify-center">
									<FontAwesomeIcon icon={faComments} className="text-white text-sm lg:text-base" />
								</div>
								<h1 className="text-lg lg:text-xl font-bold text-[#1a1a1a] leading-tight">{title}</h1>
							</div>
							<p className="text-[#1a1a1a] text-opacity-70 text-xs lg:text-sm leading-relaxed">{description}</p>
						</div>

						{/* Event Info */}
						<div className="p-4 lg:p-6 flex-1">
							<div className="bg-[#EE0E51] bg-opacity-10 rounded-xl p-3 lg:p-4">
								<div className="flex items-center justify-center gap-2 mb-2">
									<FontAwesomeIcon icon={faUsers} className="text-black text-sm" />
									<span className="text-xs lg:text-sm font-medium text-[#E4DCEF]">Bacheca</span>
								</div>
								<p className="text-xs text-[#E4DCEF] text-opacity-70 text-center">
									Condividi pensieri e aggiornamenti con tutti i partecipanti
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Header */}
			<div className={`lg:hidden bg-white bg-opacity-10 backdrop-blur-sm shadow-lg p-3 sm:p-4 m-3 sm:m-4 rounded-xl ${isKeyboardOpen ? 'mb-2' : ''}`}>
				<div className="flex items-center gap-2 sm:gap-3">
					<Button 
						onClick={() => navigate('/' + eventId)} 
						custom="!bg-[#363540] !text-white hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-2 sm:!p-3"
						text={<FontAwesomeIcon icon={faArrowLeft} className="text-sm sm:text-base" />}
					/>
					<div className="min-w-0 flex-1">
						<h1 className="font-bold text-[#1a1a1a] text-base sm:text-lg truncate">{title}</h1>
						<p className="text-xs sm:text-sm text-[#1a1a1a] text-opacity-70 line-clamp-1">{description}</p>
					</div>
				</div>
			</div>

			{/* Chat Area */}
			<div className={`flex-1 flex flex-col m-3 sm:m-4 lg:m-6 lg:mr-6 lg:ml-0 min-h-0 ${isKeyboardOpen ? 'mt-2' : ''}`}>
				<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col min-h-0 overflow-hidden">
					<div className="flex-1 min-h-0 overflow-hidden flex flex-col">
						<MessageList
							isAdmin={isAdminVar}
							displayOnloadMore={!messageFinish}
							onLoadMore={loadMore}
							onSend={(value) => sendMessage(value)}
							messages={messages}
							onDelete={deleteMessage}
							isKeyboardOpen={isKeyboardOpen}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BoardPage;

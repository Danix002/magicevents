import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { useNavigate, useParams } from 'react-router-dom';
import { getImages, getImagesPopular } from '../../../api/galleryAPI';
import { send, subscribe } from '../../../utils/webSocket';
import ImageList from '../../../components/lists/ImageList';
import ImageGrid from '../../../components/images-component/ImageGrid';
import Button from '../../../components/buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClose, faHeart, faDownload } from '@fortawesome/free-solid-svg-icons';
import ImageDrop from '../../../components/popup/ImageDrop';
import clsx from 'clsx';
import { isAdmin, url } from '../../../utils/utils';
import LoadingContainer from '../../../components/error/LoadingContainer';

const GalleryPage = () => {
	const [images, setImages] = useState([]);
	const [imagePopup, setImagePopup] = useState('');
	const [titlePopup, setTitlePopup] = useState('');
	const [openPopup, setOpenPopup] = useState(false);
	const [imagesPopular, setImagesPopular] = useState([]);
	const [title, setTitle] = useState('');
	const gallery = document.getElementById('gallery');
	const gallery2 = document.getElementById('gallery2');
	const [stompClient, setStompClient] = useState(null);
	const [connected, setConnected] = useState(false);
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [pagep, setPagep] = useState(0);
	const [loading, setLoading] = useState(true);
	const [messageFinish, setMessageFinish] = useState(false);
	const [messageFinishp, setMessageFinishp] = useState(false);

	const { eventId } = useParams();
	const [isAdminVar, setIsAdminVar] = useState(isAdmin(eventId));

	const galleryUrl = `https://${url}:8085`;

	async function loadMore() {
		if (messageFinish) {
			return;
		}
		setPage((prev) => prev + 1);
		setIsAdminVar(isAdmin(eventId));
		let res = await getImages(eventId, page);
		if (!res.ok) throw new Error('Error on load more images');
		const data = await res.json();
		if (data.images.length < 10) {
			setImages((prev) => [...prev, ...data.images]);
			setMessageFinish(true);
			return;
		}
		setImages((prev) => [...prev, ...data.images]);
	}

	async function loadMorep() {
		if (messageFinishp) {
			return;
		}
		setPagep((prev) => prev + 1);
		let res = await getImagesPopular(eventId, page);
		if (!res.ok) throw new Error('Error on load more popular images');
		const data = await res.json();
		if (data.images.length < 10) {
			setImagesPopular((prev) => [...prev, ...data.images]);
			setMessageFinishp(true);
			return;
		}
		setImagesPopular((prev) => [...prev, ...data.images]);
	}

	useEffect(() => {
		if (gallery === null || gallery2 == null) {
			return;
		}
		setTimeout(() => {
			gallery?.scrollTo({ left: 0, top: gallery.scrollHeight, behavior: 'smooth' });
			gallery2?.scrollTo({ left: 0, top: gallery2.scrollHeight, behavior: 'smooth' });
		}, 500);
	}, [gallery, gallery?.scrollHeight, gallery2, gallery2?.scrollHeight]);

	useEffect(() => {
		async function fetchAPI() {
			let res = await getImages(eventId, 0);
			let resp = await getImagesPopular(eventId, 0);
			if (!res.ok) throw new Error('Error on load images');
			if (!resp.ok) throw new Error('Error on load popular images');
			setPage(1);
			setPagep(1);
			const data = await res.json();
			const datap = await resp.json();
			setTitle(data.title);
			setImages(data.images);
			setImagesPopular(datap.images);
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

		const socket = new SockJS(`${galleryUrl}/gallery`);
		const client = Stomp.over(socket);
		// Disable debug output (optional)
		client.debug = null;
		client.connect(
			{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
			(frame) => {
				setStompClient(client);
				setConnected(true);
				// Subscribe to the topic with the correct path format
				subscribe(client, `/topic/gallery/${eventId}`, (receivedImage, hash) => {
					setImages((prev) => [receivedImage, ...prev.filter((item) => !(hash(item) === hash(receivedImage)))]);
				});
				subscribe(client, `/topic/gallery/deleteImage/${eventId}`, (deletedMessage, hash) => {
					setImages((prev) => prev.filter((item) => !(item.imageID === deletedMessage.imageID)));
					setImagesPopular((prev) => prev.filter((item) => !(item.imageID === deletedMessage.imageID)));
				});
				subscribe(client, `/topic/gallery/imageLike/${eventId}`, (receivedImageLike, hash) => {
					console.log('Subscribe!');

					setImages((prev) =>
						prev.map((item) =>
							item.imageID === receivedImageLike.imageID
								? {
									...item,
									likes: receivedImageLike.likedCount,
									userLike: receivedImageLike.like,
								  }
								: item
						)
					);
					setImagesPopular((prev) =>
						prev.map((item) =>
							item.imageID === receivedImageLike.imageID
								? {
									...item,
									likes: receivedImageLike.likedCount,
									userLike: receivedImageLike.like,
								  }
								: item
						)
					);
				});
				client.onclose = () => {
					console.log('Client disconnected');
				};
			},
			(error) => {
				setConnected(false);
			}
		);
	};

	const deleteImage = (mex) => {
		if (!stompClient || !connected || !stompClient.connected) {
			console.log('Not connected to WebSocket');
			alert('Ops, qualcosa è andato storto');
			navigate('/home');
			return;
		}
		let user = JSON.parse(sessionStorage.getItem('user'));
		const galleryImage = {
			deletedBy: user.username,
			eventID: eventId,
			imageID: mex.imageID,
			magicEventTag: user.magicEventTag.toString(),
		};
		try {
			send(
				stompClient,
				`/app/gallery/deleteImage/${eventId}`,
				{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
				JSON.stringify(galleryImage)
			);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	const sendImage = (title, image) => {
		if (!stompClient || !connected || !stompClient.connected) {
			console.log('Not connected to WebSocket');
			alert('Ops, qualcosa è andato storto');
			navigate('/home');
			return;
		}

		let user = JSON.parse(sessionStorage.getItem('user'));
		const galleryImage = {
			title: title,
			uploadedBy: user.username,
			base64Image: image,
			dateTime: new Date().toISOString(),
			eventID: eventId,
			magicEventTag: user.magicEventTag.toString(),
		};
		try {
			send(
				stompClient,
				`/app/gallery/sendImage/${eventId}`,
				{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
				JSON.stringify(galleryImage)
			);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	const likeImage = (image) => {
		if (!stompClient || !connected || !stompClient.connected) {
			console.log('Not connected to WebSocket');
			alert('Ops, qualcosa è andato storto');
			navigate('/home');
			return;
		}
		let user = JSON.parse(sessionStorage.getItem('user'));
		const galleryImage = {
			userMagicEventsTag: user.magicEventTag.toString(),
			like: !image.userLike,
			imageID: image.imageID,
			eventID: eventId,
			likedCount: 0,
		};

		try {
			send(
				stompClient,
				`/app/gallery/imageLike/${eventId}`,
				{ Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` },
				JSON.stringify(galleryImage)
			);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	function openImage(image) {
		setImagePopup(image.base64Image);
		setTitlePopup(image.title);
		setOpenPopup(true);
	}

	const downloadImage = () => {
		const link = document.createElement('a');
		link.href = 'data:image/png;base64,' + imagePopup;
		link.download = (titlePopup || 'image') + '.png';
		link.click();
	};

	return loading ? (
		<LoadingContainer />
	) : (
		<div className="min-h-screen bg-gradient-to-br from-[#505458] to-[#363540] p-4 sm:p-6">
			{/* Header */}
			<div className="mb-6 sm:mb-8">
				<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<Button 
							onClick={() => navigate('/' + eventId)} 
							custom="!bg-[#363540] !text-white hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-3"
							text={<FontAwesomeIcon icon={faArrowLeft} />}
						/>
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-1">
								{title || 'Galleria Evento'}
							</h1>
							<p className="text-[#1a1a1a] text-opacity-70 text-sm sm:text-base">Condividi i tuoi momenti speciali</p>
						</div>
					</div>
				</div>
			</div>

			{/* Popular Images Section */}
			<div className="mb-8">
				<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-xl p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-8 h-8 bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] rounded-full flex items-center justify-center">
							<FontAwesomeIcon icon={faHeart} className="text-white text-sm" />
						</div>
						<h2 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a]">Immagini Popolari</h2>
					</div>
					<ImageList
						isAdmin={isAdminVar}
						displayOnloadMore={!messageFinishp}
						onLoadMore={loadMorep}
						onClickImage={(img) => openImage(img)}
						onLike={(img) => likeImage(img)}
						onDelete={(img) => deleteImage(img)}
						images={imagesPopular}
					/>
				</div>
			</div>

			{/* All Images Section */}
			<div className="mb-8">
				<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-xl p-6">
					<h2 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] mb-6">Tutte le Immagini</h2>
					<ImageGrid
						isAdmin={isAdminVar}
						displayOnloadMore={!messageFinish}
						onLoadMore={loadMore}
						onClickImage={(img) => openImage(img)}
						onLike={(img) => likeImage(img)}
						onDelete={(img) => deleteImage(img)}
						images={images}
					/>
				</div>
			</div>

			 {/* Floating Drag and Drop Component */}
			<div className="fixed bottom-6 right-6 z-40">
				<ImageDrop onSend={(title, image) => sendImage(title, image)}/>
			</div>

			{/* Enhanced Image Popup */}
			<div
				className={clsx({
					'fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4': openPopup,
					'hidden': !openPopup,
				})}
				onClick={() => setOpenPopup(false)}
			>
				<div
					className="relative max-w-4xl max-h-[90vh] w-full bg-[#363540] rounded-2xl overflow-hidden shadow-2xl"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Image */}
					<div className="relative">
						<img
							className="w-full h-auto max-h-[70vh] object-contain"
							src={'data:image/*;base64,' + imagePopup}
							alt="Gallery image"
						/>
						
						{/* Action buttons */}
						<div className="absolute top-4 right-4 flex gap-2">
							<Button
								onClick={downloadImage}
								custom="!bg-[#505458] !text-[#E4DCEF] hover:!bg-[#EE0E51] transition-all duration-300 !rounded-full !p-3 !border-none"
								text={<FontAwesomeIcon icon={faDownload} />}
							/>
							<Button
								onClick={() => setOpenPopup(false)}
								custom="!bg-[#505458] !text-[#E4DCEF] hover:!bg-red-500 transition-all duration-300 !rounded-full !p-3 !border-none"
								text={<FontAwesomeIcon icon={faClose} />}
							/>
						</div>
					</div>

					{/* Image Title */}
					<div className="p-6">
						<h3 className="text-xl font-semibold text-[#E4DCEF] leading-relaxed">
							{titlePopup || 'Senza titolo'}
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GalleryPage;

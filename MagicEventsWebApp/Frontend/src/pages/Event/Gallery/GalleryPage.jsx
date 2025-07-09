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
import { faArrowLeft, faBackspace, faBackward, faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import ImageDropImage from '../../../components/popup/ImageDropImage';
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

	const galleryUrl = url === 'localhost' ? `https://${url}:8085` : `https://${url}/api/galleries`;

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
			{},
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
					console.log('Client disconesso');
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
			magiceventstag: user.magicEventTag.toString(),
		};
		try {
			send(stompClient, `/app/gallery/deleteImage/${eventId}`, galleryImage);
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
			magiceventstag: user.magicEventTag.toString(),
		};
		try {
			send(stompClient, `/app/gallery/sendImage/${eventId}`, galleryImage);
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
			send(stompClient, `/app/gallery/imageLike/${eventId}`, galleryImage);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	};

	function openImage(image) {
		setImagePopup(image.base64Image);
		setTitlePopup(image.title);
		setOpenPopup(true);
	}

	return loading ? (
		<LoadingContainer />
	) : (
		<div className="h-full  bg-[#363540]  bg-gradient-to-r   p-2 to-[#363540] gap-1 from-[#E4DCEF] flex flex-col overflow-y-auto ">
			<div className=" mt-4  flex items-center flex-row gap-2  h-fit rounded-r-2xl text-[#363540] p-4 max-sm:hidden ">
				<Button onClick={() => navigate('/' + eventId)} text={<FontAwesomeIcon icon={faArrowLeft} />}></Button>
				<h1 className="font-bold text-2xl">{title ? title : 'Nessun titolo'}</h1>
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
			<h1>Galleria</h1>
			<ImageGrid
				isAdmin={isAdminVar}
				displayOnloadMore={!messageFinish}
				onLoadMore={loadMore}
				onClickImage={(img) => openImage(img)}
				onLike={(img) => likeImage(img)}
				onDelete={(img) => deleteImage(img)}
				images={images}
			/>
			<ImageDropImage onSend={(title, image) => sendImage(title, image)} />
			{/* Popup image open */}
			<div
				className={clsx({
					'absolute p-4  top-0 left-0 bg-[#363540]/20 backdrop-blur-[4px]  h-full w-full flex max-sm:flex-col items-center justify-center ':
						openPopup,
					hidden: !openPopup,
				})}
			>
				<div className="sm:h-full max-sm:h-[calc(100%-5.5rem)]">
					<img
						className="aspect-4/5 object-cover h-full  rounded-sm "
						src={'data:image/*;base64,' + imagePopup}
						alt="test"
					/>
				</div>
				<p className="text-lg text-[#E4DCEF] max-sm:w-full bg-[#363540] rounded-md p-4 sm:w-max sm:max-w-80 text-ellipsis max-sm:line-clamp-2 max-sm:h-[4.89rem]   ">
					{titlePopup}
				</p>
				<Button
					onClick={() => setOpenPopup(false)}
					custom="absolute top-4 right-4"
					text={<FontAwesomeIcon icon={faClose} />}
				></Button>
			</div>
		</div>
	);
};

export default GalleryPage;

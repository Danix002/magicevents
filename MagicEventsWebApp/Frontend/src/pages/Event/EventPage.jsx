import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getEvent, getEventService } from '../../api/eventAPI';
import { getImagesPopular } from '../../api/galleryAPI';
import Image from '../../components/images-component/Image';
import ImageList from '../../components/lists/ImageList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowRight,
	faClipboard,
	faClose,
	faGamepad,
	faImage,
	faMap,
	faMessage,
	faUsers,
	faCalendarDays,
	faMapMarkerAlt,
	faHeart,
	faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import ErrorContainer from '../../components/error/ErrorContainer';
import { convertDataTime } from '../../utils/dataFormatter';
import { setAdmin, isAdmin } from '../../utils/utils';
import Button from '../../components/buttons/Button';
import clsx from 'clsx';
import LoadingContainer from '../../components/error/LoadingContainer';
import QRCodeGenerator from "../../components/buttons/qrGeneratorButton";

const EventsPage = () => {
	const { eventId } = useParams();
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [eventServices, setEventServices] = useState(null);
	const [popularImages, setPopularImages] = useState([]);
	const [lat, setLat] = useState(0);
	const [lng, setLng] = useState(0);
	const [openPopup, setOpenPopup] = useState(false);
	const [popupImage, setPopupImage] = useState('');
	const [popupTitle, setPopupTitle] = useState('');
	const [isAdminVar, setIsAdminVar] = useState(false);

	useEffect(() => {
		async function fetchAPI() {
			const res = await getEvent(eventId);
			if (!res.ok) {
				setEvent(null);
				return;
			}
			const data = await res.json();

			if (data.admins.includes(JSON.parse(sessionStorage.getItem('user')).email)) {
				setAdmin(eventId);
				setIsAdminVar(true);
			}

			if (data.creator === JSON.parse(sessionStorage.getItem('user')).magicEventTag) {
				setAdmin(eventId);
				setIsAdminVar(true);
			}

			setEvent(data);
			if (data.location) {
				const coordinates = data.location.split('-');
				setLat(Number(coordinates[0]));
				setLng(Number(coordinates[1]));
			}
			setLoading(false);
		}

		async function fetchAPIServices() {
			const res = await getEventService(eventId);
			if (!res.ok) {
				setEventServices(null);
				return;
			}
			const data = await res.json();
			setEventServices(data);
		}

		async function fetchPopularImages() {
			try {
				const res = await getImagesPopular(eventId, 0);
				if (res.ok) {
					const data = await res.json();
					setPopularImages(data.images.slice(0, 6)); // Show only first 6 images
				}
			} catch (error) {
				console.error('Error fetching popular images:', error);
			}
		}

		fetchAPI();
		fetchAPIServices();
		fetchPopularImages();
	}, [eventId]);

	const openImagePopup = (image, title) => {
		setPopupImage(image);
		setPopupTitle(title);
		setOpenPopup(true);
	};

	const downloadImage = () => {
		// Convert base64 to PNG
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new window.Image();
		
		img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			
			canvas.toBlob((blob) => {
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = (popupTitle || 'image') + '.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}, 'image/png');
		};
		
		img.src = 'data:image/*;base64,' + popupImage;
	};

	return !event ? (
		loading ? (
			<LoadingContainer />
		) : (
			<ErrorContainer errorMessage={'Nessun evento trovato'} to="/home" />
		)
	) : (
		<div className="h-full bg-gradient-to-br from-[#505458] to-[#363540] overflow-hidden flex">
			<QRCodeGenerator isAdmin={isAdminVar}></QRCodeGenerator>
			
			{/* Fixed Sidebar */}
			<div className="hidden lg:block w-80 bg-[#363540] border-r border-[#E4DCEF]/20 overflow-y-auto">
				<div className="p-6">
					<h2 className="text-xl font-bold text-[#E4DCEF] mb-6">Informazioni Evento</h2>
					
					{/* Participants Section */}
					<div className="mb-8">
						<h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E4DCEF]">
							<FontAwesomeIcon icon={faUsers} className="text-[#EE0E51]" />
							Partecipanti ({event.partecipants.length + event.admins.length})
						</h3>
						
						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-[#E4DCEF] mb-2">Partecipanti ({event.partecipants.length})</h4>
								<div className="max-h-32 overflow-y-auto space-y-2">
									{event.partecipants.map((p, index) => (
										<div key={index} className="bg-[#505458] rounded-lg p-2 flex items-center gap-2">
											<div className="w-6 h-6 bg-[#EE0E51] rounded-full flex items-center justify-center text-white font-bold text-xs">
												{p.charAt(0).toUpperCase()}
											</div>
											<span className="text-[#E4DCEF] text-sm">{p}</span>
										</div>
									))}
								</div>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-[#E4DCEF] mb-2">Amministratori ({event.admins.length})</h4>
								<div className="max-h-32 overflow-y-auto space-y-2">
									{event.admins.map((p, index) => (
										<div key={index} className="bg-[#505458] rounded-lg p-2 flex items-center gap-2">
											<div className="w-6 h-6 bg-gradient-to-r from-[#EE0E51] to-[#ff4574] rounded-full flex items-center justify-center text-white font-bold text-xs">
												{p.charAt(0).toUpperCase()}
											</div>
											<span className="text-[#E4DCEF] text-sm">{p}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Map Section */}
					{event.location && (
						<div className="mb-8">
							<h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E4DCEF]">
								<FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#EE0E51]" />
								Posizione
							</h3>
							<div className="border-2 border-[#E4DCEF]/20 rounded-lg overflow-hidden">
								<APIProvider apiKey={'AIzaSyCsKyFbFFxOb4S8luivSquBE4Y3t36rznI'}>
									<Map
										key={lat + '--' + lng}
										style={{ width: '100%', height: '200px' }}
										defaultCenter={{ lat: lat, lng: lng }}
										defaultZoom={15}
										gestureHandling={'greedy'}
										disableDefaultUI={true}
									>
										<Marker position={{ lat: lat ? lat : 0, lng: lng ? lng : 0 }} />
									</Map>
								</APIProvider>
							</div>
						</div>
					)}

					{/* Services Section */}
					<div className="mb-8">
						<h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#E4DCEF]">
							<FontAwesomeIcon icon={faClipboard} className="text-[#EE0E51]" />
							Servizi ({eventServices ? Object.values(eventServices).filter(Boolean).length : 0})
						</h3>
						
						{eventServices ? (
							<div className="space-y-2">
								{eventServices.board && (
									<NavLink to={`/${eventId}/board`} className="block">
										<div className="bg-[#505458] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between group">
											<div className="flex items-center gap-3">
												<FontAwesomeIcon icon={faMessage} className="text-[#EE0E51] group-hover:text-white text-sm" />
												<span className="text-[#E4DCEF] group-hover:text-white text-sm">Bacheca</span>
											</div>
											<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] group-hover:text-white text-sm" />
										</div>
									</NavLink>
								)}
								{eventServices.gallery && (
									<NavLink to={`/${eventId}/gallery`} className="block">
										<div className="bg-[#505458] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between group">
											<div className="flex items-center gap-3">
												<FontAwesomeIcon icon={faImage} className="text-[#EE0E51] group-hover:text-white text-sm" />
												<span className="text-[#E4DCEF] group-hover:text-white text-sm">Galleria</span>
											</div>
											<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] group-hover:text-white text-sm" />
										</div>
									</NavLink>
								)}
								{eventServices.guestGame && (
									<NavLink to={`/${eventId}/game`} className="block">
										<div className="bg-[#505458] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between group">
											<div className="flex items-center gap-3">
												<FontAwesomeIcon icon={faGamepad} className="text-[#EE0E51] group-hover:text-white text-sm" />
												<span className="text-[#E4DCEF] group-hover:text-white text-sm">Mystery Guest Game</span>
											</div>
											<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] group-hover:text-white text-sm" />
										</div>
									</NavLink>
								)}
							</div>
						) : (
							<div className="text-center py-4">
								<FontAwesomeIcon icon={faClipboard} className="text-2xl text-[#E4DCEF] opacity-50 mb-2" />
								<p className="text-[#E4DCEF] text-sm">Errore nel caricamento</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-4 md:p-6">
					<div className="max-w-4xl mx-auto">
						{/* Event Image */}
						<div className="mb-6">
							<div className="relative rounded-2xl overflow-hidden shadow-2xl">
								<Image onClick={() => openImagePopup(event.image, event.title)} src={event.image} />
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
							</div>
						</div>

						{/* Event Info Card */}
						<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
							<h1 className="text-3xl md:text-4xl font-bold text-[#363540] mb-4">{event.title}</h1>

							<div className="bg-[#363540] border border-[#E4DCEF] border-opacity-20 rounded-xl p-4 mb-6">
								<p className="text-[#E4DCEF] leading-relaxed">{event.description}</p>
							</div>

							{/* Date Section */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#363540] bg-opacity-50 rounded-xl">
								<div className="flex items-center gap-2 text-[#E4DCEF] font-semibold">
									<FontAwesomeIcon icon={faCalendarDays} className="text-[#EE0E51]" />
									<span>Durata evento:</span>
								</div>

								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
									<div className="bg-[#E4DCEF] text-[#363540] rounded-full px-4 py-2 font-bold text-center">
										{convertDataTime(event.starting)}
									</div>
									<FontAwesomeIcon
										icon={faArrowRight}
										className="text-[#EE0E51] text-xl hidden sm:block"
									/>
									<div className="bg-[#E4DCEF] text-[#363540] rounded-full px-4 py-2 font-bold text-center">
										{convertDataTime(event.ending)}
									</div>
								</div>
							</div>
						</div>

						{/* Mobile Sidebar - Collapsible sections */}
						<div className="lg:hidden space-y-4 mb-6">
							{/* Mobile Participants */}
							<details className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-xl">
								<summary className="p-4 cursor-pointer text-[#363540] font-semibold flex items-center gap-2">
									<FontAwesomeIcon icon={faUsers} className="text-[#EE0E51]" />
									Partecipanti ({event.partecipants.length + event.admins.length})
								</summary>
								<div className="p-4 pt-0 space-y-3">
									<div>
										<h4 className="text-sm font-medium text-[#363540] mb-2">Partecipanti</h4>
										<div className="space-y-2 max-h-32 overflow-y-auto">
											{event.partecipants.map((p, index) => (
												<div key={index} className="bg-[#363540] rounded-lg p-2 flex items-center gap-2">
													<div className="w-6 h-6 bg-[#EE0E51] rounded-full flex items-center justify-center text-white font-bold text-xs">
														{p.charAt(0).toUpperCase()}
													</div>
													<span className="text-[#E4DCEF] text-sm">{p}</span>
												</div>
											))}
										</div>
									</div>
									<div>
										<h4 className="text-sm font-medium text-[#363540] mb-2">Amministratori</h4>
										<div className="space-y-2">
											{event.admins.map((p, index) => (
												<div key={index} className="bg-[#363540] rounded-lg p-2 flex items-center gap-2">
													<div className="w-6 h-6 bg-gradient-to-r from-[#EE0E51] to-[#ff4574] rounded-full flex items-center justify-center text-white font-bold text-xs">
														{p.charAt(0).toUpperCase()}
													</div>
													<span className="text-[#E4DCEF] text-sm">{p}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</details>

							{/* Mobile Services */}
							<details className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-xl">
								<summary className="p-4 cursor-pointer text-[#363540] font-semibold flex items-center gap-2">
									<FontAwesomeIcon icon={faClipboard} className="text-[#EE0E51]" />
									Servizi ({eventServices ? Object.values(eventServices).filter(Boolean).length : 0})
								</summary>
								<div className="p-4 pt-0">
									{eventServices && (
										<div className="space-y-2">
											{eventServices.board && (
												<NavLink to={`/${eventId}/board`} className="block">
													<div className="bg-[#363540] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between">
														<div className="flex items-center gap-3">
															<FontAwesomeIcon icon={faMessage} className="text-[#EE0E51] text-sm" />
															<span className="text-[#E4DCEF] text-sm">Bacheca</span>
														</div>
														<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] text-sm" />
													</div>
												</NavLink>
											)}
											{eventServices.gallery && (
												<NavLink to={`/${eventId}/gallery`} className="block">
													<div className="bg-[#363540] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between">
														<div className="flex items-center gap-3">
															<FontAwesomeIcon icon={faImage} className="text-[#EE0E51] text-sm" />
															<span className="text-[#E4DCEF] text-sm">Galleria</span>
														</div>
														<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] text-sm" />
													</div>
												</NavLink>
											)}
											{eventServices.guestGame && (
												<NavLink to={`/${eventId}/game`} className="block">
													<div className="bg-[#363540] hover:bg-[#EE0E51] transition-colors rounded-lg p-3 flex items-center justify-between">
														<div className="flex items-center gap-3">
															<FontAwesomeIcon icon={faGamepad} className="text-[#EE0E51] text-sm" />
															<span className="text-[#E4DCEF] text-sm">Mystery Guest Game</span>
														</div>
														<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] text-sm" />
													</div>
												</NavLink>
											)}
										</div>
									)}
								</div>
							</details>
						</div>

						{/* Popular Images Section */}
						{popularImages.length > 0 && (
							<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] rounded-full flex items-center justify-center">
											<FontAwesomeIcon icon={faHeart} className="text-white text-sm" />
										</div>
										<h2 className="text-xl sm:text-2xl font-semibold text-[#363540]">Immagini Popolari</h2>
									</div>
									{eventServices?.gallery && (
										<NavLink to={`/${eventId}/gallery`}>
											<Button
												text="Vedi tutte"
												custom="text-sm px-4 py-2"
											/>
										</NavLink>
									)}
								</div>
								<ImageList
									isAdmin={isAdminVar}
									displayOnloadMore={false}
									onClickImage={(img) => openImagePopup(img.base64Image, img.title)}
									images={popularImages}
								/>
							</div>
						)}
					</div>
				</div>
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
							src={'data:image/*;base64,' + popupImage}
							alt="Event image"
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
							{popupTitle || 'Senza titolo'}
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventsPage;

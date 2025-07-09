import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getEvent, getEventService } from '../../api/eventAPI';
import Image from '../../components/images-component/Image';
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
} from '@fortawesome/free-solid-svg-icons';
import Menu from '../../components/navigation/Menu';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import ErrorContainer from '../../components/error/ErrorContainer';
import { convertDataTime } from '../../utils/dataFormatter';
import { setAdmin } from '../../utils/utils';
import Button from '../../components/buttons/Button';
import clsx from 'clsx';
import LoadingContainer from '../../components/error/LoadingContainer';

const EventsPage = () => {
	const { eventId } = useParams();
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [eventServices, setEventServices] = useState(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [lat, setLat] = useState(0);
	const [lng, setLng] = useState(0);
	const [openPopup, setOpenPopup] = useState(false);

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
			}

			if (data.creator === JSON.parse(sessionStorage.getItem('user')).magicEventTag) {
				setAdmin(eventId);
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

		fetchAPI();
		fetchAPIServices();
	}, [eventId]);

	return !event ? (
		loading ? (
			<LoadingContainer />
		) : (
			<ErrorContainer errorMessage={'Nessun evento trovato'} to="/home" />
		)
	) : (
		<div className="h-full bg-gradient-to-br from-[#505458] to-[#363540] overflow-y-auto relative">
			<Menu
				onClose={() => setMenuOpen(false)}
				onOpen={() => setMenuOpen(true)}
				open={menuOpen}
				tabs={[
					{
						action: faUsers,
						label: "Partecipanti",
						description: "Vedi chi partecipa all'evento",
						iconSize: "text-3xl",
						count: event.partecipants.length + event.admins.length,
						content: (
							<div className="flex flex-col gap-4 h-full">
								<div>
									<h2 className="text-xl font-bold mb-3 flex items-center gap-2">
										<FontAwesomeIcon icon={faUsers} className="text-[#EE0E51]" />
										Partecipanti ({event.partecipants.length})
									</h2>
									<div className="max-h-48 overflow-y-auto bg-[#505458] rounded-lg p-3 space-y-2">
										{event.partecipants.map((p, index) => (
											<div key={index} className="bg-[#363540] rounded-lg p-3 flex items-center gap-3">
												<div className="w-8 h-8 bg-[#EE0E51] rounded-full flex items-center justify-center text-white font-bold text-sm">
													{p.charAt(0).toUpperCase()}
												</div>
												<span className="text-[#E4DCEF]">{p}</span>
											</div>
										))}
									</div>
								</div>
								
								<div>
									<h2 className="text-xl font-bold mb-3 flex items-center gap-2">
										<FontAwesomeIcon icon={faUsers} className="text-[#EE0E51]" />
										Amministratori ({event.admins.length})
									</h2>
									<div className="max-h-48 overflow-y-auto bg-[#505458] rounded-lg p-3 space-y-2">
										{event.admins.map((p, index) => (
											<div key={index} className="bg-[#363540] rounded-lg p-3 flex items-center gap-3">
												<div className="w-8 h-8 bg-gradient-to-r from-[#EE0E51] to-[#ff4574] rounded-full flex items-center justify-center text-white font-bold text-sm">
													{p.charAt(0).toUpperCase()}
												</div>
												<span className="text-[#E4DCEF]">{p}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						),
					},
					{
						action: faMap,
						label: "Mappa",
						description: "Posizione dell'evento",
						iconSize: "text-3xl",
						available: !!event.location,
						content: event.location ? (
							<div>
								<h2 className="text-xl font-bold mb-3 flex items-center gap-2">
									<FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#EE0E51]" />
									Posizione
								</h2>
								<div className="border-2 border-[#E4DCEF] rounded-lg overflow-hidden shadow-lg">
									<APIProvider apiKey={'AIzaSyCsKyFbFFxOb4S8luivSquBE4Y3t36rznI'}>
										<Map
											key={lat + '--' + lng}
											style={{ width: '100%', height: '300px' }}
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
						) : (
							<div className="text-center py-8">
								<FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl text-[#E4DCEF] opacity-50 mb-4" />
								<p className="text-[#E4DCEF]">Nessuna posizione fornita</p>
							</div>
						),
					},
					{
						action: faClipboard,
						label: "Servizi",
						description: "Funzioni disponibili",
						iconSize: "text-3xl",
						count: eventServices ? Object.values(eventServices).filter(Boolean).length : 0,
						content: (
							<div>
								<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
									<FontAwesomeIcon icon={faClipboard} className="text-[#EE0E51]" />
									Servizi Disponibili
								</h2>
								{eventServices ? (
									<div className="space-y-3">
										{eventServices.board && (
											<NavLink to={`/${eventId}/board`} className="block">
												<div className="bg-[#505458] hover:bg-[#363540] transition-colors rounded-lg p-4 flex items-center justify-between group">
													<div className="flex items-center gap-3">
														<FontAwesomeIcon icon={faMessage} className="text-[#EE0E51] text-lg" />
														<span className="font-medium">Bacheca</span>
													</div>
													<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] opacity-50 group-hover:opacity-100 transition-opacity" />
												</div>
											</NavLink>
										)}
										{eventServices.gallery && (
											<NavLink to={`/${eventId}/gallery`} className="block">
												<div className="bg-[#505458] hover:bg-[#363540] transition-colors rounded-lg p-4 flex items-center justify-between group">
													<div className="flex items-center gap-3">
														<FontAwesomeIcon icon={faImage} className="text-[#EE0E51] text-lg" />
														<span className="font-medium">Galleria</span>
													</div>
													<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] opacity-50 group-hover:opacity-100 transition-opacity" />
												</div>
											</NavLink>
										)}
										{eventServices.guestGame && (
											<NavLink to={`/${eventId}/game`} className="block">
												<div className="bg-[#505458] hover:bg-[#363540] transition-colors rounded-lg p-4 flex items-center justify-between group">
													<div className="flex items-center gap-3">
														<FontAwesomeIcon icon={faGamepad} className="text-[#EE0E51] text-lg" />
														<span className="font-medium">Mystery Guest Game</span>
													</div>
													<FontAwesomeIcon icon={faArrowRight} className="text-[#E4DCEF] opacity-50 group-hover:opacity-100 transition-opacity" />
												</div>
											</NavLink>
										)}
									</div>
								) : (
									<div className="text-center py-8">
										<FontAwesomeIcon icon={faClipboard} className="text-4xl text-[#E4DCEF] opacity-50 mb-4" />
										<p className="text-[#E4DCEF]">Errore nel caricamento dei servizi</p>
									</div>
								)}
							</div>
						),
					},
				]}
			/>

			{/* Main Content */}
			<div className="p-4 md:p-6">
				<div className="max-w-4xl mx-auto">
					{/* Event Image */}
					<div className="mb-6">
						<div className="relative rounded-2xl overflow-hidden shadow-2xl">
							<Image onClick={() => setOpenPopup(true)} src={event.image} />
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
						</div>
					</div>

					{/* Event Info Card */}
					<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
						<h1 className="text-3xl md:text-4xl font-bold text-[#E4DCEF] mb-4">{event.title}</h1>
						
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
				</div>
			</div>

			{/* Image Popup */}
			<div
				className={clsx({
					'fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4': openPopup,
					hidden: !openPopup,
				})}
			>
				<div className="relative max-w-full max-h-full">
					<img
						className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
						src={'data:image/*;base64,' + event.image}
						alt="Event image"
					/>
					<Button
						onClick={() => setOpenPopup(false)}
						custom="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full !border-none"
						text={<FontAwesomeIcon icon={faClose} className="text-xl" />}
					/>
				</div>
			</div>
		</div>
	);
};

export default EventsPage;

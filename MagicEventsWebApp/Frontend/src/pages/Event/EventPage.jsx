import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getEvent, getEventService } from '../../api/eventAPI';
import Image from '../../components/images-component/Image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowAltCircleRight,
	faClipboard,
	faClose,
	faGamepad,
	faImage,
	faMap,
	faMessage,
	faUsers,
} from '@fortawesome/free-solid-svg-icons';
import Menu from '../../components/navigation/Menu';
import { APIProvider, Map, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
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
	const [openPopup, setOpenPopup] = useState(0);

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
				setEvent(null);
				return;
			}
			const data = await res.json();
			console.log(data);
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
		<div className="h-full text-[#E4DCEF]  p-4 flex flex-col gap-2 relative  bg-[#505458] overflow-y-auto ">
			<Menu
				onClose={() => setMenuOpen(false)}
				onOpen={() => setMenuOpen(true)}
				open={menuOpen}
				tabs={[
					{
						action: faUsers,
						content: (
							<div className="flex flex-col gap-1 h-full">
								<h1>Partecipanti</h1>
								<div className="flex flex-auto flex-col gap-1 overflow-y-auto bg-[#505458] p-1  rounded-md">
									{event.partecipants.map((p) => (
										<p className="p-2">{p}</p>
									))}
								</div>
								<h1>Admin</h1>
								<div className="flex flex-auto flex-col gap-1 overflow-y-auto bg-[#505458] p-1  rounded-md">
									{event.admins.map((p) => (
										<p className="p-2">{p}</p>
									))}
								</div>
							</div>
						),
					},
					{
						action: faMap,
						content: event.location ? (
							<div>
								<h1>Mappa</h1>
								<div className="border-[#E4DCEF] border rounded-md m-2">
									<APIProvider apiKey={'AIzaSyCsKyFbFFxOb4S8luivSquBE4Y3t36rznI'}>
										<Map
											key={lat + '--' + lng}
											style={{ width: '400px', height: '400px' }}
											defaultCenter={{ lat: lat, lng: lng }}
											onCenterChanged={(value) => console.log('Center changed:' + value.detail.center)}
											defaultZoom={15}
											gestureHandling={'greedy'}
											disableDefaultUI={true}
										>
											<Marker position={{ lat: lat ? lat : 0, lng: lng ? lng : 0 }}></Marker>
										</Map>
									</APIProvider>
								</div>
							</div>
						) : (
							<p>Nessuna location fornita</p>
						),
					},
					{
						action: faClipboard,
						content: (
							<div>
								<h1>Servizi</h1>
								{eventServices ? (
									<div>
										{eventServices.board ? (
											<NavLink to={`/${eventId}/board`}>
												<h1 className="flex justify-between gap-4 hover:underline p-2 items-center">
													<FontAwesomeIcon icon={faMessage} />
													<p>Bacheca</p>
												</h1>
											</NavLink>
										) : (
											''
										)}
										{eventServices.gallery ? (
											<NavLink to={`/${eventId}/gallery`}>
												<h1 className="flex justify-between gap-4 hover:underline p-2 items-center">
													<FontAwesomeIcon icon={faImage} />
													<p>Galleria</p>
												</h1>
											</NavLink>
										) : (
											''
										)}
										{eventServices.guestGame ? (
											<NavLink to={`/${eventId}/game`}>
												<h1 className="flex justify-between gap-4 hover:underline p-2 items-center">
													<FontAwesomeIcon icon={faGamepad} />
													<p>Mystery Guest Game</p>
												</h1>
											</NavLink>
										) : (
											''
										)}
									</div>
								) : (
									<p>Errore nel caricamenti dei servizi</p>
								)}
							</div>
						),
					},
				]}
			></Menu>
			<Image onClick={() => setOpenPopup(true)} src={event.image} />
			<h1 className=" text-xl rounded-full p-2  font-extrabold w-fit ">{event.title}</h1>
			<p className="p-4 border bg-[#363540] border-[#E4DCEF] text-[#E4DCEF] text-sm  h-fit  rounded-md">
				{event.description}
			</p>
			<div className="flex flex-row justify-between items-center">
				<p className=" font-bold">Data: </p>
				<h1 className="bg-[#E4DCEF] text-[#363540]  rounded-full p-2 m-2 font-bold w-fit ">
					{convertDataTime(event.starting)}
				</h1>
				<FontAwesomeIcon className="text-4xl" icon={faArrowAltCircleRight} color="#E4DCEF" />
				<h1 className="bg-[#E4DCEF]  text-[#363540] rounded-full p-2 m-2 font-bold w-fit ">
					{convertDataTime(event.ending)}
				</h1>
			</div>
			<div
				className={clsx({
					'absolute p-4 top-0 left-0 bg-[#363540]/20 backdrop-blur-[4px] h-full w-full flex max-sm:flex-col items-center justify-center':
						openPopup,
					hidden: !openPopup,
				})}
			>
			<div className="h-full w-full flex items-center justify-center">
				<img
					className="max-h-full max-w-full object-contain rounded-sm"
					src={'data:image/*;base64,' + event.image}
					alt="popup image"
				/>
			</div>
			<Button
				onClick={() => setOpenPopup(false)}
				custom="absolute top-4 right-4"
				text={<FontAwesomeIcon icon={faClose} />}
			></Button>
		</div>

		</div>
	);
};

export default EventsPage;

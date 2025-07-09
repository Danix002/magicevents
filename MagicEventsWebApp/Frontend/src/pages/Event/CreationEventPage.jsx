import { faClose, faGamepad, faImages, faMapMarker, faCalendarDays, faUsers, faCog } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/buttons/Button';
import ServiceCard from '../../components/card/ServiceCard';
import Input from '../../components/inputs/Input';
import InputArea from '../../components/inputs/InputArea';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { createEvent } from '../../api/eventAPI';

const CreationEventPage = () => {
	const [partecipantInput, setPartecipantInput] = useState('');
	const [adminInput, setAdminInput] = useState('');
	const [mapEnabled, setMapEnabled] = useState(false);
	const [tab, setTab] = useState('event');
	const [eventDetail, setEventDetail] = useState({
		title: '',
		description: '',
		starting: '',
		ending: '',
		location: '',
		boardEnabled: true,
		creatorEmail: JSON.parse(sessionStorage.getItem('user')).email,
		creatorMagicEventsTag: JSON.parse(sessionStorage.getItem('user')).magicEventTag,
		participants: [],
		admins: [],
		image: '',
		gameEnabled: false,
		galleryTitle: '',
		galleryEnabled: false,
		boardTitle: '',
		boardDescription: '',
		gameDescription: 'Prova ad indovinare i partecipanti',
	});

	const geocodingAPILoaded = useMapsLibrary('geocoding');
	const [geocodingService, setGeocodingService] = useState();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const imgInput = useRef(null);

	useEffect(() => {
		if (!geocodingAPILoaded) return;
		setGeocodingService(new window.google.maps.Geocoder());
	}, [geocodingAPILoaded]);

	const onLocationSet = async (address) => {
		if (!geocodingService || !address) return;
		await geocodingService.geocode({ address }, (results, status) => {
			if (results && status === 'OK') {
				if (!results[0]) {
					console.log('result non valid? ', results[0]);
					return;
				}
				setTimeout(() => {
					createEventForm((results[0].geometry.location.lat() + '-' + results[0].geometry.location.lng()).toString());
				}, 1);
			} else {
				console.log('Error with geocoding');
				setError('Nessuna location trovata, prova con un altro indirizzo');
			}
		});
	};

	function handleChange(e, name) {
		const { value } = e.target;
		setEventDetail((prev) => ({ ...prev, [name]: value }));
	}

	const handleChangeService = (name) => {
		setEventDetail((prev) => ({ ...prev, [name]: !prev[name] }));
	};

	const handleChangeImage = (e) => {
		imageUploaded(e.target.files[0]);
	};

	const handleRemoveImage = () => {
		imgInput.current.value = '';
		setEventDetail((prev) => ({ ...prev, image: '' }));
	};

	function imageUploaded(file) {
		let reader = new FileReader();
		reader.onload = function () {
			const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
			setEventDetail((prev) => ({ ...prev, image: base64String }));
		};
		reader.readAsDataURL(file);
	}

	async function handleCreate() {
		if (eventDetail.location) {
			onLocationSet(eventDetail.location);
		} else {
			createEventForm();
		}
	}

	async function createEventForm(locationCoords = '') {
		if (!eventDetail.title) {
			setError('Inserisci il titolo per evento');
			return;
		}
		if (!eventDetail.boardTitle) {
			setError('Inserisci il titolo della bacheca');
			return;
		}
		if (!eventDetail.starting || !eventDetail.ending) {
			setError('Inserisci la data di inizio e fine');
			return;
		}
		if (eventDetail.description.length < 10 || eventDetail.description.length > 255) {
			setError('La descrizione di evento deve essere almeno di 10 caratteri con un massimo di 255');
			return;
		}
		if (eventDetail.boardDescription.length < 10 || eventDetail.boardDescription.length > 255) {
			setError('La descrizione della bacheca deve essere almeno di 10 caretteri con un massimo di 255');
			return;
		}
		if (eventDetail.image.length <= 0) {
			setError("L'immagine di evento è obbligatoria");
			return;
		}
		setError('');
		setLoading(true);

		createEvent({
			...eventDetail,
			location: mapEnabled ? locationCoords : '',
		})
			.then(async (value) => {
				setLoading(false);
				const jsno = await value.json();
				if (jsno.setupSuccessful) {
					navigate('/myevents');
				}
			})
			.catch((error) => {
				setLoading(false);
				setError(error);
			});
	}

	const tabs = [
		{ id: 'event', label: 'Evento', icon: faCalendarDays },
		{ id: 'board', label: 'Bacheca', icon: faUsers },
		{ id: 'services', label: 'Servizi', icon: faCog },
		{ id: 'participants', label: 'Partecipanti', icon: faUsers },
	];

	return (
		<div className="h-full bg-gradient-to-br from-[#505458] to-[#363540] flex flex-col">
			{/* Header */}
			<div className="bg-gradient-to-r from-[#EE0E51] to-[#ff4574] p-6 shadow-lg">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-bold text-white mb-4">Crea il tuo evento</h1>
					
					{/* Tab Navigation */}
					<div className="flex flex-wrap gap-2">
						{tabs.map((tabItem) => (
							<Button
								key={tabItem.id}
								text={
									<div className="flex items-center gap-2">
										<FontAwesomeIcon icon={tabItem.icon} />
										<span className="hidden sm:inline">{tabItem.label}</span>
									</div>
								}
								onClick={() => setTab(tabItem.id)}
								custom={clsx({
									'px-4 py-2 rounded-lg font-semibold transition-all border-2': true,
									'bg-white text-[#EE0E51] border-white shadow-lg': tab === tabItem.id,
									'bg-transparent text-white border-white border-opacity-30 hover:border-opacity-50': tab !== tabItem.id,
								})}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 md:p-6">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
						{tab === 'event' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Dettagli Evento</h2>
								
								<Input
									onChange={(e) => handleChange(e, 'title')}
									value={eventDetail.title}
									label="Titolo evento"
									name="titolo"
									customClass="bg-white text-[#363540]"
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										onChange={(e) => handleChange(e, 'starting')}
										value={eventDetail.starting}
										type="datetime-local"
										label="Inizia il"
										name="starting"
										customClass="bg-white text-[#363540]"
									/>
									<Input
										onChange={(e) => handleChange(e, 'ending')}
										value={eventDetail.ending}
										type="datetime-local"
										label="Finisce il"
										name="ending"
										customClass="bg-white text-[#363540]"
									/>
								</div>

								<InputArea
									minLength={10}
									onChange={(e) => handleChange(e, 'description')}
									value={eventDetail.description}
									name="descrizione"
									label="Descrizione"
									customClass="bg-white text-[#363540]"
								/>

								<Input
									onChange={handleChangeImage}
									ref={imgInput}
									label="Immagine dell'evento"
									name="immagine"
									type="file"
									accept="image/*"
									customClass="bg-white text-[#363540]"
									rigthComponent={
										<Button
											custom="!bg-transparent !hover:bg-red-500 !hover:bg-opacity-20 !border-none mt-[0.15rem] text-red-500 hover:text-red-400"
											onClick={handleRemoveImage}
											text={<FontAwesomeIcon icon={faClose} />}
										/>
									}
								/>
							</div>
						)}

						{tab === 'board' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Configurazione Bacheca</h2>
								
								<Input
									onChange={(e) => handleChange(e, 'boardTitle')}
									value={eventDetail.boardTitle}
									label="Titolo della bacheca"
									name="titolo"
									customClass="bg-white text-[#363540]"
								/>

								<InputArea
									minLength={10}
									onChange={(e) => handleChange(e, 'boardDescription')}
									value={eventDetail.boardDescription}
									name="descrizione bacheca"
									label="Descrizione"
									customClass="bg-white text-[#363540]"
								/>
							</div>
						)}

						{tab === 'services' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Servizi Aggiuntivi</h2>
								
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<ServiceCard
										onChange={() => setMapEnabled((prev) => !prev)}
										icon={faMapMarker}
										value={mapEnabled}
										name="Mappa"
									/>
									<ServiceCard
										onChange={() => handleChangeService('galleryEnabled')}
										icon={faImages}
										value={eventDetail.galleryEnabled}
										name="Galleria"
									/>
									<ServiceCard
										onChange={() => handleChangeService('gameEnabled')}
										icon={faGamepad}
										value={eventDetail.gameEnabled}
										name="Mystery Guest Game"
									/>
								</div>

								{mapEnabled && (
									<Input
										onChange={(e) => handleChange(e, 'location')}
										value={eventDetail.location}
										label="Indirizzo"
										customClass="bg-white text-[#363540]"
										name="indirizzo"
									/>
								)}

								{eventDetail.galleryEnabled && (
									<Input
										onChange={(e) => handleChange(e, 'galleryTitle')}
										value={eventDetail.galleryTitle}
										label="Titolo galleria"
										customClass="bg-white text-[#363540]"
										name="titolo"
									/>
								)}
							</div>
						)}

						{tab === 'participants' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Gestione Partecipanti</h2>
								
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Participants */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-[#E4DCEF]">Partecipanti</h3>
										<Input
											onEnterPress={() => {
												setEventDetail((prev) => ({ ...prev, participants: [...prev.participants, partecipantInput] }));
												setPartecipantInput('');
											}}
											onChange={(e) => setPartecipantInput(e.target.value)}
											value={partecipantInput}
											customClass="bg-white text-[#363540]"
											name="email utente da invitare"
											placeholder="Inserisci email..."
										/>
										<div className="max-h-64 overflow-y-auto space-y-2">
											{eventDetail.participants.length === 0 ? (
												<p className="text-center text-[#E4DCEF] opacity-70 py-8">Nessun utente invitato</p>
											) : (
												eventDetail.participants.map((item, index) => (
													<div key={index} className="bg-[#363540] rounded-lg p-3 flex items-center justify-between">
														<span className="text-[#E4DCEF]">{item}</span>
														<Button
															onClick={() => {
																setEventDetail((prev) => ({
																	...prev,
																	participants: prev.participants.filter((p) => p !== item),
																}));
															}}
															custom="!bg-transparent text-red-400 hover:text-red-300 !border-none p-1"
															text={<FontAwesomeIcon icon={faClose} />}
														/>
													</div>
												))
											)}
										</div>
									</div>

									{/* Admins */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-[#E4DCEF]">Amministratori</h3>
										<Input
											onEnterPress={() => {
												setEventDetail((prev) => ({ ...prev, admins: [...prev.admins, adminInput] }));
												setAdminInput('');
											}}
											onChange={(e) => setAdminInput(e.target.value)}
											value={adminInput}
											customClass="bg-white text-[#363540]"
											name="email degli utenti admin"
											placeholder="Inserisci email admin..."
										/>
										<div className="max-h-64 overflow-y-auto space-y-2">
											{eventDetail.admins.length === 0 ? (
												<p className="text-center text-[#E4DCEF] opacity-70 py-8">Nessun admin invitato</p>
											) : (
												eventDetail.admins.map((item, index) => (
													<div key={index} className="bg-[#363540] rounded-lg p-3 flex items-center justify-between">
														<span className="text-[#E4DCEF]">{item}</span>
														<Button
															onClick={() => {
																setEventDetail((prev) => ({
																	...prev,
																	admins: prev.admins.filter((p) => p !== item),
																}));
															}}
															custom="!bg-transparent text-red-400 hover:text-red-300 !border-none p-1"
															text={<FontAwesomeIcon icon={faClose} />}
														/>
													</div>
												))
											)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="bg-[#363540] p-4 shadow-lg">
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
					{error && (
						<div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
							{error}
						</div>
					)}
					<div className="flex gap-4 ml-auto">
						<Button 
							onClick={() => navigate('/')} 
							text="Annulla" 
							secondary
							custom="px-6 py-3"
						/>
						<Button 
							disabled={loading} 
							onClick={handleCreate} 
							text={loading ? "Creando..." : "Crea Evento"}
							custom="px-6 py-3 font-semibold"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreationEventPage;

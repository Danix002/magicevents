import { faClose, faGamepad, faImages, faMapMarker } from '@fortawesome/free-solid-svg-icons';
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
	const [tab, setTab] = useState('services');
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

	useEffect(() => {
		if (!geocodingAPILoaded) return;
		setGeocodingService(new window.google.maps.Geocoder());
	}, [geocodingAPILoaded]);

	const onLocationSet = async (address) => {
		if (!geocodingService || !address) return; // errore o impossibile fare la chiamata

		await geocodingService.geocode({ address }, (results, status) => {
			if (results && status === 'OK') {
				if (!results[0]) {
					console.log('result non valid? ', results[0]);

					return;
				}
				// setEventDetail((prev) => ({
				// 	...prev,
				// 	location: (results[0].geometry.location.lat() + '-' + results[0].geometry.location.lng()).toString(),
				// }));
				setTimeout(() => {
					createEventForm((results[0].geometry.location.lat() + '-' + results[0].geometry.location.lng()).toString());
				}, 1);
			} else {
				console.log('Error with geocoding');
				setError('Nessuna location trovata, prova con un altro indirizzo');
			}
		});
	};

	const navigate = useNavigate();

	function handleChange(e, name) {
		const { value } = e.target;

		setEventDetail((prev) => ({ ...prev, [name]: value }));
	}

	const handleChangeService = (name) => {
		setEventDetail((prev) => ({ ...prev, [name]: !prev[name] }));
	};

	const imgInput = useRef(null);

	const handleChangeImage = (e) => {
		alert('Handled');
		imageUploaded(e.target.files[0]);
	};

	const handleRemoveImage = () => {
		imgInput.current.value = '';
		setEventDetail((prev) => ({ ...prev, image: '' }));
	};

	function imageUploaded(file) {
		let base64String = '';

		let reader = new FileReader();
		console.log('next');

		reader.onload = function () {
			base64String = reader.result.replace('data:', '').replace(/^.+,/, '');

			setEventDetail((prev) => ({ ...prev, image: base64String }));
			console.log(base64String);
		};
		reader.readAsDataURL(file);
	}

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
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
				console.log(jsno);

				if (jsno.setupSuccessful) {
					navigate('/myevents');
				}
			})
			.catch((error) => {
				setLoading(false);
				setError(error);
				alert('Finished with error');
			});
	}

	return (
		<div className="h-full bg-[#363540] flex flex-col ">
			<div className="flex-auto flex flex-row p-4 gap-2 overflow-x-auto ">
				<div className=" border border-[#E8F2FC]/60 text-[#E8F2FC] rounded-md p-4 gap-2 flex flex-col ">
					<h1 className="font-semibold mb-4">A quale evento stai pensando?</h1>
					<Input
						onChange={(e) => handleChange(e, 'title')}
						value={eventDetail.title}
						label="Titolo evento"
						name="titolo"
					/>

					<div className="flex flex-row gap-2 ">
						<Input
							onChange={(e) => handleChange(e, 'starting')}
							value={eventDetail.starting}
							type="datetime-local"
							customClassContainer="flex-auto"
							label="Inizia il"
							name="starting"
						/>
						<Input
							onChange={(e) => handleChange(e, 'ending')}
							value={eventDetail.ending}
							type="datetime-local"
							customClassContainer="flex-auto"
							label="Finisce il"
							name="ending"
						/>
					</div>
					<InputArea
						minLength={10}
						onChange={(e) => handleChange(e, 'description')}
						value={eventDetail.description}
						name="descrizione"
						label="Descrizione"
						customClass="flex-auto "
						customClassContainer="flex-auto"
					/>
					<Input
						onChange={handleChangeImage}
						ref={imgInput}
						label={'Immagine del evento'}
						name="immagine"
						type="file"
						accept="image/*"
						rigthComponent={
							<Button
								custom="!bg-transparent !hover:bg-black/50 !border-none mt-[0.15rem]"
								onClick={handleRemoveImage}
								text={<FontAwesomeIcon icon={faClose} />}
							></Button>
						}
					></Input>
				</div>
				<div className=" border border-[#E8F2FC]/60 text-[#E8F2FC] bg-[#505458] rounded-md p-4 gap-2 flex flex-col ">
					<h1 className="font-semibold mb-4">Informazioni bacheca</h1>
					<Input
						onChange={(e) => handleChange(e, 'boardTitle')}
						value={eventDetail.boardTitle}
						label="Titolo della bacheca"
						name="titolo"
					/>
					<InputArea
						minLength={10}
						onChange={(e) => handleChange(e, 'boardDescription')}
						value={eventDetail.boardDescription}
						name="descrizione bacheca"
						label="Descrizione"
						customClass="flex-auto "
						customClassContainer="flex-auto"
					/>
				</div>
				<div className=" border border-[#363540]/60 text-[#363540] bg-[#E4DCEF] flex-auto rounded-md gap-1 flex overflow-y-auto flex-col min-w-[20rem] ">
					<div className=" !mb-2  flex flex-row justify-evenly ">
						<Button
							text="Servizi"
							link
							custom={clsx({
								' !font-semibold hover:bg-current/20 p-2 w-full !text-lg !text-[#363540]': true,
								'bg-current/10 shadow-inner ': tab === 'services',
							})}
							onClick={() => setTab('services')}
						/>
						<Button
							text="Partecipanti"
							link
							custom={clsx({
								' !font-semibold hover:bg-current/20 p-2 w-full !text-lg !text-[#363540]': true,
								'bg-current/10 shadow-inner ': tab === 'users',
							})}
							onClick={() => setTab('users')}
						/>
						<Button
							text="Admins"
							link
							custom={clsx({
								' !font-semibold hover:bg-current/20 p-2 w-full !text-lg !text-[#363540]': true,
								'bg-current/10 shadow-inner ': tab === 'admins',
							})}
							onClick={() => setTab('admins')}
						/>
					</div>
					{tab === 'services' ? (
						<div className="text-[#363540] bg-[#e4dcefb7] flex-auto rounded-md px-2 gap-1 flex flex-col">
							<ServiceCard
								onChange={() => setMapEnabled((prev) => !prev)}
								icon={faMapMarker}
								value={mapEnabled}
								name="Maps"
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
							<div></div>
							{mapEnabled ? (
								<Input
									onChange={(e) => handleChange(e, 'location')}
									value={eventDetail.location}
									label="Indirizzo"
									customClass="bg-[#363540] text-[#E8F2FC]"
									name="indirizzo"
								/>
							) : (
								''
							)}
							{eventDetail.galleryEnabled ? (
								<Input
									onChange={(e) => handleChange(e, 'galleryTitle')}
									value={eventDetail.galleryTitle}
									label="Titolo galleria"
									customClass="bg-[#363540] text-[#E8F2FC]"
									name="titolo"
								/>
							) : (
								''
							)}
							{eventDetail.gameEnabled ? '' : ''}{' '}
						</div>
					) : tab === 'users' ? (
						<div className="text-[#363540] border-2 border-[#363540] p-2 bg-[#e4dcefb7] flex-auto rounded-md  gap-1 flex flex-col">
							<Input
								onEnterPress={() => {
									setEventDetail((prev) => ({ ...prev, participants: [...prev.participants, partecipantInput] }));
									setPartecipantInput('');
								}}
								onChange={(e) => setPartecipantInput(e.target.value)}
								value={partecipantInput}
								customClass="bg-[#363540] text-[#E8F2FC]"
								name="email utente da invitare"
							/>
							<div className=" h-[19rem] flex flex-col gap-1 overflow-y-auto">
								{eventDetail.participants.length === 0 ? <p className="text-center">Nessun utente invitato</p> : ''}
								{eventDetail.participants.map((item) => (
									<div className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center ">
										<p>{item}</p>

										<Button
											onClick={() => {
												setEventDetail((prev) => ({
													...prev,
													participants: prev.participants.filter((p) => p !== item),
												}));
											}}
											link
											custom="cursor-pointer"
											text={<FontAwesomeIcon icon={faClose} />}
										></Button>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="text-[#363540] border-2 border-[#363540] p-2 bg-[#e4dcefb7] flex-auto rounded-md  gap-1 flex flex-col">
							<Input
								onEnterPress={() => {
									setEventDetail((prev) => ({ ...prev, admins: [...prev.admins, adminInput] }));
									setAdminInput('');
								}}
								onChange={(e) => setAdminInput(e.target.value)}
								value={adminInput}
								customClass="bg-[#363540] text-[#E8F2FC]"
								name="email degli utenti admin"
							/>
							<div className=" h-[19rem] flex flex-col gap-1 overflow-y-auto">
								{eventDetail.admins.length === 0 ? (
									<p className="text-center">Nessun utente invitato come admin</p>
								) : (
									''
								)}
								{eventDetail.admins.map((item) => (
									<div className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center">
										<p>{item}</p>
										<Button
											onClick={() => {
												setEventDetail((prev) => ({
													...prev,
													admins: prev.admins.filter((p) => p !== item),
												}));
											}}
											link
											custom="cursor-pointer"
											text={<FontAwesomeIcon icon={faClose} />}
										></Button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="flex flex-row gap-4 items-center p-4 justify-end px-8">
				<p className="text-[#EE0E51]">{error}</p>
				<Button onClick={() => navigate('/')} text="Annulla" secondary></Button>
				<Button disabled={loading} onClick={handleCreate} text="Crea Evento"></Button>
			</div>
		</div>
	);
};

export default CreationEventPage;

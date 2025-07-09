import { faClose } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/buttons/Button';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	getEvent,
	updatePartecipants,
	updateAdmins,
	removePartecipant,
	removeAdmin,
	modifyEvent,
} from '../../api/eventAPI';
import ErrorContainer from '../../components/error/ErrorContainer';
import Input from '../../components/inputs/Input';
import ImageEdit from '../../components/images-component/ImageEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { convertDataTime } from '../../utils/dataFormatter';
import LoadingContainer from '../../components/error/LoadingContainer';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const ModifyEventPage = () => {
	const navigate = useNavigate();
	const user = JSON.parse(sessionStorage.getItem('user'));
	const magicEventsTag = user?.magicEventTag;

	const { eventId } = useParams();
	const [event, setEvent] = useState(null);
	const [partecipantInput, setPartecipantInput] = useState('');
	const [adminInput, setAdminInput] = useState('');
	const [lat, setLat] = useState(0);
	const [lng, setLng] = useState(0);
	const [loading, setLoading] = useState(true);
	const [eventDetail, setEventDetail] = useState({
		title: '',
		description: '',
		starting: '',
		ending: '',
		location: '',
		image: '',
		participants: [],
		admins: [],
	});

	const [eventModified, setEventModified] = useState({
		creator: magicEventsTag,
		title: '',
		description: '',
		starting: '',
		ending: '',
		location: '',
		image: '',
		participants: [],
		admins: [],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setEventDetail((prev) => ({ ...prev, [name]: value }));
	};

	const imgInput = useRef(null);
	const [editingImage, setEditingImage] = useState(false);

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

		reader.onload = function () {
			base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
			setEventDetail((prev) => ({ ...prev, image: base64String }));
			console.log(base64String);
		};
		reader.readAsDataURL(file);
	}

	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		setEventModified({
			creator: magicEventsTag,
			title: eventDetail.title !== '' ? eventDetail.title : event?.title || '',
			description: eventDetail.description !== '' ? eventDetail.description : event?.description || '',
			starting: eventDetail.starting !== '' ? eventDetail.starting : event?.starting || '',
			ending: eventDetail.ending !== '' ? eventDetail.ending : event?.ending || '',
			location: eventDetail.location !== '' ? eventDetail.location : event?.location || '',
			image: eventDetail.image !== '' ? eventDetail.image : event?.image || '',
			partecipants: event?.partecipants || [],
			admins: event?.admins || [],
		});
	}, [event, eventDetail]);

	useEffect(() => {
		async function fetchAPI() {
			const res = await getEvent(eventId);
			if (!res.ok) {
				setEvent(null);
				return;
			}
			const data = await res.json();
			console.log(data);
			setEvent(data);
			if (data.location) {
				const coordinates = data.location.split('-');
				setLat(Number(coordinates[0]));
				setLng(Number(coordinates[1]));
			}
			setLoading(false);
		}

		fetchAPI();
	}, [eventId]);

	return !event ? (
		loading ? (
			<LoadingContainer />
		) : (
			<ErrorContainer errorMessage={'Nessun evento trovato'} to="/home" />
		)
	) : (
		<div className="h-full overflow-y-auto bg-[#505458] p-4 text-[#E4DCEF]">
			<ImageEdit src={event.image} alt={event.title} onEditClick={() => setEditingImage(true)} />
			{editingImage && (
				<div className="py-4">
					<Input
						onChange={handleChangeImage}
						ref={imgInput}
						label={'Modifica immagine'}
						name="immagine"
						type="file"
						accept="image/*"
						rigthComponent={
							<Button
								custom="!bg-transparent !hover:bg-black/50 !border-none mt-[0.15rem]"
								onClick={() => {
									handleRemoveImage();
									setEditingImage(false);
								}}
								text={<FontAwesomeIcon icon={faClose} className="text-black" />}
							/>
						}
					/>
				</div>
			)}

			<div className="py-4">
				<label htmlFor="title" className="text-2xl font-bold mb-1 block">
					Titolo
				</label>
				<input
					type="text"
					name="title"
					value={eventDetail.title}
					placeholder={event.title}
					onChange={handleChange}
					className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
					required
				/>
			</div>

			<div className="py-4">
				<label htmlFor="title" className="text-1xl font-bold mb-1 block">
					Descrizione
				</label>
				<input
					type="text"
					name="description"
					value={eventDetail.description}
					placeholder={event.description}
					onChange={handleChange}
					className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
					required
				/>
			</div>

			<div className="py-4">
				<label htmlFor="title" className="text-1xl font-bold mb-1 block">
					Data
				</label>
				<p>Inizio: {convertDataTime(event.starting)}</p>
				<p>Fine: {convertDataTime(event.ending)}</p>
				<div className="flex flex-row justify-between items-center py-4">
					<div className="flex flex-row gap-2 ">
						<Input
							onChange={handleChange}
							value={eventDetail.starting}
							type="datetime-local"
							customClassContainer="flex-auto"
							label="Inizia il"
							name="starting"
						/>
						<Input
							onChange={handleChange}
							value={eventDetail.ending}
							type="datetime-local"
							customClassContainer="flex-auto"
							label="Finisce il"
							name="ending"
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-row  justify-center">
				<Button
					text="Conferma modifiche"
					onClick={async () => {
						setError(null);
						setMessage(null);
						try {
							if (eventModified.description.length < 10 || eventModified.description.length > 255) {
								setError('La descrizione di evento deve essere almeno di 10 caretteri con un massimo di 255');
								return;
							}
							const res = await modifyEvent(eventId, eventModified);
							if (res === 'Error' || res.status != 200) {
								setError('Errore durante la modifica dei dati :(');
							} else {
								setMessage('Modifica riuscita');
							}
							navigate(`/${eventId}`);
						} catch (err) {
							setError(err.message);
						}
					}}
				></Button>
			</div>
			{message && <p className="text-green-600 text-sm">{message}</p>}
			{error && <p className="text-red-600 text-sm">{error}</p>}
			<div className="h-[50rem] flex-col gap-4 max-h-[80vh] p-2">
				<h1>Partecipanti</h1>

				<div className="h-[10rem] overflow-y-auto bg-[#505458] p-1 rounded-md space-y-2">
					{event.partecipants.map((p) => (
						<div
							key={`participant-${p}`}
							className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center"
						>
							<p className="p-2">{p}</p>
							<Button
								custom={clsx({ hidden: p === JSON.parse(sessionStorage.getItem('user')).email })}
								onClick={async () => {
									setError(null);
									setMessage(null);
									try {
										const res = await removePartecipant(eventId, p);
										if (res === 'Error' || res.status !== 200) {
											setError('Errore durante la cancellazione :(');
										} else {
											setMessage('Modifica riuscita');
											setEvent((prev) => ({ ...prev, partecipants: prev.partecipants.filter((item) => item !== p) }));
										}
									} catch (err) {
										setError(err.message);
									}
								}}
								link
								text={<FontAwesomeIcon icon={faClose} />}
							></Button>
						</div>
					))}
				</div>

				<div className="text-[#363540] border-2 border-[#363540] p-2 bg-[#e4dcefb7] rounded-md gap-1 flex flex-col">
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
					<div className="h-[10rem] flex flex-col gap-1 overflow-y-auto">
						{eventDetail.participants.length === 0 ? <p className="text-center">Nessun utente aggiunto</p> : ''}
						{eventDetail.participants.map((item) => (
							<div
								key={item}
								className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center"
							>
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

					<Button
						text="Aggiungi partecipanti"
						onClick={async () => {
							setError(null);
							setMessage(null);
							try {
								const res = await updatePartecipants(eventId, eventDetail.participants);
								if (res === 'Error' || res.status != 200) {
									setError('Errore durante la modifica dei partecipanti :(');
								} else {
									setMessage('Modifica riuscita');
								}
								navigate(`/${eventId}`);
							} catch (err) {
								setError(err.message);
							}
						}}
					></Button>

					{message && <p className="text-green-600 text-sm">{message}</p>}
					{error && <p className="text-red-600 text-sm">{error}</p>}
				</div>

				<h1>Amministratori</h1>

				<div className="h-[10rem] overflow-y-auto bg-[#505458] p-1 rounded-md space-y-2">
					{event.admins.map((p) => (
						<div
							key={`admin-${p}`}
							className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center"
						>
							<p className="p-2">{p}</p>
							<Button
								onClick={async () => {
									setError(null);
									setMessage(null);
									try {
										const res = await removeAdmin(eventId, p);
										if (res === 'Error' || res.status != 200) {
											setError('Errore durante la cancellazione :(');
										} else {
											setMessage('Modifica riuscita');
										}
									} catch (err) {
										setError(err.message);
									}
								}}
								link
								custom="cursor-pointer"
								text={<FontAwesomeIcon icon={faClose} />}
							></Button>
						</div>
					))}
				</div>

				<div className="text-[#363540] border-2 border-[#363540] p-2 bg-[#e4dcefb7] rounded-md gap-1 flex flex-col">
					<Input
						onEnterPress={() => {
							setEventDetail((prev) => ({ ...prev, admins: [...prev.admins, adminInput] }));
							setAdminInput('');
						}}
						onChange={(e) => setAdminInput(e.target.value)}
						value={adminInput}
						customClass="bg-[#363540] text-[#E8F2FC]"
						name="email utente da invitare come amministratori"
					/>
					<div className="h-[10rem] flex flex-col gap-1 overflow-y-auto">
						{eventDetail.admins.length === 0 ? <p className="text-center">Nessun utente aggiunto</p> : ''}
						{eventDetail.admins.map((item) => (
							<div
								className="p-2 flex flex-row items-center justify-between px-8 bg-[#363540]/75 text-[#E8F2FC] rounded-full text-center"
								key={item}
							>
								<p>{item}</p>
								<Button
									onClick={() => {
										setEventDetail((prev) => ({
											...prev,
											admins: prev.admins.filter((a) => a !== item),
										}));
									}}
									link
									custom="cursor-pointer"
									text={<FontAwesomeIcon icon={faClose} />}
								></Button>
							</div>
						))}
					</div>
					<Button
						text="Aggiungi amministratori"
						onClick={async () => {
							setError(null);
							setMessage(null);
							try {
								const res = await updateAdmins(eventId, eventDetail.admins);
								if (res === 'Error' || res.status != 200) {
									setError('Errore durante la modifica degli amministratori :(');
								} else {
									setMessage('Modifica riuscita');
								}
								navigate(`/${eventId}`);
							} catch (err) {
								setError(err.message);
							}
						}}
					></Button>
					{message && <p className="text-green-600 text-sm">{message}</p>}
					{error && <p className="text-red-600 text-sm">{error}</p>}
				</div>
			</div>
		</div>
	);
};

export default ModifyEventPage;

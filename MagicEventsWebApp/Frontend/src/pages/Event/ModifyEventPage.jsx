import { faClose, faEdit, faCalendarDays, faUsers, faUserShield, faImage } from '@fortawesome/free-solid-svg-icons';
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
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [editingImage, setEditingImage] = useState(false);
	const [activeTab, setActiveTab] = useState('details');
	const imgInput = useRef(null);

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
	}, [event, eventDetail, magicEventsTag]);

	useEffect(() => {
		async function fetchAPI() {
			const res = await getEvent(eventId);
			if (!res.ok) {
				setEvent(null);
				return;
			}
			const data = await res.json();
			setEvent(data);
			setLoading(false);
		}
		fetchAPI();
	}, [eventId]);

	const tabs = [
		{ id: 'details', label: 'Dettagli', icon: faEdit },
		{ id: 'participants', label: 'Partecipanti', icon: faUsers },
		{ id: 'admins', label: 'Admin', icon: faUserShield },
	];

	return !event ? (
		loading ? (
			<LoadingContainer />
		) : (
			<ErrorContainer errorMessage={'Nessun evento trovato'} to="/home" />
		)
	) : (
		<div className="h-full bg-gradient-to-br from-[#505458] to-[#363540] flex flex-col">
			{/* Header */}
			<div className="bg-gradient-to-r from-[#EE0E51] to-[#ff4574] p-6 shadow-lg">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-bold text-white mb-4">Modifica Evento</h1>
					
					{/* Tab Navigation */}
					<div className="flex flex-wrap gap-2">
						{tabs.map((tab) => (
							<Button
								key={tab.id}
								text={
									<div className="flex items-center gap-2">
										<FontAwesomeIcon icon={tab.icon} />
										<span className="hidden sm:inline">{tab.label}</span>
									</div>
								}
								onClick={() => setActiveTab(tab.id)}
								custom={clsx({
									'px-4 py-2 rounded-lg font-semibold transition-all border-2': true,
									'bg-white text-[#EE0E51] border-white shadow-lg': activeTab === tab.id,
									'bg-transparent text-white border-white border-opacity-30 hover:border-opacity-50': activeTab !== tab.id,
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
						{activeTab === 'details' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Dettagli Evento</h2>
								
								{/* Event Image */}
								<div className="mb-6">
									<label className="block text-sm font-semibold text-[#E4DCEF] mb-2">
										<FontAwesomeIcon icon={faImage} className="mr-2" />
										Immagine Evento
									</label>
									<div className="relative">
										<ImageEdit 
											src={event.image} 
											alt={event.title} 
											onEditClick={() => setEditingImage(true)} 
										/>
										{editingImage && (
											<div className="mt-4">
												<Input
													onChange={handleChangeImage}
													ref={imgInput}
													label="Modifica immagine"
													name="immagine"
													type="file"
													accept="image/*"
													customClass="bg-white text-[#363540]"
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
									</div>
								</div>

								{/* Title */}
								<div>
									<label className="block text-sm font-semibold text-[#E4DCEF] mb-2">
										Titolo
									</label>
									<input
										type="text"
										name="title"
										value={eventDetail.title}
										placeholder={event.title}
										onChange={handleChange}
										className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white text-[#363540]"
									/>
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm font-semibold text-[#E4DCEF] mb-2">
										Descrizione
									</label>
									<textarea
										name="description"
										value={eventDetail.description}
										placeholder={event.description}
										onChange={handleChange}
										rows={4}
										className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white text-[#363540] resize-none"
									/>
								</div>

								{/* Current Dates */}
								<div className="bg-[#363540] bg-opacity-50 rounded-xl p-4">
									<h3 className="text-lg font-semibold text-[#E4DCEF] mb-3">Date Attuali</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<span className="text-sm text-[#E4DCEF] opacity-70">Inizio:</span>
											<p className="text-[#E4DCEF] font-medium">{convertDataTime(event.starting)}</p>
										</div>
										<div>
											<span className="text-sm text-[#E4DCEF] opacity-70">Fine:</span>
											<p className="text-[#E4DCEF] font-medium">{convertDataTime(event.ending)}</p>
										</div>
									</div>
								</div>

								{/* New Dates */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										onChange={handleChange}
										value={eventDetail.starting}
										type="datetime-local"
										label="Nuova data inizio"
										name="starting"
										customClass="bg-white text-[#363540]"
									/>
									<Input
										onChange={handleChange}
										value={eventDetail.ending}
										type="datetime-local"
										label="Nuova data fine"
										name="ending"
										customClass="bg-white text-[#363540]"
									/>
								</div>

								{/* Save Button */}
								<div className="pt-4">
									<Button
										text="Salva Modifiche"
										onClick={async () => {
											setError(null);
											setMessage(null);
											try {
												if (eventModified.description.length < 10 || eventModified.description.length > 255) {
													setError('La descrizione deve essere tra 10 e 255 caratteri');
													return;
												}
												const res = await modifyEvent(eventId, eventModified);
												if (res === 'Error' || res.status !== 200) {
													setError('Errore durante la modifica');
												} else {
													setMessage('Modifica riuscita');
													setTimeout(() => navigate(`/${eventId}`), 2000);
												}
											} catch (err) {
												setError(err.message);
											}
										}}
										custom="w-full py-3 text-lg font-semibold"
									/>
								</div>
							</div>
						)}

						{activeTab === 'participants' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Gestione Partecipanti</h2>
								
								{/* Current Participants */}
								<div>
									<h3 className="text-lg font-semibold text-[#E4DCEF] mb-3">
										Partecipanti Attuali ({event.partecipants.length})
									</h3>
									<div className="max-h-64 overflow-y-auto bg-[#363540] bg-opacity-50 rounded-xl p-4 space-y-2">
										{event.partecipants.map((p, index) => (
											<div key={index} className="flex items-center justify-between p-3 bg-[#505458] rounded-lg">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-[#EE0E51] rounded-full flex items-center justify-center text-white font-bold text-sm">
														{p.charAt(0).toUpperCase()}
													</div>
													<span className="text-[#E4DCEF]">{p}</span>
												</div>
												<Button
													custom={clsx({ 
														'!bg-transparent text-red-400 hover:text-red-300 !border-none p-1': true,
														'hidden': p === user.email 
													})}
													onClick={async () => {
														setError(null);
														setMessage(null);
														try {
															const res = await removePartecipant(eventId, p);
															if (res === 'Error' || res.status !== 200) {
																setError('Errore durante la rimozione');
															} else {
																setMessage('Partecipante rimosso');
																setEvent((prev) => ({ 
																	...prev, 
																	partecipants: prev.partecipants.filter((item) => item !== p) 
																}));
															}
														} catch (err) {
															setError(err.message);
														}
													}}
													text={<FontAwesomeIcon icon={faClose} />}
												/>
											</div>
										))}
									</div>
								</div>

								{/* Add New Participants */}
								<div>
									<h3 className="text-lg font-semibold text-[#E4DCEF] mb-3">Aggiungi Partecipanti</h3>
									<Input
										onEnterPress={() => {
											if (partecipantInput.trim()) {
												setEventDetail((prev) => ({ 
													...prev, 
													participants: [...prev.participants, partecipantInput.trim()] 
												}));
												setPartecipantInput('');
											}
										}}
										onChange={(e) => setPartecipantInput(e.target.value)}
										value={partecipantInput}
										customClass="bg-white text-[#363540]"
										name="email utente da invitare"
										placeholder="Inserisci email..."
									/>
									
									{eventDetail.participants.length > 0 && (
										<div className="mt-4 max-h-48 overflow-y-auto space-y-2">
											{eventDetail.participants.map((item, index) => (
												<div key={index} className="flex items-center justify-between p-3 bg-[#363540] rounded-lg">
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
											))}
										</div>
									)}

									{eventDetail.participants.length > 0 && (
										<div className="mt-4">
											<Button
												text="Aggiungi Partecipanti"
												onClick={async () => {
													setError(null);
													setMessage(null);
													try {
														const res = await updatePartecipants(eventId, eventDetail.participants);
														if (res === 'Error' || res.status !== 200) {
															setError('Errore durante l\'aggiunta');
														} else {
															setMessage('Partecipanti aggiunti');
															setEventDetail((prev) => ({ ...prev, participants: [] }));
															setTimeout(() => navigate(`/${eventId}`), 2000);
														}
													} catch (err) {
														setError(err.message);
													}
												}}
												custom="w-full py-3 font-semibold"
											/>
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === 'admins' && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-[#E4DCEF] mb-6">Gestione Amministratori</h2>
								
								{/* Current Admins */}
								<div>
									<h3 className="text-lg font-semibold text-[#E4DCEF] mb-3">
										Amministratori Attuali ({event.admins.length})
									</h3>
									<div className="max-h-64 overflow-y-auto bg-[#363540] bg-opacity-50 rounded-xl p-4 space-y-2">
										{event.admins.map((p, index) => (
											<div key={index} className="flex items-center justify-between p-3 bg-[#505458] rounded-lg">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-gradient-to-r from-[#EE0E51] to-[#ff4574] rounded-full flex items-center justify-center text-white font-bold text-sm">
														{p.charAt(0).toUpperCase()}
													</div>
													<span className="text-[#E4DCEF]">{p}</span>
												</div>
												<Button
													onClick={async () => {
														setError(null);
														setMessage(null);
														try {
															const res = await removeAdmin(eventId, p);
															if (res === 'Error' || res.status !== 200) {
																setError('Errore durante la rimozione');
															} else {
																setMessage('Admin rimosso');
																setEvent((prev) => ({ 
																	...prev, 
																	admins: prev.admins.filter((item) => item !== p) 
																}));
															}
														} catch (err) {
															setError(err.message);
														}
													}}
													custom="!bg-transparent text-red-400 hover:text-red-300 !border-none p-1"
													text={<FontAwesomeIcon icon={faClose} />}
												/>
											</div>
										))}
									</div>
								</div>

								{/* Add New Admins */}
								<div>
									<h3 className="text-lg font-semibold text-[#E4DCEF] mb-3">Aggiungi Amministratori</h3>
									<Input
										onEnterPress={() => {
											if (adminInput.trim()) {
												setEventDetail((prev) => ({ 
													...prev, 
													admins: [...prev.admins, adminInput.trim()] 
												}));
												setAdminInput('');
											}
										}}
										onChange={(e) => setAdminInput(e.target.value)}
										value={adminInput}
										customClass="bg-white text-[#363540]"
										name="email admin da invitare"
										placeholder="Inserisci email admin..."
									/>
									
									{eventDetail.admins.length > 0 && (
										<div className="mt-4 max-h-48 overflow-y-auto space-y-2">
											{eventDetail.admins.map((item, index) => (
												<div key={index} className="flex items-center justify-between p-3 bg-[#363540] rounded-lg">
													<span className="text-[#E4DCEF]">{item}</span>
													<Button
														onClick={() => {
															setEventDetail((prev) => ({
																...prev,
																admins: prev.admins.filter((a) => a !== item),
															}));
														}}
														custom="!bg-transparent text-red-400 hover:text-red-300 !border-none p-1"
														text={<FontAwesomeIcon icon={faClose} />}
													/>
												</div>
											))}
										</div>
									)}

									{eventDetail.admins.length > 0 && (
										<div className="mt-4">
											<Button
												text="Aggiungi Amministratori"
												onClick={async () => {
													setError(null);
													setMessage(null);
													try {
														const res = await updateAdmins(eventId, eventDetail.admins);
														if (res === 'Error' || res.status !== 200) {
															setError('Errore durante l\'aggiunta');
														} else {
															setMessage('Amministratori aggiunti');
															setEventDetail((prev) => ({ ...prev, admins: [] }));
															setTimeout(() => navigate(`/${eventId}`), 2000);
														}
													} catch (err) {
														setError(err.message);
													}
												}}
												custom="w-full py-3 font-semibold"
											/>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Messages */}
						{message && (
							<div className="mt-6 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
								<p className="text-green-300 font-medium">{message}</p>
							</div>
						)}
						{error && (
							<div className="mt-6 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
								<p className="text-red-300 font-medium">{error}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ModifyEventPage;

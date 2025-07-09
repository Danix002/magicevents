import { useEffect, useState } from 'react';
import { getEventsc } from '../../api/eventAPI';
import { mapEventDTOtoCardProps } from '../../utils/eventObjectMapping';
import EventList from '../../components/lists/EventList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faBoxArchive } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import Button from '../../components/buttons/Button';

const MyEventsPage = () => {
	const [events, setEvents] = useState([]);
	const [ready, setReady] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setReady(false);
		setLoading(true);
		async function fetchAPI() {
			try {
				const res = await getEventsc();
				if (!res.ok) {
					console.log(res);
					setEvents([]);
					setReady(true);
					return;
				}
				const data = await res.json();
				const mappedEvents = await data.map(mapEventDTOtoCardProps);
				setEvents(mappedEvents);
				setReady(true);
			} catch (error) {
				console.error('Error fetching events:', error);
				setEvents([]);
				setReady(true);
			} finally {
				setLoading(false);
			}
		}
		fetchAPI();
	}, []);

	return (
		<div className="h-full overflow-y-auto bg-gradient-to-br from-[#505458] to-[#363540]">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-[#EE0E51] to-[#ff4574] p-6 shadow-lg">
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-white bg-opacity-20 rounded-full">
								<FontAwesomeIcon icon={faBoxArchive} className="text-2xl text-[#505458]" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-white">I Miei Eventi</h1>
								<p className="text-white text-opacity-90">Gestisci tutti i tuoi eventi</p>
							</div>
						</div>
						
						<NavLink to="/newevent">
							<Button 
								text={
									<div className="flex items-center gap-2">
										<FontAwesomeIcon icon={faCalendarPlus} />
										<span>Crea Evento</span>
									</div>
								}
								custom="bg-white text-[#EE0E51] hover:bg-gray-100 border-white hover:border-gray-100 font-semibold px-6 py-3"
							/>
						</NavLink>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 md:p-6">
				<div className="max-w-6xl mx-auto">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-16">
							<div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E4DCEF] border-t-[#EE0E51] mb-4"></div>
							<p className="text-[#E4DCEF] text-lg font-medium">Caricamento eventi...</p>
						</div>
					) : ready ? (
						events.length > 0 ? (
							<div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
								<EventList events={events} />
							</div>
						) : (
							<div className="text-center py-16">
								<div className="mb-8">
									<div className="mx-auto w-24 h-24 bg-[#E4DCEF] bg-opacity-20 rounded-full flex items-center justify-center mb-4">
										<FontAwesomeIcon icon={faCalendarPlus} className="text-4xl text-[#505458]" />
									</div>
									<h3 className="text-2xl font-bold text-[#E4DCEF] mb-2">Non hai creato ancora nessun evento</h3>
									<p className="text-[#E4DCEF] text-opacity-70 mb-6 max-w-md mx-auto">
										Inizia a creare il tuo primo evento per condividere momenti speciali con amici e famiglia
									</p>
									<NavLink to="/newevent">
										<Button 
											text="Crea il tuo primo evento"
											custom="px-8 py-3 text-lg font-semibold"
										/>
									</NavLink>
								</div>
							</div>
						)
					) : (
						<div className="text-center py-16">
							<div className="text-red-400 mb-4">
								<FontAwesomeIcon icon={faBoxArchive} className="text-6xl opacity-50" />
							</div>
							<p className="text-[#E4DCEF] text-lg">Errore nel caricamento degli eventi</p>
							<Button 
								text="Riprova"
								onClick={() => window.location.reload()}
								custom="mt-4 px-6 py-2"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MyEventsPage;

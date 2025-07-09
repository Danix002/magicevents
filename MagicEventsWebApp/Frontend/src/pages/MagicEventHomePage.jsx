import { useEffect, useState } from 'react';
import Calendar from '../components/lists/calendar/Calendar';
import { getEventsp } from '../api/eventAPI';
import { getUpcomingEvents, getNextNDaysFormatted, mergeDaysAndEvents } from '../utils/dataFormatter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

const MagicEventHomePage = () => {
	const [events, setEvents] = useState([]);
	const [ready, setReady] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setReady(false);
		setLoading(true);
		async function fetchAPI() {
			try {
				const res = await getEventsp();
				if (!res.ok) {
					console.log(res);
					setEvents([]);
					return;
				}
				const data = await res.json();
				let eventsResult = mergeDaysAndEvents(getNextNDaysFormatted(10), getUpcomingEvents(data, 10));
				setEvents(eventsResult);
				setReady(true);
			} catch (error) {
				console.error('Error fetching events:', error);
				setEvents([]);
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
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 bg-white bg-opacity-20 rounded-full">
							<FontAwesomeIcon icon={faCalendarDays} className="text-2xl text-[#505458]" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-white">Eventi in Programma</h1>
							<p className="text-white text-opacity-90">Scopri tutti gli eventi che ti aspettano</p>
						</div>
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
								<Calendar days={events} />
							</div>
						) : (
							<div className="text-center py-16">
								<div className="mb-6">
									<FontAwesomeIcon icon="fa-solid fa-sparkles" className="text-6xl text-[#E4DCEF] opacity-50" />
								</div>
								<h3 className="text-2xl font-bold text-[#E4DCEF] mb-2">Nessun evento in programma</h3>
								<p className="text-[#E4DCEF] text-opacity-70">Crea il tuo primo evento per iniziare!</p>
							</div>
						)
					) : (
						<div className="text-center py-16">
							<p className="text-[#E4DCEF] text-lg">Errore nel caricamento degli eventi</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MagicEventHomePage;

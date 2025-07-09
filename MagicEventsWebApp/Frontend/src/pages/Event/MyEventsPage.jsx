import { useEffect, useState } from 'react';
import { getEventsc } from '../../api/eventAPI';
import { mapEventDTOtoCardProps } from '../../utils/eventObjectMapping';
import EventList from '../../components/lists/EventList';

const MyEventsPage = () => {
	const [events, setEvents] = useState([]);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		setReady(false);
		async function fetchAPI() {
			const res = await getEventsc();

			if (!res.ok) {
				console.log(res);

				setEvents([]);
				setReady(true);
				return;
			}
			const data = await res.json();

			// Mappa ogni eventDTO in formato per la card
			const mappedEvents = await data.map(mapEventDTOtoCardProps);

			setEvents(mappedEvents);
			setReady(true);
		}
		fetchAPI();
	}, []);
	return (
		<div className="h-full overflow-y-auto bg-[#505458] p-4">
			{ready ? (
				events.length > 0 ? (
					<EventList events={events} />
				) : (
					<p className="p-6 text-current/30 font-bold text-center w-full ">Non hai creato ancora nessun evento</p>
				)
			) : (
				<p className="p-6 text-current/30 font-bold text-center w-full ">Caricamento...</p>
			)}
		</div>
	);
};

export default MyEventsPage;

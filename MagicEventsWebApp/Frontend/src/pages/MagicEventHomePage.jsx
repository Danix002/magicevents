import { useEffect, useState } from 'react';
import Calendar from '../components/lists/Calendar/Calendar';
import { getEventsp } from '../api/eventAPI';
import { getUpcomingEvents, getNextNDaysFormatted, mergeDaysAndEvents } from '../utils/dataFormatter'

const MagicEventHomePage = () => {
	const [events, setEvents] = useState([]);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(false);
		async function fetchAPI() {
			const res = await getEventsp();
			if (!res.ok) {
				console.log(res);

				setEvents([]);
				return;
			}
			const data = await res.json();

			let eventsResult = mergeDaysAndEvents(getNextNDaysFormatted(10), getUpcomingEvents(data, 10));
			setEvents(eventsResult);
		}

		fetchAPI();
	}, []);

	return (
		<div className="h-full overflow-y-auto bg-[#505458] p-4">
			<div className="flex gap-2 items-center">
				<div className="h-4 w-4 bg-[#E4DCEF] rounded-full"></div>
				<p className="text-[#E4DCEF] font-bold ">In programma</p>
			</div>
			<Calendar days={events}></Calendar>
		</div>
	);
};

export default MagicEventHomePage;

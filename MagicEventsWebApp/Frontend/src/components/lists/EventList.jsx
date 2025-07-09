import React from 'react';
import EventCard from '../card/EventCard';

const EventList = ({ events = [] }) => {
	return (
		<div className="p-6 h-full text-[#E4DCEF]">
			{events.length === 0 ? (
				<p className="text-center text-gray-500 text-lg mt-12">
					Ancora nessun evento creato
				</p>
			) : (
				events.map((event, idx) => (
					<EventCard key={idx} {...event} />
				))
			)}
		</div>
	);
};

export default EventList;

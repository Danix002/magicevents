import React from 'react';
import Button from '../buttons/Button';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { annullEvent, deannullEvent, deleteEvent, getEventId, isActive } from '../../api/eventAPI';
import { useCoordinatesConverter } from '../../utils/coordinatesConverter';

const EventCard = ({ localDataTime, day, month, eventName, time, location, description }) => {
	const navigate = useNavigate();
	const address = useCoordinatesConverter(location);
	const [loadingAPI, setLoadingAPI] = useState(true);
	const [eventEnabled, setEventEnabled] = useState(false);
	const [eventId, setEventId] = useState(-1);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getEventId(eventName, localDataTime);
				const id = await res.json();
				setEventId(id[0]);
				const status = await isActive(id[0]);
				const flag = await status.json();
				setEventEnabled(flag);
				setLoadingAPI(false);
			} catch (err) {
				console.error('Error contacting server:', err);
			}
		};

		fetchData();
	}, []);

	const handleClick = async (e) => {
		e.stopPropagation();
		try {
			if (eventEnabled) {
				await annullEvent(eventId);
			} else {
				await deannullEvent(eventId);
			}
			setEventEnabled((prev) => !prev);
		} catch (err) {
			console.error('Error contacting server:', err);
		}
	};

	return (
		<div
			onClick={async () => {
				if (loadingAPI) {
					return;
				}
				try {
					navigate(`/${eventId}`);
				} catch (err) {
					console.error('Error contacting server:', err);
				}
			}}
			className={clsx(
				'flex flex-col rounded-xl p-4 mb-6 shadow-md bg-[#E4DCEF]',
				'hover:shadow-lg transition-shadow duration-300'
			)}
		>
			{/* Data */}
			<div className="text-sm font-bold text-gray-600 mb-2">
				{month} {day}
			</div>

			{/* Contenuto */}
			<div className="flex items-center gap-4 text-[#363540]">
				{/* Info Evento */}
				<div className="flex flex-col">
					<h3 className="text-lg font-semibold">{eventName}</h3>
					<p className="text-sm text-gray-600 mt-1">{description}</p>

					<div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
						<span>🕒 {time}</span>
						{address}
					</div>
				</div>
			</div>

			{/* Pulsante */}
			<div className="mt-4 self-end flex flex-row space-x-1">
				{eventEnabled && (
					<Button
						text="Modifica evento"
						onClick={async (e) => {
							e.stopPropagation();
							try {
								navigate(`/modifyevent/${eventId}`);
							} catch (err) {
								console.error('Error contacting server:', err);
							}
						}}
					></Button>
				)}
				{!loadingAPI ? (
					<>
						<Button
							text="Elimina evento"
							onClick={async (e) => {
								e.stopPropagation();
								try {
									await deleteEvent(eventId);
								} catch (err) {
									console.error('Error contacting server:', err);
								}
								navigate('/');
							}}
						></Button>
						<Button text={!eventEnabled ? 'Attiva evento' : 'Annulla evento'} onClick={handleClick} />
					</>
				) : (
					''
				)}
			</div>
		</div>
	);
};

export default EventCard;

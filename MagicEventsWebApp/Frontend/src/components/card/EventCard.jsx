import React from 'react';
import Button from '../buttons/Button';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { annullEvent, deannullEvent, deleteEvent, getEventId, isActive } from '../../api/eventAPI';
import { useCoordinatesConverter } from '../../utils/coordinatesConverter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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
				if (loadingAPI) return;
				try {
					navigate(`/${eventId}`);
				} catch (err) {
					console.error('Error contacting server:', err);
				}
			}}
			className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 border border-gray-100"
		>
			{/* Header with date */}
			<div className="bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] text-white p-4">
				<div className="flex items-center gap-3">
					<div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
						<FontAwesomeIcon icon={faCalendarAlt} className="text-lg" />
					</div>
					<div>
						<p className="text-sm font-medium opacity-90">{month}</p>
						<p className="text-2xl font-bold">{day}</p>
					</div>
					{!eventEnabled && (
						<div className="ml-auto">
							<span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
								Annullato
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				<h3 className="text-xl font-bold text-[#363540] mb-2 group-hover:text-[#EE0E51] transition-colors duration-300">
					{eventName}
				</h3>
				<p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
					{description}
				</p>

				{/* Event details */}
				<div className="space-y-3 mb-6">
					<div className="flex items-center gap-3 text-sm text-gray-500">
						<div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
							<FontAwesomeIcon icon={faClock} className="text-[#EE0E51]" />
						</div>
						<span>{time}</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-gray-500">
						<div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
							<FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#EE0E51]" />
						</div>
						<span className="line-clamp-1">{address}</span>
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex flex-wrap gap-2">
					{eventEnabled && (
						<Button
							text="Modifica"
							custom="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 !text-sm !px-4 !py-2 !rounded-lg transition-all duration-300"
							onClick={async (e) => {
								e.stopPropagation();
								try {
									navigate(`/modifyevent/${eventId}`);
								} catch (err) {
									console.error('Error contacting server:', err);
								}
							}}
						/>
					)}
					
					{!loadingAPI && (
						<>
							<Button
								text="Elimina"
								custom="!bg-red-50 !text-red-600 hover:!bg-red-100 !text-sm !px-4 !py-2 !rounded-lg transition-all duration-300"
								onClick={async (e) => {
									e.stopPropagation();
									try {
										await deleteEvent(eventId);
										navigate('/');
									} catch (err) {
										console.error('Error contacting server:', err);
									}
								}}
							/>
							<Button 
								text={!eventEnabled ? 'Attiva' : 'Annulla'} 
								custom={clsx(
									'!text-sm !px-4 !py-2 !rounded-lg transition-all duration-300',
									eventEnabled 
										? '!bg-orange-50 !text-orange-600 hover:!bg-orange-100' 
										: '!bg-green-50 !text-green-600 hover:!bg-green-100'
								)}
								onClick={handleClick} 
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default EventCard;

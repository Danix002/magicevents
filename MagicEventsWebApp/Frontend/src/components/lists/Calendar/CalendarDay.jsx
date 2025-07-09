import clsx from 'clsx';
import { getEventId } from '../../../api/eventAPI';
import { useNavigate } from 'react-router-dom';
import { convertDayToISO } from '../../../utils/dataFormatter';

const CalendarDay = ({ day }) => {
	const navigate = useNavigate();

	return (
		<div className=" group hover:shadow-2xl hover:scale-101 shadow-[#E8F2FC]/20 bg-gradient-to-br flex flex-col from-[#505458] to-[#363540] text-[#E8F2FC]  p-4 min-h-[8rem] !aspect-square first:to-[#E8F2FC] first:from-[#E4DCEF] first:text-[#363540]  ">
			<span className="text-lg font-bold flex justify-between p-1">
				{day.day}
				<div
					className={clsx({
						hidden: day.events.length === 0,
						' bg-[#E8F2FC] group-first:bg-[#EE0E51] group-first:text-[#E8F2FC] text-[#363540] rounded-full flex items-center justify-center  text-[12px] h-fit p-1 !aspect-square text-center w-8': true,
					})}
				>
					<p>{day.events.length}</p>
				</div>
			</span>
			<div className="bg-[#E8F2FC] group-first:bg-[#363540] w-full h-[1px] "> </div>
			<div className="flex flex-col gap-2 p-2 overflow-y-auto ">
				{day.events.length > 0 ? (
					day.events.map((event) => (
						<div className="flex gap-2 items-center ">
							<div className="h-4 w-4 bg-[#E4DCEF] group-first:bg-[#EE0E51] rounded-full"></div>
							<p
								className="text-[#E4DCEF] group-first:text-[#363540] font-bold text-[12px] max-w-[15rem]  text-ellipsis break-words line-clamp-1  underline"
								onClick={async () => {
									try {
										const dayConverted = convertDayToISO(day);
										const res = await getEventId(event.title, dayConverted);
										const id = await res.json();
										console.log(id);
										navigate(`/${id[0]}`);
									} catch (err) {
										console.error('Error contacting server:', err);
									}
								}}
							>
								{event.title}
							</p>
						</div>
					))
				) : (
					<p>Nessun evento in questo giorno</p>
				)}
			</div>
		</div>
	);
};

export default CalendarDay;

import CalendarDay from './CalendarDay';

const Calendar = ({ days }) => {
	if (days === undefined || days.length === 0) {
		return <p className="p-6 text-current/30 font-bold text-center w-full ">Nessun evento previsto</p>;
	}

	const items = days;
	const listItems = items.map((mex) => <CalendarDay key={mex.day} day={mex}/>);

	return <div className="grid grid-cols-2  md:grid-cols-5 md:grid-rows-2  p-1">{listItems}</div>;
};

export default Calendar;

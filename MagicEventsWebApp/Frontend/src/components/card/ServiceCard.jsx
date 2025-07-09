import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

const ServiceCard = ({ name, icon, value, onChange }) => {
	return (
		<div className="flex flex-col min-h-16 lg:flex-row lg:items-center  bg-[#363540] text-[#E8F2FC] gap-1 rounded-md">
			<div className="p-2 flex-auto lg:flex-3/5 flex f gap-2 justify-center items-center lg:w-10">
				<FontAwesomeIcon icon={icon}></FontAwesomeIcon>
				<h1 className="text-clip line-clamp-1">{name}</h1>
			</div>

			<button
				onClick={onChange}
				className={clsx({
					' flex-2/5 h-full rounded-r-md hover:animate-pulse': true,
					'bg-[#ee0e5180] shadow-inner  ': !value,
					'bg-[#EE0E51] ': value,
				})}
			>
				{' '}
				{!value ? 'Disabled' : 'Active'}{' '}
			</button>
		</div>
	);
};

export default ServiceCard;

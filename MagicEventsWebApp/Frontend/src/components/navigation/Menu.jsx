import { faClose, faMap, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Button from '../buttons/Button';
import { useState } from 'react';

const Menu = ({ open, onClose, onOpen, direction = 'right', tabs }) => {
	const [content, setContent] = useState(null);
	const [activeTab, setActiveTab] = useState(null);

	const renderTabButton = (tab, index, isActive) => (
		<button
			key={index}
			onClick={() => {
				setActiveTab(index);
				setContent(tab.content);
				onOpen();
			}}
			className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 min-w-[120px] ${
				isActive 
					? 'bg-[#EE0E51] text-white shadow-lg transform scale-105' 
					: 'bg-[#363540] hover:bg-[#505458] text-[#E4DCEF] hover:text-white'
			}`}
		>
			<FontAwesomeIcon 
				icon={tab.action} 
				className={`text-2xl ${isActive ? 'text-white' : 'text-[#EE0E51]'}`} 
			/>
			<span className="text-sm font-semibold text-center leading-tight">
				{tab.label}
			</span>
			{tab.label === 'Partecipanti' && (
				<span className="text-xs opacity-75">Vedi chi partecipa</span>
			)}
			{tab.label === 'Mappa' && (
				<span className="text-xs opacity-75">Posizione evento</span>
			)}
			{tab.label === 'Servizi' && (
				<span className="text-xs opacity-75">Funzioni disponibili</span>
			)}
		</button>
	);

	return open ? (
		<div
			className={clsx({
				' absolute flex flex-col p-2 gap-2  top-0  h-full bg-[#363540] min-w-[10rem] border border-[#505458] shadow-xl ': true,
				hidden: content === null,
				'left-0': direction === 'left',
				'right-0': direction !== 'left',
			})}
		>
			<Button
				onClick={onClose}
				text={<FontAwesomeIcon className="text-2xl cursor-pointer " icon={faClose} />}
				link
			></Button>

			{content}
		</div>
	) : (
		<div
			className={clsx({
				' absolute rounded-full flex flex-row items-center justify-evenly p-2 gap-4  top-6  min-h-[3rem] bg-[#363540]  border border-[#505458] shadow-xl ': true,
				'left-6': direction === 'left',
				'right-6': direction !== 'left',
			})}
		>
			<div className="flex gap-3 mb-6 overflow-x-auto pb-2">
				{tabs.map((tab, index) => renderTabButton(tab, index, activeTab === index))}
			</div>
		</div>
	);
};

export default Menu;

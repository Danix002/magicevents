import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../buttons/Button';
import clsx from 'clsx';

const Menu = ({ tabs, open, onOpen, onClose }) => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabClick = (index) => {
		setActiveTab(index);
		if (window.innerWidth < 768) {
			// Auto-close on mobile after selection
			setTimeout(() => onClose(), 300);
		}
	};

	return (
		<>
			{/* Menu Toggle Button */}
			<Button
				onClick={open ? onClose : onOpen}
				custom={clsx({
					'fixed top-4 right-4 z-50 !rounded-full !p-3 shadow-lg transition-all duration-300': true,
					'!bg-[#EE0E51] !text-white hover:!bg-[#ff4574]': !open,
					'!bg-gray-800 !text-white hover:!bg-gray-700': open,
				})}
				text={<FontAwesomeIcon icon={open ? faTimes : faBars} className="text-lg" />}
			/>

			{/* Backdrop */}
			<div
				className={clsx({
					'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300': true,
					'opacity-100': open,
					'opacity-0 pointer-events-none': !open,
				})}
				onClick={onClose}
			/>

			{/* Sidebar */}
			<div
				className={clsx({
					'fixed top-0 right-0 h-full bg-white bg-opacity-95 backdrop-blur-md shadow-2xl z-50 transition-all duration-300 overflow-hidden': true,
					'w-full sm:w-[500px] md:w-[600px] lg:w-[700px] translate-x-0': open,
					'w-0 translate-x-full': !open,
				})}
			>
				<div className="flex h-full">
					{/* Tab Navigation */}
					<div className="w-20 sm:w-24 md:w-32 bg-[#363540] border-r border-[#E4DCEF] border-opacity-20 flex flex-col py-16">
						{tabs.map((tab, index) => (
							<button
								key={index}
								onClick={() => handleTabClick(index)}
								disabled={tab.available === false}
								className={clsx({
									'relative p-3 sm:p-4 md:p-6 transition-all duration-200 flex flex-col items-center gap-2 text-center': true,
									'bg-[#EE0E51] text-white': activeTab === index && tab.available !== false,
									'hover:bg-[#505458] text-[#E4DCEF]': activeTab !== index && tab.available !== false,
									'opacity-50 cursor-not-allowed text-gray-500': tab.available === false,
								})}
							>
								<FontAwesomeIcon
									icon={tab.action}
									className={clsx({
										'text-lg sm:text-xl md:text-2xl': true,
										[tab.iconSize]: !!tab.iconSize,
									})}
								/>
								<span className="text-xs sm:text-sm font-medium hidden sm:block">{tab.label}</span>
								{tab.count !== undefined && tab.count > 0 && (
									<span className="absolute -top-1 -right-1 bg-[#EE0E51] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{tab.count}
									</span>
								)}
								{tab.available === false && (
									<span className="absolute inset-0 bg-gray-600 bg-opacity-50 rounded-lg flex items-center justify-center">
										<span className="text-xs font-bold">N/A</span>
									</span>
								)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto">
						<div className="p-4 sm:p-6 md:p-8">
							{tabs[activeTab]?.available !== false ? (
								<div className="text-[#E4DCEF]">
									{/* Tab Header */}
									<div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E4DCEF] border-opacity-20">
										<FontAwesomeIcon
											icon={tabs[activeTab]?.action}
											className="text-[#EE0E51] text-xl"
										/>
										<div>
											<h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
												{tabs[activeTab]?.label}
											</h2>
											<p className="text-sm text-black opacity-70">
												{tabs[activeTab]?.description}
											</p>
										</div>
									</div>

									{/* Tab Content */}
									<div className="space-y-4">
										{tabs[activeTab]?.content}
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<FontAwesomeIcon
										icon={tabs[activeTab]?.action}
										className="text-6xl text-gray-500 mb-4"
									/>
									<h3 className="text-xl font-bold text-gray-400 mb-2">
										Servizio non disponibile
									</h3>
									<p className="text-gray-500">
										Questa funzione non è stata abilitata per questo evento
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Menu;

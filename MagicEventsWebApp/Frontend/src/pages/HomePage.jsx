import { useState } from "react";

const Homepage = () => {
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const togglePanel = () => {
		setIsPanelOpen(!isPanelOpen);
	};

	return (
		<div className="h-full backgroundHome overflow-y-auto overscroll-none snap-y">
			<div className="snap-start p-4">
				<div
					className="bg-black/30 h-24 backdrop-blur-md p-4 w-40 sm:w-48 md:w-52 text-[#E4DCEF] text-center rounded-md shadow-2xl">
					<span className="text-sm sm:text-base">Crea degli </span>
					<p className="!text-[#EE0E51] font-bold text-center text-sm sm:text-base">eventi</p>
					<span className="text-sm sm:text-base"> magici!</span>
				</div>
			</div>

			<div className="snap-start w-full items-center justify-center px-4">
				<div className="w-full items-center justify-center py-15">
					<div
						className="bg-black/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl text-[#E4DCEF] text-center shadow-2xl max-w-xl mx-auto">
						<h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Unisciti alla magia</h2>
						<p className="text-sm sm:text-base text-[#E4DCEF]/90 leading-relaxed tracking-wide mt-2">
							Questa applicazione è pensata per organizzare <span
							className="text-[#EE0E51] font-semibold not-italic">eventi unici e interattivi</span>,
							garantendo un'esperienza personalizzata a 360°
						</p>
						<div className="flex justify-center mb-3">
							<img src="/magicevents-logo-transparent.png" alt="Logo app"
								 className="w-20 h-20 sm:w-50 sm:h-50"/>
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-6">
					<button
						className="bg-[#EE0E51] text-white px-4 py-2 rounded-md shadow-lg"
						onClick={togglePanel}
					>
						{"Scopri di più"}
					</button>
				</div>
			</div>

			<div
				className={`fixed top-0 right-0 h-full w-80 bg-black/30 backdrop-blur-lg transform ${
					isPanelOpen ? "translate-x-0" : "translate-x-full"
				} transition-transform duration-300 z-40`}
			>
				<div className="p-4">
					<div className="flex justify-end">
						<button
							className="text-[#EE0E51] font-bold text-lg"
							onClick={() => setIsPanelOpen(false)}
						>
							&times;
						</button>
					</div>
					<div className="flex flex-col gap-6 mt-12">
						<div className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 transition-transform text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
							<h1 className="text-xl font-extrabold mb-2">Crea</h1>
							<p className="text-sm sm:text-base">
								Crea i tuoi eventi esclusivi, inviando il link o il QR code ai tuoi invitati potrà
								partecipare solo chi vuoi
							</p>
						</div>
						<div className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 transition-transform text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
							<h1 className="text-xl font-extrabold mb-2">Partecipa</h1>
							<p className="text-sm sm:text-base">
								Gestisci e partecipa ad eventi e divertiti
							</p>
						</div>
						<div className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 transition-transform text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
							<h1 className="text-xl font-extrabold mb-2">Interagisci</h1>
							<p className="text-sm sm:text-base">
								Interagisci con i tuoi invitati: sono disponibili diverse funzionalità che puoi
								abilitare per il tuo evento, provale tutte
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Homepage;

const Homepage = () => {
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
			</div>

			<div className="flex overflow-x-auto snap-x snap-mandatory w-full h-screen">
				{/* Slide 1 - solo "Scopri di più" */}
				<div className="snap-start w-screen h-screen relative flex-shrink-0 bg-black/30 backdrop-blur-lg">
					<p className="absolute top-1/2 right-0 transform -translate-y-1/2 rotate-90 origin-bottom-right text-[#E4DCEF] font-extrabold text-lg sm:text-xl p-2">
						Scopri di più
					</p>
				</div>

				{/* Slide 2 - contenuto visibile con scroll a destra */}
				<div
					className="snap-start w-screen h-screen flex-shrink-0 bg-black/30 backdrop-blur-lg px-4 sm:px-8 md:px-16 pt-24 sm:pt-28 pb-8 sm:pb-12">
					<div
						className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center sm:items-stretch mt-12 sm:mt-8">
						<div
							className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 sm:hover:scale-110 transition-transform w-full sm:min-w-[12rem] sm:max-w-[15rem] text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
							<h1 className="text-xl font-extrabold mb-2">Crea</h1>
							<p className="text-sm sm:text-base">
								Crea i tuoi eventi esclusivi, inviando il link o il QR code ai tuoi invitati potrà
								partecipare solo chi vuoi
							</p>
						</div>
						<div
							className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 sm:hover:scale-110 transition-transform w-full sm:min-w-[12rem] sm:max-w-[15rem] text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
							<h1 className="text-xl font-extrabold mb-2">Partecipa</h1>
							<p className="text-sm sm:text-base">
								Gestisci e partecipa ad eventi e divertiti
							</p>
						</div>
						<div
							className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 sm:hover:scale-110 transition-transform w-full sm:min-w-[12rem] sm:max-w-[15rem] text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
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

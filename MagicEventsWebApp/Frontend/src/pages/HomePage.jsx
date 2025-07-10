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
						<p className="text-sm sm:text-base">
							Un progetto open source pensato per eventi unici e interattivi. Scopri il codice e
							contribuisci
							su <a href="https://github.com/Danix002/magicevents" target="_blank"
								  rel="noopener noreferrer"
								  className="text-[#EE0E51] underline">GitHub</a>
						</p>
						<div className="flex justify-center mb-3">
							<img src="/logo192.png" alt="Logo app" className="w-10 h-20 sm:w-25 sm:h-50"/>
						</div>
					</div>
				</div>
				<div className="block lg:hidden h-65 w-full"></div>
				<div className="hidden lg:block h-[calc(60vh-15rem)] w-20"></div>
			</div>

			<div
				className="snap-start pt-12 sm:pt-20 relative w-full px-4 sm:px-8 md:px-16 bg-black/30 backdrop-blur-lg p-6 sm:p-8 rounded-t-4xl shadow-2xl">
				<p className="absolute top-2 sm:top-0 text-[#E4DCEF] left-1/2 transform -translate-x-1/2 font-extrabold text-lg sm:text-xl p-2">Scopri di più</p>
				
				<div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center sm:items-stretch mt-8 sm:mt-0">
					<div
						className="bg-[#363540] hover:shadow-xl hover:shadow-[#EE0E51] hover:scale-105 sm:hover:scale-110 transition-transform w-full sm:min-w-[12rem] sm:max-w-[15rem] text-[#E4DCEF] p-4 rounded-2xl border border-[#EE0E51]">
						<h1 className="text-xl font-extrabold mb-2">Crea</h1>
						<p className="text-sm sm:text-base">
							Crea i tuoi eventi esclusivi, inviando il link o il QR code ai tuoi invitati potrà partecipare
							solo chi vuoi
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
							Interagisci con i tuoi invitati: sono disponibili diverse funzionalità che puoi abilitare per il
							tuo evento, provale tutte
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Homepage;

const Popup = ({ title = 'Titolo Popup', children }) => {
	return (
		<div className="p-4 bg-[#363540] absolute bottom-4 right-4 rounded-md border shadow-2xl shadow-[#E8F2FC] text-[#E8F2FC] border-[#505458] ">
			<h1 className="font-semibold">{title}</h1>
			{children}
		</div>
	);
};

export default Popup;

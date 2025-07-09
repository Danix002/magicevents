const Image = ({ src, alt = 'thumbnail', onClick }) => {
	if (!src) {
		return;
	}
	return (
		<img
			onClick={onClick}
			className="w-full border border-[#E4DCEF] rounded-md ring ring-[#E4DCEF] ring-offset-2 flex-auto max-h-[48rem] object-cover"
			src={'data:image/*;base64,' + src}
			alt={alt}
		></img>
	);
};

export default Image;

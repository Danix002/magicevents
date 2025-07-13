import { useState } from 'react';
import Button from '../buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';

const ImageGrid = ({
   onDelete = (image) => alert('delete: ' + image.id),
   onLoadMore = () => alert('load more'),
   onClickImage = (image) => alert('image click'),
   onLike = (image) => alert('like: ' + image.id),
   displayOnloadMore = true,
   images,
   isAdmin = false,
   prepend,
}) => {
	const [visibleCount, setVisibleCount] = useState(6);

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 6);
		onLoadMore(); // se vuoi mantenere anche il callback esterno
	};

	const visibleImages = images.slice(0, visibleCount);
	const hasMoreImages = visibleCount < images.length;

	return (
		<div className="space-y-6">
			{visibleImages.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
					{prepend && <div>{prepend}</div>}
					{visibleImages.map((image, index) => (
						<div className="relative group cursor-pointer" key={index}>
							<img
								className="w-full h-64 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
								src={`data:image/*;base64,${image.base64Image}`}
								alt={image.title}
								onClick={() => onClickImage(image)}
							/>

							<div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
								<button
									onClick={(e) => {
										e.stopPropagation();
										onLike(image);
									}}
									className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
										image.userLike
											? 'bg-[#EE0E51] text-white'
											: 'bg-black/20 text-white hover:bg-[#EE0E51]'
									}`}
								>
									<FontAwesomeIcon icon={faHeart} className="text-base" />
								</button>

								{isAdmin && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											onDelete(image);
										}}
										className="p-3 rounded-full bg-black/20 text-white backdrop-blur-sm border border-white/20 hover:bg-red-500 transition-all duration-200"
									>
										<FontAwesomeIcon icon={faTrash} className="text-base" />
									</button>
								)}
							</div>

							<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
								<div className="flex items-center justify-between">
									<h3 className="text-white font-medium text-sm truncate">
										{image.title}
									</h3>
									<div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
										<FontAwesomeIcon icon={faHeart} className="text-[#EE0E51] text-xs" />
										<span className="text-white text-xs font-medium">{image.likes}</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-12 px-4">
					<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
						<FontAwesomeIcon icon={faImages} className="text-gray-400 text-2xl" />
					</div>
					<h3 className="text-lg font-medium text-gray-600 mb-2">Nessuna immagine</h3>
					<p className="text-gray-500 text-center text-sm">
						Le immagini caricate appariranno qui
					</p>
				</div>
			)}

			{displayOnloadMore && hasMoreImages && (
				<div className="flex justify-center pt-4">
					<Button
						onClick={handleLoadMore}
						custom="!bg-gradient-to-r !from-[#EE0E51] !to-[#FF6B9D] !text-white hover:!from-[#D40D47] hover:!to-[#E55A87] transition-all duration-300 !rounded-full !px-8 !py-3 !font-medium"
						text="Carica più immagini"
					/>
				</div>
			)}
		</div>
	);
};

export default ImageGrid;

import { useEffect, useState } from 'react';
import ImageCard from '../images-component/ImageCard';
import Button from '../buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';

const ImageList = ({
	onDelete = (image) => alert('delete: ', image.id),
	onLoadMore = () => alert('load more; '),
	onLike = (image) => alert('like: ', image.id),
	displayOnloadMore = true,
	onClickImage = (image) => alert('click'),
	images,
	isAdmin = false,
}) => {
	const items = images || [];
	const listItems = items.map((image, index) => (
		<div className="relative group cursor-pointer" key={index}>
			<img
				className="w-full h-48 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
				src={`data:image/*;base64,${image.base64Image}`}
				alt={image.title}
				onClick={() => image && image.id ? onClickImage(image) : null}
			/>

			{/* Action buttons - always visible on mobile, hover on desktop */}
			<div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
				<button
					onClick={(e) => {
						e.stopPropagation();
						if (image && image.id) {
							onLike(image);
						}
					}}
					disabled={!image || !image.id}
					className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
						image?.userLike
							? 'bg-[#EE0E51] text-white'
							: 'bg-black/20 text-white hover:bg-[#EE0E51]'
					}`}
				>
					<FontAwesomeIcon icon={faHeart} className="text-sm" />
				</button>

				{isAdmin && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							if (image && image.id) {
								onDelete(image);
							}
						}}
						disabled={!image || !image.id}
						className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm border border-white/20 hover:bg-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<FontAwesomeIcon icon={faTrash} className="text-sm" />
					</button>
				)}
			</div>

			{/* Like count badge - always visible */}
			<div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
				<FontAwesomeIcon icon={faHeart} className="text-[#EE0E51] text-xs" />
				<span className="text-white text-xs font-medium">{image?.likes || 0}</span>
			</div>
		</div>
	));

	return (
		<div className="p-2 flex flex-col !h-fit ">
			<h1 className="font-bold text-xl">Popolari</h1>
			{listItems.length > 0 ? (
				<div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
					{listItems}
					{displayOnloadMore ? <Button onClick={onLoadMore} custom=" " text="Carica più immagini" /> : ''}
				</div>
			) : (
				<div className=" bg-[#505458]/50 backdrop-blur-4xl snap-x w-full text-[#E8F2FC] rounded-md  flex flex-row gap-2 p-2 overflow-x-auto ">
					Nessuna immagine popolare
				</div>
			)}
		</div>
	);
};

export default ImageList;

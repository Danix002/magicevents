import { useEffect, useState } from 'react';
import ImageCard from './ImageCard';
import Button from '../buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';

const ImageGrid = ({
	onDelete = (image) => alert('delete: ', image.id),
	onLoadMore = () => alert('load more; '),
	onClickImage = (image) => alert('image click'),
	onLike = (image) => alert('like: ', image.id),
	displayOnloadMore = true,
	images,
	isAdmin = false,
}) => {
	const [list, setList] = useState([]);

	useEffect(() => {
		const items = images;
		const listItems = items.map((mex, index) => (
			<ImageCard
				isAdmin={isAdmin}
				key={index}
				onDelete={onDelete}
				onClick={onClickImage}
				onLike={onLike}
				mex={mex}
			/>
		));
		setList(listItems);
	}, [images]);

	return (
		<div className="space-y-6">
			{list.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
					{list}
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
			
			{displayOnloadMore && list.length > 0 && (
				<div className="flex justify-center pt-4">
					<Button 
						onClick={onLoadMore} 
						custom="!bg-gradient-to-r !from-[#EE0E51] !to-[#FF6B9D] !text-white hover:!from-[#D40D47] hover:!to-[#E55A87] transition-all duration-300 !rounded-full !px-8 !py-3 !font-medium"
						text="Carica più immagini" 
					/>
				</div>
			)}
		</div>
	);
};

export default ImageGrid;

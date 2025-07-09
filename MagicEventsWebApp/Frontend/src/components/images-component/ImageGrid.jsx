import { useEffect, useState } from 'react';
import ImageCard from './ImageCard';
import Button from '../buttons/Button';

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
			></ImageCard>
		));
		setList(listItems);
	}, [images]);

	return (
		<div className="grid max-[666px]:grid-cols-2 max-[852px]:grid-cols-3 max-[1080px]:grid-cols-4 grid-cols-5 gap-[1px] space-y-2 p-2">
			{list.length > 0 ? (
				list
			) : (
				<div className=" snap-x w-full bg-[#505458]/50 backdrop-blur-4xl text-[#E8F2FC] rounded-md  flex flex-row gap-2 p-2 overflow-x-auto col-span-full">
					Nessuna immagine
				</div>
			)}
			{displayOnloadMore ? <Button onClick={onLoadMore} custom="!col-span-full " text="Carica più immagini" /> : ''}
		</div>
	);
};

export default ImageGrid;

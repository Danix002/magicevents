import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../buttons/Button';
import { faClose, faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

const ImageCard = ({ mex, onLike, onDelete, onClick, isAdmin = false }) => {
	return (
		<div
			onClick={() => onClick(mex)}
			className="snap-start hover:scale-110 group aspect-4/5 hover:border-2 hover:z-100 border-[#E8F2FC] shadow-xl relative h-115"
		>
			<div className="absolute items-center bottom-2 left-0 px-2 py-0 h-fit flex flex-row gap-4 justify-between w-full">
				<div className=" text-[#E8F2FC] group-hover:hidden max-w-[10rem] bg-[#505458]/70 p-1 px-4 rounded-md text-clip  line-clamp-2 backdrop-blur-xl">
					{mex.title}
				</div>
				<div className="flex flex-row gap-1 rounded-md items-center bg-[#505458]/70  backdrop-blur-3xl ps-2 text-[#E8F2FC]">
					<p className=" translate-x-0  ">{mex.likes}</p>
					<Button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onLike(mex);
						}}
						custom=" !rounded-full bg-transparent !border-none justify-center group/like flex items-center !hover:bg-[#E8F2FC] "
						text={
							<FontAwesomeIcon
								className={clsx({
									'text-2xl !px-0   ': true,
									'text-[#EE0E51]  group-hover/like:!text-[#E8F2FC] ': mex.userLike,
									'text-[##E8F2FC] ': !mex.userLike,
								})}
								icon={faHeart}
							/>
						}
					></Button>
				</div>
			</div>
			<div className={clsx({ 'absolute top-2 right-2': true, hidden: !isAdmin })}>
				<Button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onDelete(mex);
					}}
					text={<FontAwesomeIcon icon={faTrash} />}
				/>
			</div>
			<div className=" h-full flex">
				<img
					className="aspect-4/5 object-cover w-full  "
					src={'data:image/*;base64,' + mex.base64Image}
					alt="post"
				></img>
			</div>
		</div>
	);
};

export default ImageCard;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../buttons/Button';
import { faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

const ImageCard = ({ mex, onLike, onDelete, onClick, isAdmin = false }) => {
	return (
		<div
			onClick={() => onClick(mex)}
			className="group relative aspect-square bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
		>
			{/* Image */}
			<img
				className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				src={'data:image/*;base64,' + mex.base64Image}
				alt={mex.title}
			/>

			{/* Overlay */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			{/* Content */}
			<div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
				{/* Title */}
				<h3 className="text-white text-sm font-medium mb-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
					{mex.title}
				</h3>

				{/* Actions */}
				<div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
					{/* Like button */}
					<div className="flex items-center gap-2">
						<Button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onLike(mex);
							}}
							custom="!bg-white/20 !backdrop-blur-sm !border-none !rounded-full !p-2 hover:!bg-white/30 transition-all duration-200"
							text={
								<div className="flex items-center gap-1">
									<FontAwesomeIcon
										className={clsx(
											'text-sm transition-colors duration-200',
											mex.userLike ? 'text-[#EE0E51]' : 'text-white'
										)}
										icon={faHeart}
									/>
									<span className="text-white text-xs font-medium">{mex.likes}</span>
								</div>
							}
						/>
					</div>

					{/* Delete button (admin only) */}
					{isAdmin && (
						<Button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onDelete(mex);
							}}
							custom="!bg-red-500/80 !backdrop-blur-sm !border-none !rounded-full !p-2 hover:!bg-red-600 transition-all duration-200"
							text={<FontAwesomeIcon icon={faTrash} className="text-white text-sm" />}
						/>
					)}
				</div>
			</div>

			{/* Admin delete button (always visible for admins) */}
			{isAdmin && (
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<Button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onDelete(mex);
						}}
						custom="!bg-red-500/80 !backdrop-blur-sm !border-none !rounded-full !p-2 hover:!bg-red-600 transition-all duration-200"
						text={<FontAwesomeIcon icon={faTrash} className="text-white text-xs" />}
					/>
				</div>
			)}
		</div>
	);
};

export default ImageCard;

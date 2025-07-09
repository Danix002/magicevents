import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../buttons/Button';

const MessageCard = ({
	message,
	isAdmin = false,
	isSendbyMe,
	onDelete = (mex) => {
		alert(mex.username + ': ' + mex.content);
	},
}) => {
	function formatDate(input) {
		if (input == null) return null;
		const date = new Date(input);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = String(date.getFullYear()).slice(-2);
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${day}/${month}/${year} ${hours}:${minutes}`;
	}

	return (
		<div
			className={clsx(
				'group my-2 w-fit min-w-[200px] max-w-[320px] sm:max-w-[400px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300',
				{
					'bg-gradient-to-br from-[#EE0E51] to-[#D40D47] text-white ml-auto mr-4': isSendbyMe,
					'bg-white text-[#363540] mr-auto ml-4 border border-gray-100': !isSendbyMe,
				}
			)}
		>
			<div className="p-4">
				{/* Username for others' messages */}
				{!isSendbyMe && (
					<div className="flex items-center gap-2 mb-2">
						<div className="w-6 h-6 bg-gradient-to-r from-[#EE0E51] to-[#FF6B9D] rounded-full flex items-center justify-center">
							<span className="text-white text-xs font-bold">
								{message.username?.charAt(0)?.toUpperCase()}
							</span>
						</div>
						<h4 className="font-semibold text-[#EE0E51] text-sm">{message.username}</h4>
					</div>
				)}

				{/* Message content */}
				<p className={clsx(
					'text-sm leading-relaxed break-words',
					isSendbyMe ? 'text-white' : 'text-[#363540]'
				)}>
					{message.content}
				</p>

				{/* Footer with time and delete button */}
				<div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
					{/* Delete button (admin only) */}
					{isAdmin && (
						<Button
							onClick={() => onDelete(message)}
							custom={clsx(
								'opacity-0 group-hover:opacity-100 transition-all duration-300 !p-2 !rounded-full hover:scale-110',
								{
									'!bg-white/20 hover:!bg-white/30 !text-white': isSendbyMe,
									'!bg-red-50 hover:!bg-red-100 !text-red-500': !isSendbyMe,
								}
							)}
							text={<FontAwesomeIcon icon={faTrash} className="text-xs" />}
						/>
					)}

					{/* Spacer */}
					<div className="flex-1" />

					{/* Timestamp */}
					<span className={clsx(
						'text-xs font-medium',
						isSendbyMe ? 'text-white/70' : 'text-gray-500'
					)}>
						{formatDate(message?.dateTime) || formatDate(message?.time)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default MessageCard;

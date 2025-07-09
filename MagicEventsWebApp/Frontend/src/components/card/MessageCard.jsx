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
		const month = String(date.getMonth() + 1).padStart(2, '0'); // I mesi partono da 0
		const year = String(date.getFullYear()).slice(-2); // Ultime due cifre dell'anno
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${day}/${month}/${year} ${hours}:${minutes}`;
	}

	return (
		<div
			className={clsx({
				'my-2 w-fit min-w-[15rem] max-w-[32rem] p-4 rounded-4xl shadow-2xs  hover:shadow-2xl shadow-[#505458] ': true,
				'bg-[#EE0E51] text-white !self-end rounded-br-none': isSendbyMe,
				'bg-[#E4DCEF] text-[#363540] rounded-bl-none    ': !isSendbyMe,
			})}
		>
			{isSendbyMe ? '' : <h1 className="font-bold text-[#EE0E51]">{message.username}</h1>}
			<p className="text-xs">{message.content}</p>
			<div className="text-xs mt-2 text-end font-light text-current/50 justify-between flex items-center   ">
				<Button
					onClick={() => onDelete(message)}
					link
					custom={clsx({
						'hover:bg-[#363540]/20 p-2 rounded-full': true,
						'!text-[#363540]': !isSendbyMe,
						'!text-[#E4DCEF]': isSendbyMe,
						hidden: !isAdmin,
					})}
					text={<FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>}
				></Button>

				<p>{formatDate(message?.dateTime) || formatDate(message?.time)}</p>
			</div>
		</div>
	);
};

export default MessageCard;

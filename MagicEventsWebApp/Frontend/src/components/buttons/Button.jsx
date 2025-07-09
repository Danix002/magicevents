import clsx from 'clsx';

const Button = ({ secondary = false, text = 'Button', onClick, link = false, custom = '', disabled = false }) => {
	return (
		<button
			disabled={disabled}
			onClick={onClick}
			className={clsx({
					'bg-[#EE0E51] border-2 border-[#EE0E51] text-[#E4DCEF] p-2 px-4 rounded-md hover:shadow-2xl hover:bg-[#cc0d47] transition-all duration-200 font-medium': !link && !secondary,
					'text-[#E4DCEF] hover:underline text-xs w-fit cursor-pointer': link,
					'bg-transparent text-[#EE0E51] border-2 border-[#EE0E51] rounded-md p-2 px-4 hover:shadow-2xl hover:bg-[#EE0E51] hover:text-[#E4DCEF] transition-all duration-200 font-medium': secondary,
					'opacity-50 cursor-not-allowed': disabled,
					'cursor-pointer': !disabled,
					[custom]: true,
			})}
		>
			{text}
		</button>
	);
};

export default Button;

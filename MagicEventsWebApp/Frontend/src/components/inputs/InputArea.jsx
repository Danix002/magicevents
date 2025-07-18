import clsx from 'clsx';

const InputArea = ({
	customClassContainer = '',
	customClass = '',
	customClassLabel = '',
	type = 'text',
	value,
	onChange,
	name,
	minLength = 0,
	required = false,
	label,
}) => {
	return (
		<div className={clsx({ 'flex flex-col space-y-1 ': true, [customClassContainer]: true })}>
			{label ? (
				<label className={clsx({ 'text-xs font-bold ms-1': true, [customClassLabel]: true })}>{label}</label>
			) : (
				<></>
			)}
			<textarea
				minLength={minLength}
				type={type}
				className={customClass}
				style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc', resize: 'none' }}
				name={name}
				placeholder={'Inserisci ' + name + '...'}
				value={value}
				onChange={onChange}
				required
			/>
		</div>
	);
};

export default InputArea;

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoadingContainer = () => {
	return (
		<div className="bg-[#505458] gap-4 flex-col text-[#E8F2FC] flex items-center justify-center h-full">
			<FontAwesomeIcon className="animate-spin" icon={faSpinner} />
		</div>
	);
};

export default LoadingContainer;

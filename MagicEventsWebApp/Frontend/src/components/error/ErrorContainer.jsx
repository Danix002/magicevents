import { NavLink } from 'react-router-dom';
import Button from '../buttons/Button';

const ErrorContainer = ({ errorMessage = "Ops, c'è stato un errore", to = '/' }) => {
	return (
		<div className="bg-[#505458] gap-4 flex-col text-[#E8F2FC] flex items-center justify-center h-full">
			<p>{errorMessage}</p>
			<NavLink to={to}>
				<Button text="Torna indietro"></Button>
			</NavLink>
		</div>
	);
};

export default ErrorContainer;

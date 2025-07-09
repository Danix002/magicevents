import { useNavigate } from 'react-router-dom';
import Button from './Button';

function ModifierUserButton() {
	const navigate = useNavigate();
	return (
		<Button 
			onClick={() => navigate('/modifyuser')} 
			text="Modifica Account"
			custom="text-sm"
		/>
	);
}

export default ModifierUserButton;
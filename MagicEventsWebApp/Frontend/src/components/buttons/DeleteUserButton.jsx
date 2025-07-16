import { deleteUser } from '../../api/userAPI';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

function DeleteUserButton({ user, setLogged }) {
	const navigate = useNavigate();

	const handleDeleteUser = async (e) => {
		e.preventDefault();
		try {
			console.log(user.email);
			if (!user.email) {
				return;
			}

			const res = await deleteUser(JSON.parse(sessionStorage.getItem('user')).email);

			if (!res.ok) throw new Error('Delete user failed');
			console.log('Success:', res);
			sessionStorage.removeItem('user');
			setLogged(false);
			navigate('/');
		} catch (err) {
			console.error('Error:', err.message);
		}
	};

	return (
		<Button
			onClick={handleDeleteUser}
			text="Elimina Account"
			custom="bg-red-600 border-red-600 hover:bg-red-700 text-white text-sm"
		/>
	);
}

export default DeleteUserButton;

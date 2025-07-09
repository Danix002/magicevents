import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { logout } from '../../api/authentication';

function LogoutButton({ setLogged }) {
	const navigate = useNavigate();
	const { user, setUser } = useAuth();

	const handleLogout = async (e) => {
		e.preventDefault();
		try {
			const res = await logout();
			if (!res.ok) throw new Error('logout failed');
			console.log('Success:', res);
			setUser(null);
			sessionStorage.removeItem('user');
			setLogged(false);
			navigate('/');
		} catch (err) {
			console.error('Error:', err.message);
		}
	};

	return <Button onClick={handleLogout} secondary text="Logout" custom="text-sm"></Button>;
}

export default LogoutButton;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GoogleButton from '../../components/buttons/GoogleButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import ForgotPassword from '../../components/buttons/ForgotPassword';
import Button from '../../components/buttons/Button';
import clsx from 'clsx';
import { login, helloServer } from '../../api/authentication';
import { useLocation } from 'react-router-dom';

function LoginPage({ setLogged }) {
	const navigate = useNavigate();
	const { setUser } = useAuth();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [forgotFlag, setForgotFlag] = useState(false);
	const location = useLocation();
	const from = sessionStorage.getItem('fromAfterLogin') || location.state?.from || '/home';

	useEffect(() => {
		const user = JSON.parse(sessionStorage.getItem('user'));
		if (user) {
			navigate('/', { replace: true });
		}
	}, [navigate]);

	useEffect(() => {
		const protocol = window.location.protocol.replace(':', '');
		console.log('✅ Trying to contact server...');
		const detectClientProtocol = async () => {
			try {
				const res = await helloServer(protocol);
				if (!res.ok) console.warn('Protocol detection failed');
			} catch (err) {
				console.error('Error contacting server:', err);
			}
		};
		detectClientProtocol();
	}, []);

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleLogin = async (e) => {
		e.preventDefault();

		const res = await login(formData);
		if (!res.ok) throw new Error('Credential invalid');
		const data = await res.json();
		console.log('Success:', data);
		setUser(data);
		sessionStorage.setItem('user', JSON.stringify(data));
		setLogged(true);
		navigate(from, { replace: true });
		sessionStorage.removeItem('fromAfterLogin');
	};

	return (
		<div className="backgroundLogin min-h-screen flex items-center justify-center p-4">
			<div className="relative bg-[#363540] text-[#E8F2FC] p-6 sm:p-8 w-full max-w-md mx-auto rounded-xl shadow-2xl space-y-6">
				<h2 className="font-bold text-2xl sm:text-3xl text-center">Login</h2>
				
				{/* Login with email e password */}
				<form
					className={clsx({ hidden: forgotFlag })}
					onSubmit={handleLogin}
					style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
				>
					<input
						type="text"
						name="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleChange}
						required
						className="p-3 rounded-lg border border-[#E4DCEF]/20 bg-[#505458] text-[#E4DCEF] placeholder-[#E4DCEF]/60 focus:border-[#EE0E51] focus:outline-none transition-colors"
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleChange}
						required
						className="p-3 rounded-lg border border-[#E4DCEF]/20 bg-[#505458] text-[#E4DCEF] placeholder-[#E4DCEF]/60 focus:border-[#EE0E51] focus:outline-none transition-colors"
					/>
					<Button text="Login" custom="mt-2" />
				</form>
				
				<Button
					text="Password dimenticata?"
					link={true}
					onClick={() => {
						setForgotFlag(true);
					}}
					custom="w-full text-center text-sm text-[#EE0E51] hover:underline"
				/>

				{/*Login with Google*/}
				<div className="flex justify-center">
					<GoogleButton />
				</div>

				{/*Registration*/}
				<div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-4 border-t border-[#E4DCEF]/20">
					<p className="text-sm sm:text-base">Non hai un account?</p>
					<Link to="/register">
						<p className="text-[#EE0E51] hover:underline text-sm sm:text-base">Registrati ora</p>
					</Link>
				</div>

				<div
					className={clsx({
						hidden: !forgotFlag,
						'bg-[#363540] p-6 sm:p-8 absolute inset-0 w-full h-full rounded-xl flex flex-col': true,
					})}
				>
					<div className="flex justify-end mb-4">
						<button
							onClick={() => {
								setForgotFlag(false);
							}}
							className="text-[#E4DCEF] hover:text-[#EE0E51] text-xl font-bold transition-colors"
						>
							✕
						</button>
					</div>
					<div className="flex-1 flex items-center justify-center">
						<ForgotPassword />
					</div>
				</div>
			</div>
		</div>
	);
}

export default LoginPage;

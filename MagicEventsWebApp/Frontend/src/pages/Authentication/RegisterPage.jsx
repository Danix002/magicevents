import React, { useState } from 'react';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import { login, register } from '../../api/authentication';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage({ setLogged }) {
	const navigate = useNavigate();
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		surname: '',
		username: '',
		email: '',
		password: '',
	});

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setError('');
		setSuccessMsg('');

		const password = formData.password;
		if (password.length < 6) {
			setError('La password deve contenere almeno 6 caratteri');
			return;
		}
		try {
			const res = await register(formData);

			if (!res.ok) {
				setError('Email già registrata');
				return;
			}

			const loginRes = await login({
				email: formData.email,
				password: formData.password,
			});

			if (!loginRes.ok) {
				setError('Ops, qualcosa è andato storto durante il login, prova a fare login nella pagina apposita');
				return;
			}

			const dataLogin = await loginRes.json();

			sessionStorage.setItem('user', JSON.stringify(dataLogin));
			setLogged(true);
			navigate('/home');
		} catch (err) {
			console.error('Error:', err.message);
			setError(err.message);
		}
	};

	return (
		<div className="backgroundLogin min-h-screen flex items-center justify-center p-2 sm:p-4">
			<div className="relative bg-[#363540] text-[#E8F2FC] p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-lg mx-auto rounded-xl shadow-2xl">
				<h2 className="font-bold text-xl sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6">Crea il tuo account</h2>

				<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
					<Input
						customClassContainer="flex-1"
						label="Nome"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
					/>
					<Input
						customClassContainer="flex-1"
						label="Cognome"
						name="surname"
						value={formData.surname}
						onChange={handleChange}
						required
					/>

					<Input
						customClassContainer="w-full"
						label="Username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						required
					 />

					<Input
						customClassContainer="w-full"
						label="Email"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
					 />

					<Input
						customClassContainer="w-full"
						label="Password"
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
					 />

					{error &&
						<div className="mt-6 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
							<p className="text-red-300 font-medium">{error}</p>
						</div>
					}
					{successMsg &&
						<div className="mt-6 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
							<p className="text-green-300 font-medium">{successMsg}</p>
						</div>
					}

					<Button custom="w-full mt-4 sm:mt-6" text="Registrati"/>
				</form>

				<div
					className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E4DCEF]/20">
					<p className="text-xs sm:text-sm md:text-base">Hai già un account?</p>
					<Link to="/login">
						<p className="text-[#EE0E51] hover:underline text-xs sm:text-sm md:text-base">Accedi ora</p>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default RegisterPage;

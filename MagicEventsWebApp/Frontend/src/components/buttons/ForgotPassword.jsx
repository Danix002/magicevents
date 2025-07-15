import { useState } from 'react';
import Button from './Button';
import { forgotPasswordRequest } from '../../api/authentication';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage(null);
		setLoading(true);
		try {
			const res = await forgotPasswordRequest(email);
			const message = await res.text();
			if (!res.ok) {
				setMessage('Email non trovata');
				return;
			}
			if (message === 'Email address not registered') {
				setMessage('Email non trovata');
				return;
			}
			setMessage('Apri la tua email per reimpostare la password');
		} catch (error) {
			setMessage(`Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full">
			<h2 className="text-[#E4DCEF] text-base sm:text-lg font-semibold mb-3 sm:mb-4">Password dimenticata?</h2>
			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<input
					type="email"
					placeholder="Inserisci l'email associata all'account"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="p-2 sm:p-3 rounded-lg border-2 border-gray-300 focus:border-[#EE0E51] focus:outline-none bg-white text-[#363540] text-sm sm:text-base"
					disabled={loading}
				/>
				<Button 
					text={loading ? 'Caricamento...' : 'Invia'}
					disabled={loading}
					custom="w-full py-2 sm:py-3 font-semibold text-sm sm:text-base"
				/>
			</form>
			{message && (
				<p className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium ${
					message.startsWith('Error' || 'Email non trovata') 
						? 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500' 
						: 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
				}`}>
					{message}
				</p>
			)}
		</div>
	);
}

export default ForgotPassword;

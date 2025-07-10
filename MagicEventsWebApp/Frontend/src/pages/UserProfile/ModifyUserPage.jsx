import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { modifyUser } from '../../api/authentication';
import { faEdit, faClose, faUser, faEnvelope, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import imageCompression from 'browser-image-compression';

function UserEditPage({ setLogged }) {
	const navigate = useNavigate();
	const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setLoading(true);
		
		try {
			const res = await modifyUser(JSON.stringify(user));
			if (!res.ok) throw new Error('error for user modify operation');
			setMessage('Modifica riuscita');
			sessionStorage.setItem('user', JSON.stringify(user));
			navigate('/modifyuser');
			setLogged(false);
			setTimeout(() => {
				setLogged(true);
			}, 100);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	let img = user.profileImageUrl;
	if (img === null || !img) {
		img = '/default-avatar.png';
	}

	const [editingImage, setEditingImage] = useState(false);
	const imgInput = useRef(null);

	const handleChangeImage = (e) => {
		imageUploaded(e.target.files[0]);
	};

	const handleRemoveImage = () => {
		setUser((prev) => ({ ...prev, ['profileImageUrl']: '' }));
	};

	async function imageUploaded(file) {
		const options = {
			maxSizeMB: 0.05,
			maxWidthOrHeight: 800,
			useWebWorker: true,
			fileType: 'image/jpeg',
		};

		const compressedFile = await imageCompression(file, options);
		let reader = new FileReader();
		reader.onload = function () {
			const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
			setUser((prev) => ({ ...prev, profileImageUrl: base64String }));
		};
		reader.readAsDataURL(compressedFile);
	}

	return (
		<div className="h-full overflow-y-auto bg-gradient-to-br from-[#505458] to-[#363540] p-4 flex justify-center items-center">
			<div className="w-full max-w-2xl bg-[#E4DCEF] shadow-2xl rounded-2xl overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-[#EE0E51] to-[#ff4574] p-6 text-center">
					<h2 className="text-3xl font-bold text-white">Modifica Profilo</h2>
				</div>

				<div className="p-6">
					{/* Profile Image Section */}
					<div className="flex flex-col items-center mb-8">
						<div className="relative group">
							<img
								src={
									img.startsWith('http')
										? img.replace(/'+$/, '')
										: img.startsWith('/default-avatar.png')
											? img
											: 'data:image/*;base64,' + img
								}
								alt="Profile"
								className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
							/>
							<div
								className="absolute inset-0 bg-opacity-50 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
								<div className="flex gap-2">
									<button
										onClick={() => setEditingImage(true)}
										className="p-3 sm:p-2 bg-white bg-opacity-75 rounded-full text-[#505458] hover:text-[#363540] shadow-md transition-colors"
										aria-label="Modifica immagine"
									>
										<FontAwesomeIcon icon={faEdit}/>
									</button>
									<button
										onClick={handleRemoveImage}
										className="p-3 sm:p-2 bg-white bg-opacity-75 rounded-full text-[#505458] hover:text-[#363540] shadow-md transition-colors"
										aria-label="Rimuovi immagine"
									>
										<FontAwesomeIcon icon={faClose}/>
									</button>
								</div>
							</div>
						</div>

						{editingImage && (
							<div className="mt-4 w-full max-w-md">
								<Input
									onChange={handleChangeImage}
									ref={imgInput}
									label={<label className="block text-sm font-medium mb-1 text-[#363540]">Modifica
										immagine</label>}
									name="immagine"
									type="file"
									accept="image/*"
									rigthComponent={
										<Button
											custom="!bg-transparent !hover:bg-black/50 !border-none mt-[0.15rem]"
											onClick={() => {
												imgInput.current.value = '';
												setEditingImage(false);
											}}
											text={<FontAwesomeIcon icon={faClose} className="text-black"/>}
										/>
									}
								/>
							</div>
						)}
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-sm font-semibold text-[#363540] uppercase tracking-wide">
									<FontAwesomeIcon icon={faUser} className="text-[#EE0E51]" />
									Username
								</label>
								<input
									type="text"
									name="username"
									value={user.username}
									onChange={handleChange}
									className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white"
									required
								/>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2 text-sm font-semibold text-[#363540] uppercase tracking-wide">
									<FontAwesomeIcon icon={faEnvelope} className="text-[#EE0E51]" />
									Email
								</label>
								<input
									type="email"
									name="email"
									value={user.email}
									onChange={handleChange}
									className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white"
									required
								/>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2 text-sm font-semibold text-[#363540] uppercase tracking-wide">
									<FontAwesomeIcon icon={faIdCard} className="text-[#EE0E51]" />
									Nome
								</label>
								<input
									type="text"
									name="name"
									value={user.name}
									onChange={handleChange}
									className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white"
								/>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2 text-sm font-semibold text-[#363540] uppercase tracking-wide">
									<FontAwesomeIcon icon={faIdCard} className="text-[#EE0E51]" />
									Cognome
								</label>
								<input
									type="text"
									name="surname"
									value={user.surname}
									onChange={handleChange}
									className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#EE0E51] transition-colors bg-white"
								/>
							</div>
						</div>

						{/* Messages */}
						{message && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<p className="text-green-700 font-medium">{message}</p>
							</div>
						)}
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-red-700 font-medium">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<div className="pt-4">
							<Button 
								custom="w-full py-3 text-lg font-semibold" 
								text={loading ? "Salvando..." : "Salva modifiche"} 
								type="submit"
								disabled={loading}
							/>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default UserEditPage;

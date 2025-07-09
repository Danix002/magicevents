import React from 'react';
import LogoutButton from '../../components/buttons/LogoutButton';
import DeleteUserButton from '../../components/buttons/DeleteUserButton';
import ModifierUserButton from '../../components/buttons/ModifierUserButton';

function UserProfilePage({ setLogged }) {
	const user = JSON.parse(sessionStorage.getItem('user'));
	if (!user) {
		return (
			<div className="h-full flex items-center justify-center bg-gradient-to-br from-[#505458] to-[#363540]">
				<p className="text-[#E4DCEF] text-xl">User not found</p>
			</div>
		);
	}

	let img = user.profileImageUrl;
	if (img === null || !img) {
		img = '/default-avatar.png';
	}

	return (
		<div className="h-full overflow-y-auto bg-gradient-to-br from-[#505458] to-[#363540] flex items-center justify-center p-4">
			<div className="w-full max-w-md mx-auto bg-[#E4DCEF] rounded-2xl shadow-2xl overflow-hidden">
				{/* Header Section */}
				<div className="bg-gradient-to-r from-[#EE0E51] to-[#ff4574] p-6 text-center">
					<img
						src={
							img.startsWith('http')
								? img.replace(/'+$/, '')
								: img.startsWith('/default-avatar.png')
								? img
								: 'data:image/*;base64,' + img
						}
						alt="Profile image"
						className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
					/>
					<h2 className="text-2xl font-bold text-white mt-4">Profilo Utente</h2>
				</div>

				{/* Profile Info */}
				<div className="p-6 space-y-4">
					<div className="bg-white rounded-lg p-4 shadow-sm">
						<label className="text-sm font-semibold text-[#363540] uppercase tracking-wide">Nome</label>
						<p className="text-lg text-[#505458] mt-1">{user.name}</p>
					</div>
					
					<div className="bg-white rounded-lg p-4 shadow-sm">
						<label className="text-sm font-semibold text-[#363540] uppercase tracking-wide">Cognome</label>
						<p className="text-lg text-[#505458] mt-1">{user.surname}</p>
					</div>
					
					<div className="bg-white rounded-lg p-4 shadow-sm">
						<label className="text-sm font-semibold text-[#363540] uppercase tracking-wide">Username</label>
						<p className="text-lg text-[#505458] mt-1">{user.username}</p>
					</div>
					
					<div className="bg-white rounded-lg p-4 shadow-sm">
						<label className="text-sm font-semibold text-[#363540] uppercase tracking-wide">Email</label>
						<p className="text-lg text-[#505458] mt-1 break-all">{user.email}</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="p-6 space-y-3 bg-gray-50">
					<div className="text-center">
						<LogoutButton setLogged={setLogged} />
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="flex-1">
							<DeleteUserButton user={user} setLogged={setLogged} style={{ width: '100%' }} />
						</div>
						<div className="flex-1">
							<ModifierUserButton style={{ width: '100%' }} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserProfilePage;

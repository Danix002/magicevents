import { url } from '../../utils/utils';

function GoogleButton() {
	const userManagementUrl = `${url}:8443`;
	const googleClientId = '856285122317-g1d4mlarfh9s00pubcj8uc1lij9h0peq.apps.googleusercontent.com';
	const redirectUri = `https://${userManagementUrl}/login/grantcode`;
	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
		redirectUri
	)}&response_type=code&client_id=${googleClientId}&scope=${encodeURIComponent(
		'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid'
	)}&access_type=offline`;

	return (
		<button
			className="flex justify-center w-full items-center bg-white text-[#3c4043] border-2 border-gray-300 rounded-lg py-2 px-3 sm:py-3 sm:px-4 hover:bg-gray-50 hover:border-[#EE0E51] transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
			onClick={() => (window.location.href = googleAuthUrl)}
		>
			<svg style={{ marginRight: '8px' }} width="16" height="16" viewBox="0 0 48 48" className="sm:w-5 sm:h-5 sm:mr-3">
				<path
					fill="#EA4335"
					d="M24 9.5c3.54 0 6.7 1.22 9.2 3.22l6.86-6.86C35.68 1.7 30.13 0 24 0 14.78 0 6.73 5.82 2.74 14.29l8.2 6.38C13.03 13.32 18.06 9.5 24 9.5z"
				/>
				<path
					fill="#4285F4"
					d="M46.1 24.5c0-1.66-.14-3.28-.41-4.84H24v9.15h12.4c-.55 2.9-2.24 5.35-4.76 7.02l7.38 5.76C43.76 37.5 46.1 31.43 46.1 24.5z"
				/>
				<path
					fill="#FBBC05"
					d="M10.94 28.34A14.5 14.5 0 019.5 24c0-1.52.26-2.98.74-4.34l-8.2-6.38A23.95 23.95 0 000 24c0 3.86.92 7.5 2.54 10.71l8.4-6.37z"
				/>
				<path
					fill="#34A853"
					d="M24 48c6.13 0 11.68-2.03 15.67-5.52l-7.38-5.76c-2.07 1.38-4.72 2.18-8.3 2.18-5.94 0-10.97-3.82-12.97-9.17l-8.4 6.37C6.73 42.18 14.78 48 24 48z"
				/>
				<path fill="none" d="M0 0h48v48H0z" />
			</svg>
			<span className="text-sm sm:text-base">Accedi con Google</span>
		</button>
	);
}

export default GoogleButton;

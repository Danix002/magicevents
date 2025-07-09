import { url } from '../utils/utils';

const userManagementUrl = `https://${url}:8443`;

export function login(formData) {
	const params = new URLSearchParams();
	for (const key in formData) {
		params.append(key, formData[key]);
	}

	try {
		return fetch(`${userManagementUrl}/login/form?${params.toString()}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
	} catch (err) {
		console.error('Error:', err.message);
		return null;
	}
}

export function helloServer(protocol) {
	return fetch(`${userManagementUrl}/login/helloserver?protocol=` + protocol, {
		method: 'GET',
	});
}

export function forgotPasswordRequest(email) {
	return fetch(`${userManagementUrl}/login/generateresetpasswordlink`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			email: email,
		}).toString(),
	});
}

export function register(formData) {
	const params = new URLSearchParams();
	for (const key in formData) {
		params.append(key, formData[key]);
	}
	return fetch(`${userManagementUrl}/login/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});
}

export function modifyUser(user) {
	return fetch(`${userManagementUrl}/info/modifyuser`, {
		method: 'PUT',
		headers: {
			Authorization: JSON.parse(sessionStorage.getItem('user')).token,
			'Content-Type': 'application/json',
		},
		body: user,
	});
}

export function deleteUser(email) {
	return fetch(`${userManagementUrl}/info/deleteuser`, {
		method: 'DELETE',
		headers: {
			Authorization: JSON.parse(sessionStorage.getItem('user')).token,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			email: email,
		}).toString(),
	});
}

export function callback(accessToken) {
	return fetch(`${userManagementUrl}/login/userprofile?accessToken=${accessToken}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

export function logout() {
	return fetch(`${userManagementUrl}/info/logoutuser`, {
		method: 'PUT',
		headers: {
			Authorization: JSON.parse(sessionStorage.getItem('user')).token,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			email: JSON.parse(sessionStorage.getItem('user')).email,
		}).toString(),
	});
}

export function getUserFromId(userId) {
	return fetch(`${userManagementUrl}/info/profile?magicEventTag=${userId}`, {
		method: 'GET',
		headers: {
			Authorization: JSON.parse(sessionStorage.getItem('user')).token,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

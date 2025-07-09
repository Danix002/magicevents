export function isAdmin(eventId) {
	const userId = JSON.parse(sessionStorage.getItem('user')).magicEventTag;
	return (
		sessionStorage.getItem('admin' + userId) !== null &&
		JSON.parse(sessionStorage.getItem('admin' + userId)).includes(eventId.toString())
	);
}

export function setAdmin(eventId) {
	const userId = JSON.parse(sessionStorage.getItem('user')).magicEventTag;
	if (sessionStorage.getItem('admin' + userId)) {
		var admin = JSON.parse(sessionStorage.getItem('admin' + userId));
		if (!admin.includes(eventId)) {
			admin.push(eventId);
			sessionStorage.setItem('admin' + userId, JSON.stringify(admin));
		}
	} else {
		sessionStorage.setItem('admin' + userId, JSON.stringify([eventId]));
	}
}

export const url = 'localhost';

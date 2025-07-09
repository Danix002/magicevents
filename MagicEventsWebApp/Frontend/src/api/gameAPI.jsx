import { url } from '../utils/utils';

const guestGameUrl = `https://${url}:8083`;

export function getGame(eventID) {
	return fetch(
		`${guestGameUrl}/guest-game/createDecisionTree/${eventID}?userMagicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'GET',
			headers: {
				Authorization: JSON.parse(sessionStorage.getItem('user')).token,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function isDataInGame(eventID) {
	return fetch(
		`${guestGameUrl}/guest-game/hasUserInsertedInfo/${eventID}?userMagicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'GET',
			headers: {
				Authorization: JSON.parse(sessionStorage.getItem('user')).token,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function insertInfo(formData) {
	return fetch(`${guestGameUrl}/guest-game/insertGuestInfo`, {
		method: 'POST',
		headers: { Authorization: JSON.parse(sessionStorage.getItem('user')).token, 'Content-Type': 'application/json' },
		body: JSON.stringify(formData),
	});
}

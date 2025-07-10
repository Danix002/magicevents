import { url } from '../utils/utils';

const boardUrl = `https://${url}:8081`;

export function getMessages(eventID, pageNumber) {
	return fetch(
		`${boardUrl}/board/getBoard/${eventID}/${pageNumber}?userMagicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

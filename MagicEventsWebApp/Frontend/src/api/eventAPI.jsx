import { url } from '../utils/utils';

const eventsManagementUrl = `https://${url}:8080`;
const eventsetupUrl = `https://${url}:8086`;

export function getEventsp() {
	return fetch(
		`${eventsManagementUrl}/gestion/geteventslistp?partecipantId=${
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

export function getEventsc() {
	return fetch(
		`${eventsManagementUrl}/gestion/geteventslistc?creatorId=${
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

export function getEventId(title, day) {
	const user = JSON.parse(sessionStorage.getItem('user'));
	const magicEventsTag = user?.magicEventTag;

	return fetch(
		`${eventsManagementUrl}/gestion/geteventid?title=${encodeURIComponent(title)}&day=${day}&magicEventTag=${magicEventsTag}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function annullEvent(eventId) {
	return fetch(
		`${eventsManagementUrl}/gestion/annullevent?eventId=${eventId}&magicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function activateServices(eventId, services) {
	const user = JSON.parse(sessionStorage.getItem('user'));
	const magicEventsTag = user?.magicEventTag;

	const url = `${eventsManagementUrl}/gestion/activeservices?eventId=${eventId}&magicEventsTag=${magicEventsTag}`;

	return fetch(url, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(services),
	});
}

export function getAdmins(eventId) {
	return fetch(
		`${eventsManagementUrl}/gestion/getadminsforevent?eventId=${eventId}&magicEventsTag=${
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

export function getPartecipants(eventId) {
	return fetch(`${eventsManagementUrl}/gestion/getpartecipantsforevent?eventId=${eventId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

export function modifyEvent(eventId, event) {
	const user = JSON.parse(sessionStorage.getItem('user'));
	const magicEventsTag = user?.magicEventTag;

	const url = `${eventsManagementUrl}/gestion/modify?eventId=${eventId}&magicEventsTag=${magicEventsTag}`;

	return fetch(url, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(event),
	});
}

export function activeEvent(eventId) {
	return fetch(
		`${eventsManagementUrl}/gestion/activeevent?eventId=${eventId}&magicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function updateAdmins(eventId, newAdmins) {
	return fetch(
		`${eventsManagementUrl}/gestion/updateadmins?admins=${newAdmins}&eventId=${eventId}&magicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function updatePartecipants(
	eventId,
	newPartecipants,
	magicEventTag = JSON.parse(sessionStorage.getItem('user')).magicEventTag
) {
	return fetch(
		`${eventsManagementUrl}/gestion/addpartecipants?partecipants=${newPartecipants}&eventId=${eventId}&magicEventsTag=${magicEventTag}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function removePartecipant(eventId, partecipantEmail) {
	return fetch(
		`${eventsManagementUrl}/gestion/removepartecipant?partecipant=${partecipantEmail}&eventId=${eventId}&magicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function removeAdmin(eventId, adminEmail) {
	return fetch(
		`${eventsManagementUrl}/gestion/removeadmin?admin=${adminEmail}&eventId=${eventId}&magicEventsTag=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

export function getEvent(eventId) {
	return fetch(`${eventsManagementUrl}/gestion/geteventinfo?eventId=${eventId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

export function getEventService(eventId) {
	const params = new URLSearchParams();
	params.append('eventId', eventId);
	params.append('magicEventTag', JSON.parse(sessionStorage.getItem('user')).magicEventTag);
	return fetch(`${eventsManagementUrl}/gestion/geteventenabledservices?${params}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
}

export function createEvent(event) {
	var temp = JSON.parse(JSON.stringify(event));
	temp.participants = temp.participants.filter((item) => !temp.admins.includes(item));
	console.log(temp);
	return fetch(`${eventsetupUrl}/eventSetup`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(temp),
	});
}

export function deleteEvent(eventId) {
	const user = JSON.parse(sessionStorage.getItem('user'));
	const magicEventsTag = user?.magicEventTag;

	const urldelete = `${eventsManagementUrl}/gestion/delete?eventId=${eventId}&magicEventsTag=${encodeURIComponent(
		magicEventsTag
	)}`;

	return fetch(urldelete, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
		},
	});
}

export function isActive(eventId) {
	return fetch(
		`${eventsManagementUrl}/gestion/isactive?creatorId=${
			JSON.parse(sessionStorage.getItem('user')).magicEventTag
		}&eventId=${eventId}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);
}

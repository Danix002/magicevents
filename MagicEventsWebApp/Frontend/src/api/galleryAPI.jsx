import { url } from '../utils/utils';

const galleryUrl = `https://${url}:8085`;

export function getImages(eventID, pageNumber) {
	return fetch(
		`${galleryUrl}/gallery/getGallery/${eventID}/${pageNumber}?userMagicEventsTag=${
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

export function getImagesPopular(eventID, pageNumber) {
	return fetch(
		`${galleryUrl}/gallery/getGalleryPopular/${eventID}/${pageNumber}?userMagicEventsTag=${
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

export function subscribe(client, url, onRecieve) {
	return client.subscribe(url, (message) => {
		console.log('Message received:', message);
		try {
			var hash = require('object-hash');
			const receivedImage = JSON.parse(message.body);
			onRecieve(receivedImage, hash);
			//setImages((prev) => [receivedImage, ...prev.filter((item) => !(hash(item) === hash(receivedImage)))]);
		} catch (error) {
			console.error('Error parsing message:', error);
		}
	});
}

export function send(client, url, mex) {
	client.send(url, {}, JSON.stringify(mex));
}

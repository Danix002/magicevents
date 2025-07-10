export function generateQRCodeForEvent(eventUrl) {
    return fetch('https://api.qrcode-tiger.com/qr/static', {
        method: 'POST',
        headers: {
            Authorization: `Bearer 302849d0-5d57-11f0-b498-a30c21e670a8`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            size: 500,
            qrCategory: 'url',
            qrUrl: eventUrl,
            frameText: 'Partecipa all\'evento',
            colorDark: 'rgb(0,0,0)',
            backgroundColor: 'rgb(255,255,255)',
            transparentBkg: false
        }),
    });
}

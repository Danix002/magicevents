export function generateQRCodeForEvent(eventUrl) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const magicEventsTag = user?.magicEventTag;
    const redirectUrl = `${eventUrl}/${magicEventsTag}/addpartecipant`
    console.log(redirectUrl);

    const apiKey = '302849d0-5d57-11f0-b498-a30c21e670a8';
    return fetch('https://api.qrtiger.com/api/qr/static', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            qrCategory: "url",
            text: redirectUrl,
            qrData: "pattern9",
            gradient: true,
            grdType: "linear",
            gradientColor1: "#f58529",
            gradientColor2: "#833ab4"
        }),
    });
}

import React, { useState } from 'react';
import Button from './Button';
import { generateQRCodeForEvent } from '../../api/qrGenerator';

const QRCodeGenerator = () => {
    const [qrUrl, setQrUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const eventUrl = window.location.href;
            const response = await generateQRCodeForEvent(eventUrl);
            const data = await response.json();
            setQrUrl(data.url);
        } catch (error) {
            console.error('Errore nella generazione del QR:', error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center p-4 gap-4">
            <Button text={loading ? 'Generazione...' : 'Genera QR Evento'} onClick={handleGenerate} disabled={loading} />
            {qrUrl && (
                <img src={qrUrl} alt="QR evento" className="w-64 h-64 border mt-4" />
            )}
        </div>
    );
};

export default QRCodeGenerator;

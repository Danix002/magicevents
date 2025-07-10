import React, { useState } from 'react';
import Button from './Button';
import { generateQRCodeForEvent } from '../../api/qrGenerator';

const QRCodeGenerator = ({
                             isAdmin = false
                         }) => {
    const [qrUrl, setQrUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const eventUrl = window.location.href.replace(':3000', '');;
            const response = await generateQRCodeForEvent(eventUrl);
            const data = await response.json();
            console.log(data);
            setQrUrl(data.url);
        } catch (error) {
            console.error('Errore nella generazione del QR:', error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center p-4 gap-4">
            {isAdmin && (
                <>
                    {!qrUrl && (
                        <Button
                            text={loading ? 'Generazione...' : 'Genera QR Evento'}
                            onClick={handleGenerate}
                            disabled={loading}
                        />
                    )}
                    {qrUrl && (
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <img src={qrUrl} alt="QR evento" className="w-64 h-64 border"/>
                            <p className="mb-2 text-lg font-semibold text-gray-800">
                                Scarica e condividi il QR qua:
                            </p>
                            <a
                                href={qrUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 hover:text-blue-800 hover:underline break-words transition-colors duration-200"
                            >
                                {qrUrl}
                            </a>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default QRCodeGenerator;

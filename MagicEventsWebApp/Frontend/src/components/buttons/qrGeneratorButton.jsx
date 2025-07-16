import React, { useState } from 'react';
import Button from './Button';
import { generateQRCodeForEvent } from '../../api/qrGeneratorAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faQrcode} from '@fortawesome/free-solid-svg-icons'

const QRCodeGenerator = ({
                             isAdmin = false
                         }) => {
    const [qrUrl, setQrUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const eventUrl = window.location.href;
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
        <div className="flex flex-col w-full sm:w-fit items-center p-2 sm:p-4 gap-3 sm:gap-4">
            {isAdmin && (
                <>
                    {!qrUrl && (
                        <Button
                            text={loading ? 'Generazione...' : <FontAwesomeIcon icon={faQrcode} className="text-[#1a1a1a] text-xl sm:text-3xl"/>}
                            onClick={handleGenerate}
                            disabled={loading}
                            custom="!px-4 !py-2 sm:!px-6 sm:!py-3 !rounded-full !text-base sm:!text-xl !bg-[#E4DCEF] !text-[#1a1a1a] hover:!scale-105 transition-all"
                        />
                    )}
                    {qrUrl && (
                        <div className="flex flex-col items-center gap-2 mt-2 sm:mt-4 px-4 sm:px-0">
                            <img src={qrUrl} alt="QR evento" className="w-48 h-48 sm:w-64 sm:h-64 border"/>
                            <p className="mb-2 text-base sm:text-lg font-semibold text-gray-800 text-center">
                                Scarica e condividi il QR qua:
                            </p>
                            <a
                                href={qrUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 hover:text-blue-800 hover:underline break-all sm:break-words transition-colors duration-200 text-sm sm:text-base text-center px-2"
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

import { useRef, useState } from 'react';

import imageCompression from 'browser-image-compression';
import Popup from './Popup';
import Button from '../buttons/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import Input from '../inputs/Input';
import { useDropzone } from 'react-dropzone';

const ImageDrop = ({ onSend }) => {
	const addImageRef = useRef(null);
	const [image, setImage] = useState('');
	const [title, setTitle] = useState('');
	const [error, setError] = useState('');
	const { getRootProps, getInputProps } = useDropzone({
		accept: 'image/*',
		onDrop: (acceptedFiles) => {
			imageUploaded(acceptedFiles[0]);
		},
	});

	function onClick() {
		if (!addImageRef) return;
		addImageRef.current.click();
	}

	async function imageUploaded(file) {
		let base64String = '';

		let reader = new FileReader();
		const options = {
			maxSizeMB: 2, // Massimo 15MB
			maxWidthOrHeight: 800, // Massimo 800px
			useWebWorker: true, // Usa Web Worker per non bloccare l'UI
			fileType: 'image/png',
		};
		const compressedFile = await imageCompression(file, options);

		reader.onload = function () {
			base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
			setImage(base64String);
		};
		reader.readAsDataURL(compressedFile);
	}

	function selectImage() {
		if (!addImageRef) return;
		imageUploaded(addImageRef.current.files[0]);
	}

	function deselectImage() {
		if (!addImageRef) return;
		setImage('');
	}

	function send() {
		if (!title) {
			setError('Titolo mancante');
			return;
		}
		if (!image) {
			setError('Immagine mancante');
			return;
		}

		onSend(title, image);
		setTitle('');
		setImage('');
	}

	return (
		<Popup
			title="Invia un'immagine"
			children={
				<div className="flex flex-col items-center justify-center p-2">
					{!image ? (
						<button
							{...getRootProps({ className: 'dropzone' })}
							onClick={onClick}
							className="border-3 border-[#E4DCEF] border-dashed rounded-md w-full aspect-4/5"
						>
							Drag&Drop
						</button>
					) : (
						<div className="space-y-4">
							<div className="h-fit ring-2 ring-offset-1 rounded-md ring-[#E4DCEF] relative">
								<img
									className="aspect-4/5 object-cover h-64 w-full"
									src={'data:image/*;base64,' + image}
									alt="drag&drop"
								/>
								<Button
									secondary
									onClick={deselectImage}
									custom="absolute right-2 bottom-2 !px-2 h-8 flex items-center justify-center shadow-[20rem] !rounded-full "
									text={<FontAwesomeIcon className="text-xl" icon={faClose} />}
								></Button>
								<Button
									onClick={() => send()}
									custom="absolute right-12 bottom-2 !px-6  h-8 flex items-center justify-center shadow-[20rem] !rounded-full "
									text={'Invia'}
								></Button>
							</div>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								name={'titolo'}
								label={'Titolo immagine'}
							></Input>
							<p className="text-xs text-[#EE0E51] ">{error}</p>
						</div>
					)}
					<input
						{...getInputProps()}
						onChange={selectImage}
						className="hidden"
						ref={addImageRef}
						type="file"
						accept="image/*"
					/>
				</div>
			}
		/>
	);
};

export default ImageDrop;

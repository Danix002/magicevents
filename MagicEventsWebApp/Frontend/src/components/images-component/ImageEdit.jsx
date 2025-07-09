import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const ImageEdit = ({src, alt, onEditClick}) => { 
  return (
    <div className="relative w-full max-h-[48rem] rounded-md overflow-hidden border border-[#E4DCEF] ring ring-[#E4DCEF] ring-offset-2">
      <img
        className="w-full border border-[#E4DCEF] rounded-md ring ring-[#E4DCEF] ring-offset-2 flex-auto max-h-[48rem] object-cover"
        src={'data:image/*;base64,' + src}
        alt={alt}
      />
      <button
        onClick={onEditClick}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white bg-opacity-75 rounded-full text-[#505458] hover:text-[#363540] shadow-md"
        aria-label="Modifica immagine"
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
    </div>
  );
}

export default ImageEdit;

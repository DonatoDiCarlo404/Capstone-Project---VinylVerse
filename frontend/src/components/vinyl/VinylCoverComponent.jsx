import { DEFAULT_VINYL_COVER } from '../../utils/constants';

export const VinylCoverComponent = ({ vinyl, className = "card-img-top" }) => {
  console.log('Cover URL:', vinyl.coverImage);

  return (
    <img 
      src={vinyl.coverImage || DEFAULT_VINYL_COVER}
      alt={vinyl.title}
      className={className}
      onError={(e) => {
        console.log('Errore caricamento immagine, uso fallback');
        if (e.target.src !== DEFAULT_VINYL_COVER) {
          e.target.src = DEFAULT_VINYL_COVER;
        }
      }}
    />
  );
};

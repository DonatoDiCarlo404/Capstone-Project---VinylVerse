import { useContext } from 'react';
import { ThemeContext } from '../../modules/context';

const Footer = () => {
  const [theme, setTheme] = useContext(ThemeContext);

  return (
    <footer className={`${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
      } py-4 mt-auto`}
      data-bs-theme={theme}
    >
      <div className="container text-center">
        <p className="mb-0">&copy; 2025 VinylVerse. All rights reserved.
          <i className="bi bi-facebook ms-1"></i>
          <i className="bi bi-whatsapp ms-1"></i>
          <i className="bi bi-instagram ms-1"></i>
          <i className="bi bi-threads ms-1"></i>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
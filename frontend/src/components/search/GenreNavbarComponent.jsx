import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GenreNavbarComponent = () => {
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('https://vinylverse-backend.onrender.com/api/vinyl/genres');
                if (!response.ok) throw new Error('Errore nel caricamento dei generi');
                const data = await response.json();
                setGenres(data.genres || []);
            } catch (error) {
                console.error('Errore:', error);
            }
        };

        fetchGenres();
    }, []);

    const handleGenreChange = (e) => {
        const genre = e.target.value;
        setSelectedGenre(genre);
        if (genre) {
            navigate(`/browse/${genre}`);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
            <div className="container">
                <span className="navbar-brand">Generi più amati</span>
                <div className="ms-auto">
                    <select
                        className="form-select"
                        value={selectedGenre}
                        onChange={handleGenreChange}
                    >
                        <option value="">Seleziona un genere</option>
                        {genres.map((genre) => (
                            <option key={genre} value={genre.toLowerCase()}>
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default GenreNavbarComponent;
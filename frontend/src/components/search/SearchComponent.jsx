import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import SpinnerComponent from '../layout/SpinnerComponent';

const SearchComponent = () => {
    const [searchType, setSearchType] = useState('artist');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const { isLoading, setIsLoading } = useLoading();
    const [error, setError] = useState(null);

    useEffect(() => {
    // Mantieni i risultati della ricerca precedente
    const lastResults = localStorage.getItem('lastSearchResults');
    if (lastResults) {
        const savedData = JSON.parse(lastResults);
        setSearchQuery(savedData.query);

        if (savedData.type === 'album') {
            setSearchType('title');
            handleAlbumSearch(savedData.query);
        } else if (savedData.artist) {
            setSearchType('artist');
            setResults([savedData.artist]);
        }

        // Pulizia risultati precedenti
        localStorage.removeItem('lastSearchResults');
    }
}, []);

    const handleArtistSearch = async (query) => {
        try {
            const params = new URLSearchParams({
                query: query,
                page: 1
            });

            const response = await fetch(`http://localhost:3001/api/vinyl/search/artist?${params}`);
            if (!response.ok) throw new Error('Errore nella ricerca');

            const data = await response.json();
            setResults(data.discogs.results || []);

            if (data.discogs.results.length === 0) {
                setError('Nessun artista trovato');
            }
        } catch (error) {
            console.error('Artist search error:', error);
            setError('Si è verificato un errore durante la ricerca dell\'artista');
        }
    };

    const handleAlbumSearch = async (query) => {
        try {
            const params = new URLSearchParams({
                query: query,
                page: 1,
                type: 'release' // Changed from 'master' to 'release'
            });

            const response = await fetch(`http://localhost:3001/api/vinyl/search/album?${params}`);
            if (!response.ok) throw new Error('Errore nella ricerca');

            const data = await response.json();
            console.log('Raw album search results:', data); // Debug log

            // Filter and process results
            const processedResults = (data.discogs.results || [])
                .filter(album => album.type === 'master' || album.type === 'release')
                .map(album => ({
                    ...album,
                    id: album.id,
                    master_id: album.master_id || album.id,
                    title: album.title,
                    artist: album.artist
                }));

            console.log('Processed album results:', processedResults); // Debug log
            setResults(processedResults);

            if (processedResults.length === 0) {
                setError('Nessun album trovato');
            }
        } catch (error) {
            console.error('Album search error:', error);
            setError('Si è verificato un errore durante la ricerca dell\'album');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            if (searchType === 'artist') {
                await handleArtistSearch(searchQuery);
            } else {
                await handleAlbumSearch(searchQuery);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeChange = (e) => {
        setSearchType(e.target.value);
        setSearchQuery('');  // Pulisci la query
        setResults([]);      // Pulisci i risultati
        setError(null);      // Resetta gli errori
    };

    const handleQueryChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value === '') {
            setResults([]);  // Pulisci i risultati se la query è vuota
            setError(null);  // Resetta gli errori
        }
    };


    const renderResults = () => {
        if (searchType === 'artist') {
            const artist = results[0]; // Prendiamo solo il primo risultato
            return artist ? (
                <div className="col-md-6 mx-auto mb-4">
                    <div className="card h-100 shadow-sm">
                        <img
                            src={artist.thumb || 'https://placehold.co/300x300?text=No+Image'}
                            className="card-img-top"
                            alt={artist.name}
                            style={{ height: '400px', objectFit: 'cover' }}
                            onError={(e) => {
                                console.log('Image load error:', e);
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/300x300?text=No+Image';
                            }}
                        />
                        <div className="card-body text-center">
                            <h3 className="card-title mb-4">{artist.name}</h3>
                            <Link
                                to={`/artist/${artist.id}`}
                                className="btn btn-primary btn-lg w-75"
                            >
                                Vedi Profilo Artista
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null;
        }

        return results.map((vinyl) => (
            <div key={vinyl.id} className="col-md-3 mb-4">
                <div className="card h-100 shadow-sm">
                    <img
                        src={vinyl.cover_image}
                        className="card-img-top"
                        alt={vinyl.title}
                        style={{ height: '300px', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x300?text=No+Image';
                        }}
                    />
                    <div className="card-body">
                        <h5 className="card-title">{vinyl.title}</h5>
                        <p className="card-text">{vinyl.artist}</p>
                        <Link
                            to={`/vinyl/${vinyl.master_id}?type=master`}
                            className="btn btn-primary w-100"
                            onClick={() => {
                                console.log('Navigating to album:', {
                                    title: vinyl.title,
                                    id: vinyl.master_id,
                                    type: 'master'
                                });
                            }}
                        >
                            Vedi Album
                        </Link>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Cerca Vinili</h1>

            <form onSubmit={handleSearch} className="mb-5">
                <div className="row g-3">
                    <div className="col-md-3">
                        <select
                            id="searchType"
                            className="form-select form-select-lg"
                            value={searchType}
                            onChange={handleTypeChange}
                        >
                            <option value="artist">Artista</option>
                            <option value="title">Titolo Album</option>
                        </select>
                    </div>
                    <div className="col-md-5">
                        <input
                            type="text"
                            id="searchQuery"
                            name="searchQuery"
                            className="form-control form-control-lg"
                            placeholder={
                                searchType === 'artist' ? 'Cerca per artista...' :
                                    searchType === 'title' ? 'Cerca per titolo...' :
                                        'Cerca artista o titolo...'
                            }
                            value={searchQuery}
                            onChange={handleQueryChange}
                        />
                    </div>
                    <div className="col-md-2">
                        <button
                            type="submit"
                            id="searchButton"
                            className="btn btn-primary btn-lg w-100"
                            disabled={!searchQuery.trim()}
                        >
                            Cerca
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="alert alert-danger text-center mb-4">
                    {error}
                </div>
            )}
            <div className="row g-4">
                {isLoading ? (
                    <div className="col-12 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <SpinnerComponent />
                    </div>
                ) : Array.isArray(results) && results.length > 0 ? (
                    renderResults()
                ) : (
                    <div className="col-12 text-center">
                        <p className="text-muted">
                            {searchQuery ? 'Nessun risultato trovato' : 'Inizia la tua ricerca'}
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SearchComponent;
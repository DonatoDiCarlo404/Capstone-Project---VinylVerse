import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-4 fw-bold">Welcome to VinylVerse</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            Discover and collect your favorite vinyl records.
            Browse our extensive collection of new and vintage vinyl.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <button className="btn btn-primary btn-lg px-4 gap-3">
              Browse Collection
            </button>
            <button className="btn btn-outline-secondary btn-lg px-4">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="row">
        <h2 className="text-center mb-4">Featured Vinyl</h2>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="col-md-3 mb-4">
            <div className="card h-100">
              <img
                src="https://via.placeholder.com/300"
                className="card-img-top"
                alt="Featured vinyl"
              />
              <div className="card-body">
                <h5 className="card-title">Featured Album</h5>
                <p className="card-text">Artist Name</p>
                <p className="card-text fw-bold">€24.99</p>
                <button className="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Section */}
      <div className="row mt-5">
        <h2 className="text-center mb-4">Browse by Genre</h2>
        {['Rock', 'Jazz', 'Classical', 'Electronic'].map((genre) => (
          <div key={genre} className="col-md-3 mb-4">
            <div className="card bg-dark text-white">
              <img
                src="https://via.placeholder.com/300"
                className="card-img opacity-50"
                alt={genre}
              />
              <div className="card-img-overlay d-flex align-items-center justify-content-center">
                <h3 className="card-title">{genre}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
const Browse = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Browse Vinyl Records</h2>
      
      {/* Filtri */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search records..."
          />
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option value="">All Genres</option>
            <option value="rock">Rock</option>
            <option value="jazz">Jazz</option>
            <option value="electronic">Electronic</option>
            <option value="classical">Classical</option>
          </select>
        </div>
      </div>

      {/* Griglia Vinili */}
      <div className="row g-4">
        {/* Placeholder per i vinili */}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="col-md-3">
            <div className="card h-100">
              <img 
                src="https://via.placeholder.com/300"
                className="card-img-top" 
                alt="Vinyl cover" 
              />
              <div className="card-body">
                <h5 className="card-title">Vinyl Title</h5>
                <p className="card-text">Artist Name</p>
                <p className="card-text"><small className="text-muted">Genre</small></p>
                <p className="card-text fw-bold">€29.99</p>
                <button className="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;
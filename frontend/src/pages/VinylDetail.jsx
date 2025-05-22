
const VinylDetail = () => {
  return (
    <div className="container py-5">
      <div className="row">
        {/* Immagine Vinile */}
        <div className="col-md-6 mb-4">
          <img
            src="https://via.placeholder.com/500"
            alt="Vinyl cover"
            className="img-fluid rounded"
          />
        </div>

        {/* Dettagli Vinile */}
        <div className="col-md-6">
          <h2 className="mb-3">Album Title</h2>
          <h4 className="text-muted mb-4">Artist Name</h4>
          
          <div className="mb-4">
            <h5>€29.99</h5>
            <span className="badge bg-success me-2">In Stock</span>
            <span className="badge bg-secondary">Rock</span>
          </div>

          <div className="mb-4">
            <h5>Description</h5>
            <p>
              Detailed description of the vinyl record, including information about 
              the album, artist, and release details.
            </p>
          </div>

          <div className="mb-4">
            <h5>Details</h5>
            <ul className="list-unstyled">
              <li><strong>Release Year:</strong> 2024</li>
              <li><strong>Label:</strong> Record Label</li>
              <li><strong>Format:</strong> 12" Vinyl</li>
              <li><strong>Condition:</strong> New</li>
            </ul>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary">Add to Cart</button>
            <button className="btn btn-outline-secondary">
              Play Preview
            </button>
          </div>
        </div>

        {/* Recensioni */}
        <div className="col-12 mt-5">
          <h3 className="mb-4">Reviews</h3>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h5 className="card-title">Username</h5>
                <div>⭐⭐⭐⭐⭐</div>
              </div>
              <p className="card-text">
                Sample review text describing the user's experience with this vinyl.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinylDetail;
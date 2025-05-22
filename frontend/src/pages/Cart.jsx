const Cart = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Your Cart</h2>
      
      {/* Lista elementi del carrello */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            {/* Placeholder per item carrello */}
            <div className="col-md-2">
              <img 
                src="https://via.placeholder.com/150" 
                alt="Vinyl cover" 
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-4">
              <h5 className="card-title">Vinyl Title</h5>
              <p className="card-text">Artist Name</p>
            </div>
            <div className="col-md-2">
              <input 
                type="number" 
                className="form-control" 
                min="1" 
                defaultValue="1"
              />
            </div>
            <div className="col-md-2">
              <p className="h5">€29.99</p>
            </div>
            <div className="col-md-2">
              <button className="btn btn-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* Riepilogo carrello */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>€29.99</h5>
          </div>
          <button className="btn btn-primary w-100 mt-3">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
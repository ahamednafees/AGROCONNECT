import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.userType !== "buyer") {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    alert("Logged out successfully!");
    navigate("/login");
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4" href="#">
            🌾 AgroConnect - Buyer
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav align-items-center gap-3">
              <li className="nav-item">
                <span className="text-white">
                  Welcome, <strong>{currentUser?.fullName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mt-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-success text-white">
              <div className="card-body p-4">
                <h2 className="mb-2">
                  👋 Welcome Back, {currentUser?.fullName}!
                </h2>
                <p className="mb-0">
                  Browse fresh products directly from local farmers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">🛒</div>
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Items in Cart</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">📦</div>
                <h3 className="stat-number">0</h3>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">⭐</div>
                <h3 className="stat-number">{products.length}</h3>
                <p className="stat-label">Available Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="search-box">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="🔍 Search products, farmers, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="mb-3 fw-bold">Available Products</h4>
          </div>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3 mb-4">
                <div className="card product-card h-100">
                  <div className="card-body">
                    <div className="product-image">{product.image}</div>
                    <h5 className="product-name">{product.name}</h5>
                    <p className="product-price">{product.price}</p>
                    <div className="product-info">
                      <small className="text-muted">👨‍🌾 {product.farmer}</small>
                      <br />
                      <small className="text-muted">
                        📍 {product.location}
                      </small>
                      <br />
                      <small className="text-warning">
                        ⭐ {product.rating}
                      </small>
                    </div>
                    <button className="btn btn-success btn-sm w-100 mt-3">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                No products found matching your search.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;

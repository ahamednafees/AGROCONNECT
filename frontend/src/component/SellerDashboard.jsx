import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "🌾",
    location: "",
    rating: 4.5,
  });

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.userType !== "seller") {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products");
      // Filter products by current seller
      const sellerProducts = response.data.filter(
        (p) =>
          p.farmer === JSON.parse(localStorage.getItem("currentUser")).fullName
      );
      setProducts(sellerProducts);
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        farmer: currentUser.fullName,
        location: currentUser.address.split(",").pop().trim(),
      };

      await axios.post("http://localhost:3001/products", productData);
      alert("Product added successfully!");
      setShowAddProduct(false);
      setNewProduct({
        name: "",
        price: "",
        image: "🌾",
        location: "",
        rating: 4.5,
      });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:3001/products/${productId}`);
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

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
      <nav className="navbar navbar-expand-lg navbar-dark bg-warning shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand fw-bold fs-4 text-dark" href="#">
            🌾 AgroConnect - Seller
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
                <span className="text-dark">
                  Welcome, <strong>{currentUser?.fullName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-dark" onClick={handleLogout}>
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
            <div className="card bg-gradient-warning">
              <div className="card-body p-4">
                <h2 className="mb-2">👨‍🌾 Welcome, {currentUser?.fullName}!</h2>
                <p className="mb-0">
                  Manage your products and reach more customers
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
                <div className="stat-icon">📦</div>
                <h3 className="stat-number">{products.length}</h3>
                <p className="stat-label">Total Products</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">💰</div>
                <h3 className="stat-number">₹0</h3>
                <p className="stat-label">Total Earnings</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <div className="stat-icon">⭐</div>
                <h3 className="stat-number">4.5</h3>
                <p className="stat-label">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="row mb-4">
          <div className="col-12">
            <button
              className="btn btn-warning btn-lg fw-bold"
              onClick={() => setShowAddProduct(!showAddProduct)}
            >
              {showAddProduct ? "❌ Cancel" : "➕ Add New Product"}
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddProduct && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h4 className="mb-3">Add New Product</h4>
                  <form onSubmit={handleAddProduct}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="₹40/kg"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              price: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Product Emoji</label>
                        <select
                          className="form-control"
                          value={newProduct.image}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              image: e.target.value,
                            })
                          }
                        >
                          <option value="🍅">🍅 Tomato</option>
                          <option value="🥔">🥔 Potato</option>
                          <option value="🥕">🥕 Carrot</option>
                          <option value="🥬">🥬 Leafy Green</option>
                          <option value="🥦">🥦 Broccoli</option>
                          <option value="🫘">🫘 Beans</option>
                          <option value="🌾">🌾 Grain</option>
                          <option value="🍎">🍎 Apple</option>
                          <option value="🍌">🍌 Banana</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-success">
                          Add Product
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Products */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="mb-3 fw-bold">My Products</h4>
          </div>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3 mb-4">
                <div className="card product-card h-100">
                  <div className="card-body">
                    <div className="product-image">{product.image}</div>
                    <h5 className="product-name">{product.name}</h5>
                    <p className="product-price">{product.price}</p>
                    <div className="product-info">
                      <small className="text-muted">
                        📍 {product.location}
                      </small>
                      <br />
                      <small className="text-warning">
                        ⭐ {product.rating}
                      </small>
                    </div>
                    <button
                      className="btn btn-danger btn-sm w-100 mt-3"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                You haven't added any products yet. Click "Add New Product" to
                get started!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

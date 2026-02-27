import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
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
    rating: 4.5,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.userType !== "seller") {
      toast.error("Please login as a seller to access this page", {
        icon: "🚫",
        duration: 3000,
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }
    setCurrentUser(user);
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/products");
      const user = JSON.parse(localStorage.getItem("currentUser"));
      const sellerProducts = response.data.filter(
        (p) => p.farmer === user.fullName
      );
      setProducts(sellerProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(
        "Failed to load products. Please check if JSON Server is running on http://localhost:3000",
        {
          icon: "⚠️",
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully!", {
      icon: "👋",
      duration: 2000,
    });
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name.trim()) {
      toast.error("Please enter product name", { icon: "❌" });
      return;
    }
    if (!newProduct.price.trim()) {
      toast.error("Please enter product price", { icon: "❌" });
      return;
    }

    try {
      const productData = {
        name: newProduct.name.trim(),
        price: newProduct.price.trim(),
        image: newProduct.image,
        farmer: currentUser.fullName,
        rating: newProduct.rating,
        location: currentUser.address.split(",").pop().trim() || "Unknown",
      };

      await axios.post("http://localhost:3000/products", productData, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(`Product "${newProduct.name}" added successfully!`, {
        icon: "✅",
        duration: 3000,
      });

      setShowAddProduct(false);
      setNewProduct({ name: "", price: "", image: "🌾", rating: 4.5 });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product", { icon: "❌" });
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    toast(
      (t) => (
        <div>
          <p className="mb-3">
            <strong>Delete Product?</strong>
            <br />
            Are you sure you want to delete "{productName}"?
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                confirmDelete(productId, productName);
                toast.dismiss(t.id);
              }}
            >
              Delete
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { icon: "🗑️", duration: 5000, style: { minWidth: "300px" } }
    );
  };

  const confirmDelete = async (productId, productName) => {
    try {
      await axios.delete(`http://localhost:3000/products/${productId}`);
      toast.success(`Product "${productName}" deleted successfully!`, {
        icon: "✅",
        duration: 3000,
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product", { icon: "❌" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-warning"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-3 fs-5">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Toaster position="top-right" reverseOrder={false} gutter={8} />

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
            <ul className="navbar-nav align-items-center gap-2">
              <li className="nav-item">
                <span className="text-dark">
                  Welcome, <strong>{currentUser?.fullName}</strong>
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-primary btn-sm text-white"
                  onClick={() => navigate("/climate")}
                >
                  🌦️ Climate
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate("/soil-analysis")}
                >
                  🌱 Soil
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => navigate("/market-price-forecast")}
                >
                  💹 Market Price
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/smart-crop-plan")}
                >
                  🌾 Smart Plan
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-info btn-sm text-white"
                  onClick={() => navigate("/chat")}
                >
                  💬 Chat
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-info btn-sm text-white"
                  onClick={() => navigate("/calendar")}
                >
                  📅 Calendar
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-dark btn-sm fw-bold"
                  onClick={() => navigate("/equipment-renting")}
                >
                  🚜 Equipment
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-gradient-warning">
              <div className="card-body p-4">
                <h2 className="mb-2">👨🌾 Welcome, {currentUser?.fullName}!</h2>
                <p className="mb-0">
                  Manage your products and reach more customers
                </p>
              </div>
            </div>
          </div>
        </div>

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

        {showAddProduct && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="mb-3 fw-bold">📦 Add New Product</h4>
                  <form onSubmit={handleAddProduct}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="e.g., Organic Tomatoes"
                          value={newProduct.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Price *</label>
                        <input
                          type="text"
                          name="price"
                          className="form-control"
                          placeholder="e.g., ₹40/kg"
                          value={newProduct.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          Product Emoji/Icon
                        </label>
                        <select
                          name="image"
                          className="form-control form-select"
                          value={newProduct.image}
                          onChange={handleInputChange}
                        >
                          <option value="🍅">🍅 Tomato</option>
                          <option value="🥔">🥔 Potato</option>
                          <option value="🥕">🥕 Carrot</option>
                          <option value="🥬">🥬 Leafy Green</option>
                          <option value="🥦">🥦 Broccoli/Cauliflower</option>
                          <option value="🫘">🫘 Beans</option>
                          <option value="🌾">🌾 Grain/Wheat</option>
                          <option value="🍎">🍎 Apple</option>
                          <option value="🍌">🍌 Banana</option>
                          <option value="🥭">🥭 Mango</option>
                          <option value="🍇">🍇 Grapes</option>
                          <option value="🥒">🥒 Cucumber</option>
                          <option value="🌶️">🌶️ Chili</option>
                          <option value="🧅">🧅 Onion</option>
                          <option value="🧄">🧄 Garlic</option>
                        </select>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          Initial Rating
                        </label>
                        <select
                          name="rating"
                          className="form-control form-select"
                          value={newProduct.rating}
                          onChange={handleInputChange}
                        >
                          <option value="5.0">⭐⭐⭐⭐⭐ (5.0)</option>
                          <option value="4.5">⭐⭐⭐⭐ (4.5)</option>
                          <option value="4.0">⭐⭐⭐⭐ (4.0)</option>
                          <option value="3.5">⭐⭐⭐ (3.5)</option>
                          <option value="3.0">⭐⭐⭐ (3.0)</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <div className="alert alert-info">
                          <strong>ℹ️ Note:</strong> Product will be listed with
                          your name ({currentUser?.fullName}) and location (
                          {currentUser?.address.split(",").pop().trim()})
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-success btn-lg fw-bold w-100"
                        >
                          ✅ Add Product to Database
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-12">
            <h4 className="mb-3 fw-bold">📦 My Products</h4>
          </div>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="col-md-4 col-lg-3 mb-4">
                <div className="card product-card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="product-image">{product.image}</div>
                    <h5 className="product-name">{product.name}</h5>
                    <p className="product-price fw-bold">{product.price}</p>
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
                      className="btn btn-danger btn-sm w-100 mt-3 fw-bold"
                      onClick={() =>
                        handleDeleteProduct(product.id, product.name)
                      }
                    >
                      🗑️ Delete Product
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <h5>📭 No Products Yet</h5>
                <p>
                  You haven't added any products yet. Click "Add New Product" to
                  get started!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

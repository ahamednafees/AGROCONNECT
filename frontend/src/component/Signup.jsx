import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user type from navigation state or default to 'buyer'
  const initialUserType = location.state?.userType || "buyer";

  const [activeTab, setActiveTab] = useState(initialUserType);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Update active tab if user type is passed from UserType page
  useEffect(() => {
    if (location.state?.userType) {
      setActiveTab(location.state.userType);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleTabChange = (tabType) => {
    setActiveTab(tabType);
    // Clear any tab-related errors
    if (errors.userType) {
      setErrors({ ...errors, userType: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to terms and conditions";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      try {
        // Check if email already exists
        const existingUsersResponse = await axios.get(
          "http://localhost:3000/users"
        );
        const existingUsers = existingUsersResponse.data;

        const emailExists = existingUsers.find(
          (user) => user.email === formData.email
        );

        if (emailExists) {
          setErrors({
            email:
              "This email is already registered. Please use a different email or login.",
          });
          setLoading(false);
          return;
        }

        // Prepare data to send to backend with the selected user type
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
          userType: activeTab, // This will be either 'buyer' or 'seller'
          createdAt: new Date().toISOString(),
        };

        console.log("Registering user with data:", userData);

        // POST request to backend
        const response = await axios.post(
          "http://localhost:3000/users",
          userData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Signup successful:", response.data);

        // Show success message with user type
        alert(
          `🎉 Registration successful as ${activeTab.toUpperCase()}!\n\nYou can now login with your credentials.`
        );

        // Clear form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
        });

        // Redirect to login after 1 second with user data
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: `✅ Registration successful as ${activeTab.toUpperCase()}! Please login with your credentials.`,
              email: response.data.email,
              userType: response.data.userType,
            },
          });
        }, 1000);
      } catch (error) {
        console.error("Signup error:", error);

        if (error.response) {
          // Server responded with error
          setErrors({
            general:
              error.response.data.message ||
              "Registration failed. Please try again.",
          });
          alert(
            `❌ Error: ${error.response.data.message || "Registration failed"}`
          );
        } else if (error.request) {
          // Request made but no response
          setErrors({
            general:
              "Unable to connect to server. Please check if JSON Server is running on http://localhost:3001",
          });
          alert(
            "❌ Error: Unable to connect to server. Please check if JSON Server is running on http://localhost:3001"
          );
        } else {
          // Other errors
          setErrors({
            general: "Something went wrong. Please try again.",
          });
          alert("❌ Error: Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
      // Show first error
      const firstError = Object.values(validationErrors)[0];
      alert(`⚠️ ${firstError}`);
    }
  };

  return (
    <div className="signup-page">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-5">
          <a className="navbar-brand fw-bold fs-5" href="/">
            🌾 AgroConnect
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
                <div
                  className="nav-link"
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                >
                  HOME
                </div>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-warning fw-bold px-4"
                  onClick={() => navigate("/login")}
                >
                  LOGIN
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container fluid className="main-section">
        <Row className="g-0 min-vh-100">
          {/* Left Side - Welcome Section */}
          <Col
            lg={6}
            className="welcome-section d-flex align-items-center justify-content-center"
          >
            <div className="welcome-content text-white p-5">
              <p className="welcome-label mb-2">JOIN US TODAY</p>
              <h1 className="brand-title mb-2">AgroConnect</h1>
              <div className="brand-decoration mb-3">
                <span className="leaf-icon">🌾</span>
              </div>
              <p className="brand-tagline mb-4">
                Connecting Farmers and Customers
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Direct Farm-to-Consumer Connection</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Fresh Organic Products</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Fair Prices for Farmers</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Quality Assurance</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Signup Form */}
          <Col
            lg={6}
            className="signup-section d-flex align-items-center justify-content-center p-4"
          >
            <div className="signup-box">
              {/* User Avatar */}
              <div className="user-avatar">
                <div className="avatar-circle">
                  {activeTab === "seller" ? (
                    <span style={{ fontSize: "50px" }}>👨‍🌾</span>
                  ) : (
                    <span style={{ fontSize: "50px" }}>🛒</span>
                  )}
                </div>
              </div>

              {/* User Type Tabs */}
              <div className="user-tabs">
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "buyer" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("buyer")}
                  disabled={loading}
                >
                  🛒 BUYER
                </button>
                <button
                  type="button"
                  className={`tab-button ${
                    activeTab === "seller" ? "active" : ""
                  }`}
                  onClick={() => handleTabChange("seller")}
                  disabled={loading}
                >
                  👨‍🌾 SELLER
                </button>
              </div>

              {/* Show selected user type */}
              <div className="text-center mb-3">
                <small className="text-muted">
                  Signing up as:{" "}
                  <strong className="text-success">
                    {activeTab.toUpperCase()}
                  </strong>
                </small>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="signup-form">
                <h5 className="form-title text-center mb-4 fw-bold">
                  CREATE ACCOUNT
                </h5>

                {/* General Error Message */}
                {errors.general && (
                  <div className="alert alert-danger py-2" role="alert">
                    {errors.general}
                  </div>
                )}

                <div className="form-group mb-3">
                  <input
                    type="text"
                    name="fullName"
                    className={`form-control form-input ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control form-input ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    placeholder="Phone Number (10 digits)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    maxLength="10"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>

                <div className="form-group mb-3">
                  <textarea
                    name="address"
                    className={`form-control form-input ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    placeholder="Address"
                    rows="2"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                <div className="form-group mb-3 position-relative">
                  <input
                    type="password"
                    name="password"
                    className={`form-control form-input ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="form-group mb-3 position-relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control form-input ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className={`form-check-input ${
                      errors.agreeTerms ? "is-invalid" : ""
                    }`}
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label text-muted small"
                    htmlFor="agreeTerms"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-decoration-none">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-decoration-none">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.agreeTerms && (
                    <div className="invalid-feedback d-block">
                      {errors.agreeTerms}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-signup w-100 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating Account...
                    </>
                  ) : (
                    `SIGN UP AS ${activeTab.toUpperCase()}`
                  )}
                </button>

                <div className="text-center mt-3">
                  <span className="text-muted">Already have an account? </span>
                  <button
                    type="button"
                    className="btn-link text-decoration-none fw-bold border-0 bg-transparent p-0"
                    onClick={() => navigate("/login")}
                    style={{ color: "#4caf50", cursor: "pointer" }}
                    disabled={loading}
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;

import React, { useState, useEffect } from "react";
import {
  generatePriceForecast,
  generatePriceTrend,
  checkForecastExists,
  getCurrentPrice,
  formatPrice,
  getPriceColor,
  getPriceIcon,
  seedMarketPrices
} from "../services/marketPriceForecastService";
import "./MarketPriceForecastDashboard.css";

const MarketPriceForecastDashboard = () => {
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [marketPrices, setMarketPrices] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecasts, setForecasts] = useState([]);

  const crops = ["Rice", "Wheat", "Maize", "Cotton", "Tomato"];

  const mockClimateData = {
    temperature: 28.5,
    rainfall: 45.2,
    humidity: 65.3,
    riskLevel: "MODERATE"
  };

  const mockSoilData = {
    N: 85, P: 45, K: 35,
    pH: 6.5, moisture: 55,
    quality: "Good", healthScore: 82
  };

  const mockDiseaseRisk = "LOW";
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "Tiruppur";

  useEffect(() => {
    const storedPrices = JSON.parse(localStorage.getItem("marketPrices") || "[]");
    const seededPrices = seedMarketPrices(storedPrices, location);
    setMarketPrices(seededPrices);
    localStorage.setItem("marketPrices", JSON.stringify(seededPrices));

    localStorage.removeItem("priceForecasts");
    setForecasts([]);
    setLoading(false);
  }, [location]);

  const handleGenerateForecast = () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      if (checkForecastExists(forecasts, selectedCrop, location, today)) {
        setError("Forecast already generated for this crop today.");
        setLoading(false);
        return;
      }

      const currentPrice = getCurrentPrice(marketPrices, selectedCrop, location);
      const newForecast = generatePriceForecast(
        currentPrice,
        mockClimateData,
        mockSoilData,
        mockDiseaseRisk,
        selectedCrop
      );

      const priceTrend = generatePriceTrend(currentPrice);

      const forecastRecord = {
        id: `forecast_${Date.now()}`,
        crop_type: selectedCrop,
        location: location,
        current_price: currentPrice,
        forecast_price: newForecast.forecastPrice,
        price_change_percent: newForecast.priceChangePercent,
        climate_risk_level: mockClimateData.riskLevel,
        soil_quality: mockSoilData.quality,
        disease_risk: mockDiseaseRisk,
        rainfall: mockClimateData.rainfall,
        adjustments: newForecast.adjustments,
        generated_date: today,
        forecast_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        created_at: new Date().toISOString()
      };

      setForecast(newForecast);
      setTrend(priceTrend);

      const updatedForecasts = [forecastRecord, ...forecasts];
      setForecasts(updatedForecasts);
      localStorage.setItem("priceForecasts", JSON.stringify(updatedForecasts));

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!user || !user.id) {
    return <div className="container mt-5"><h3>Please login first</h3></div>;
  }

  const currentPrice = getCurrentPrice(marketPrices, selectedCrop, location);

  return (
    <div className="market-price-dashboard">
      <div className="container-fluid mt-4">
        {/* Header */}
        <div className="dashboard-header mb-5">
          <h1 className="header-title">💹 Market Price Forecasting</h1>
          <p className="header-subtitle">AI-Powered Price Predictions for Your Crops</p>
        </div>

        {/* Input Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto">
            <div className="input-card">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Select Crop</label>
                  <select
                    className="form-control form-control-lg"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    {crops.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button
                    className="btn btn-forecast w-100"
                    onClick={handleGenerateForecast}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Generating...</>
                    ) : (
                      <>✨ Generate Forecast</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="row mb-4">
            <div className="col-lg-8 mx-auto">
              <div className="alert alert-warning alert-dismissible fade show">
                <strong>⚠️ Notice:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!forecast ? (
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto">
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>Generate a forecast to see predictions</h3>
                <p>Select a crop and click the button above to get started</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Price Cards */}
            <div className="row mb-5">
              <div className="col-lg-6">
                <div className="price-card current-price">
                  <div className="price-card-header">Current Market Price</div>
                  <div className="price-value">{formatPrice(currentPrice)}</div>
                  <div className="price-unit">per quintal</div>
                  <div className="crop-badge">{selectedCrop}</div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="price-card forecast-price">
                  <div className="price-card-header">Forecasted Price (9 days)</div>
                  <div className="price-value">{formatPrice(forecast.forecastPrice)}</div>
                  <div className="price-change" style={{ color: getPriceColor(forecast.priceChangePercent) }}>
                    {getPriceIcon(forecast.priceChangePercent)}
                    {forecast.priceChangePercent > 0 ? "+" : ""}{forecast.priceChangePercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustments Grid */}
            <div className="row mb-5">
              <div className="col-lg-12">
                <h3 className="section-title">📊 Price Adjustment Factors</h3>
                <div className="adjustments-grid">
                  <div className="adjustment-card climate">
                    <div className="adjustment-icon">🌦️</div>
                    <div className="adjustment-label">Climate Risk</div>
                    <div className="adjustment-value" style={{ color: forecast.adjustments.climate.value > 0 ? "#dc3545" : "#28a745" }}>
                      {forecast.adjustments.climate.value > 0 ? "+" : ""}{forecast.adjustments.climate.value}%
                    </div>
                    <div className="adjustment-desc">{forecast.adjustments.climate.label}</div>
                  </div>
                  <div className="adjustment-card rainfall">
                    <div className="adjustment-icon">🌧️</div>
                    <div className="adjustment-label">Rainfall Impact</div>
                    <div className="adjustment-value" style={{ color: forecast.adjustments.rainfall.value > 0 ? "#dc3545" : "#28a745" }}>
                      {forecast.adjustments.rainfall.value > 0 ? "+" : ""}{forecast.adjustments.rainfall.value}%
                    </div>
                    <div className="adjustment-desc">{forecast.adjustments.rainfall.label}</div>
                  </div>
                  <div className="adjustment-card soil">
                    <div className="adjustment-icon">🌱</div>
                    <div className="adjustment-label">Soil Quality</div>
                    <div className="adjustment-value" style={{ color: forecast.adjustments.soil.value > 0 ? "#dc3545" : "#28a745" }}>
                      {forecast.adjustments.soil.value > 0 ? "+" : ""}{forecast.adjustments.soil.value}%
                    </div>
                    <div className="adjustment-desc">{forecast.adjustments.soil.label}</div>
                  </div>
                  <div className="adjustment-card disease">
                    <div className="adjustment-icon">🦠</div>
                    <div className="adjustment-label">Disease Risk</div>
                    <div className="adjustment-value" style={{ color: forecast.adjustments.disease.value > 0 ? "#dc3545" : "#28a745" }}>
                      {forecast.adjustments.disease.value > 0 ? "+" : ""}{forecast.adjustments.disease.value}%
                    </div>
                    <div className="adjustment-desc">{forecast.adjustments.disease.label}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="row mb-5">
              <div className="col-lg-12">
                <h3 className="section-title">📈 Price Trend (Last 5 Days)</h3>
                <div className="trend-chart-container">
                  {trend.map((item, idx) => {
                    const maxPrice = Math.max(...trend.map(t => t.price));
                    const heightPercent = (item.price / maxPrice) * 100;
                    return (
                      <div key={idx} className="trend-bar-wrapper">
                        <div className="trend-bar-container">
                          <div
                            className="trend-bar"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: item.price >= currentPrice ? "#28a745" : "#dc3545"
                            }}
                          ></div>
                        </div>
                        <div className="trend-price">{formatPrice(item.price)}</div>
                        <div className="trend-date">{item.dayLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="row mb-5">
              <div className="col-lg-12">
                <h3 className="section-title">💡 Market Insights & Recommendations</h3>
                <div className="insights-container">
                  {forecast.priceChangePercent > 5 && (
                    <div className="insight-card positive">
                      <div className="insight-icon">📈</div>
                      <div className="insight-text">Strong price increase expected - Excellent time to sell</div>
                    </div>
                  )}
                  {forecast.priceChangePercent > 0 && forecast.priceChangePercent <= 5 && (
                    <div className="insight-card positive">
                      <div className="insight-icon">📈</div>
                      <div className="insight-text">Slight price increase expected - Favorable market conditions</div>
                    </div>
                  )}
                  {forecast.priceChangePercent < -5 && (
                    <div className="insight-card negative">
                      <div className="insight-icon">📉</div>
                      <div className="insight-text">Strong price decrease expected - Consider storage options</div>
                    </div>
                  )}
                  {forecast.priceChangePercent < 0 && forecast.priceChangePercent >= -5 && (
                    <div className="insight-card negative">
                      <div className="insight-icon">📉</div>
                      <div className="insight-text">Slight price decrease expected - Monitor market closely</div>
                    </div>
                  )}
                  {forecast.priceChangePercent === 0 && (
                    <div className="insight-card neutral">
                      <div className="insight-icon">➡️</div>
                      <div className="insight-text">Price expected to remain stable - Hold or sell as needed</div>
                    </div>
                  )}
                  {forecast.factors.climateRiskLevel === "HIGH" && (
                    <div className="insight-card warning">
                      <div className="insight-icon">⚠️</div>
                      <div className="insight-text">High climate risk may impact supply and prices</div>
                    </div>
                  )}
                  {forecast.factors.diseaseRiskLevel === "HIGH" && (
                    <div className="insight-card warning">
                      <div className="insight-icon">🦠</div>
                      <div className="insight-text">High disease risk may reduce supply and increase prices</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Forecast History */}
        {forecasts.length > 0 && (
          <div className="row mb-5">
            <div className="col-lg-12">
              <h3 className="section-title">📋 Forecast History</h3>
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Current Price</th>
                      <th>Forecast Price</th>
                      <th>Change</th>
                      <th>Climate Risk</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.slice(0, 5).map((f) => (
                      <tr key={f.id}>
                        <td><strong>{f.crop_type}</strong></td>
                        <td>{formatPrice(f.current_price)}</td>
                        <td>{formatPrice(f.forecast_price)}</td>
                        <td>
                          <span style={{ color: getPriceColor(f.price_change_percent), fontWeight: "bold" }}>
                            {f.price_change_percent > 0 ? "+" : ""}{f.price_change_percent}%
                          </span>
                        </td>
                        <td>
                          <span className={`risk-badge ${f.climate_risk_level.toLowerCase()}`}>
                            {f.climate_risk_level}
                          </span>
                        </td>
                        <td>{new Date(f.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPriceForecastDashboard;

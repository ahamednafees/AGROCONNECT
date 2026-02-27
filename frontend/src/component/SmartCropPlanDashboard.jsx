import React, { useState, useEffect } from "react";
import { generateSmartFarmingPlan, checkPlanExists } from "../services/smartFarmingPlanService";
import "./SmartCropPlanDashboard.css";

const SmartCropPlanDashboard = () => {
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [landSize, setLandSize] = useState(2.5);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);

  const crops = ["Rice", "Wheat", "Maize", "Cotton", "Tomato"];

  // Mock data from existing modules
  const mockClimateData = {
    temperature: 28.5,
    rainfall: 45.2,
    humidity: 65.3,
  };

  const mockSoilData = {
    N: 85,
    P: 45,
    K: 35,
    pH: 6.5,
    moisture: 55,
    organicCarbon: 1.8,
  };

  const mockDiseaseRisks = [
    { name: "Fungal Disease", riskLevel: "LOW", preventiveMeasures: "Maintain field hygiene" },
    { name: "Bacterial Blight", riskLevel: "LOW", preventiveMeasures: "Use resistant varieties" },
  ];

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "Tiruppur";

  useEffect(() => {
    const storedPlans = JSON.parse(localStorage.getItem("farmingPlans") || "[]");
    setPlans(storedPlans);
  }, []);

  const handleGeneratePlan = () => {
    setLoading(true);
    setError(null);

    try {
      const newPlan = generateSmartFarmingPlan(
        selectedCrop,
        mockClimateData,
        mockSoilData,
        mockDiseaseRisks,
        landSize
      );

      newPlan.id = `plan_${Date.now()}`;
      newPlan.user_id = user.id;
      newPlan.location = location;
      newPlan.land_size = landSize;

      setPlan(newPlan);

      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      localStorage.setItem("farmingPlans", JSON.stringify(updatedPlans));

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case "HIGH":
        return "badge-danger";
      case "MODERATE":
        return "badge-warning";
      default:
        return "badge-success";
    }
  };

  const getSuitabilityColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  };

  if (!user || !user.id) {
    return (
      <div className="container mt-5">
        <h3>Please login first</h3>
      </div>
    );
  }

  return (
    <div className="smart-crop-plan-dashboard">
      <div className="container mt-4">
        <h2>🌾 Smart Crop Plan Generator</h2>

        {/* Input Section */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label>Select Crop</label>
                <select
                  className="form-control"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label>Land Size (acres)</label>
                <input
                  type="number"
                  className="form-control"
                  value={landSize}
                  onChange={(e) => setLandSize(parseFloat(e.target.value))}
                  min="0.5"
                  step="0.5"
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleGeneratePlan}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="alert alert-warning">{error}</div>}

        {/* Plan Display */}
        {plan && (
          <div className="plan-container">
            {/* Header */}
            <div className="card mb-4 plan-header">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h3>{plan.crop_type} Farming Plan</h3>
                    <p className="text-muted">
                      Location: {plan.location} | Land: {plan.land_size} acres
                    </p>
                  </div>
                  <div className="col-md-6 text-right">
                    <span className={`badge ${getRiskBadgeClass(plan.risk_level)} badge-lg`}>
                      {plan.risk_level} RISK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suitability Score */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card suitability-card">
                  <div className="card-body text-center">
                    <h6>Overall Suitability</h6>
                    <div
                      className="suitability-score"
                      style={{ color: getSuitabilityColor(plan.suitability_score) }}
                    >
                      {plan.suitability_score}/100
                    </div>
                    <div className="progress mt-2">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${plan.suitability_score}%`,
                          backgroundColor: getSuitabilityColor(plan.suitability_score),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card suitability-card">
                  <div className="card-body text-center">
                    <h6>Climate Suitability</h6>
                    <p className="suitability-score">{plan.climate_suitability.score}/100</p>
                    <small className="text-muted">{plan.climate_suitability.status}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card suitability-card">
                  <div className="card-body text-center">
                    <h6>Soil Suitability</h6>
                    <p className="suitability-score">{plan.soil_suitability.score}/100</p>
                    <small className="text-muted">{plan.soil_suitability.status}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Warnings */}
            {plan.risk_warnings.length > 0 && (
              <div className="alert alert-warning mb-4">
                <strong>⚠️ Risk Warnings:</strong>
                <ul className="mb-0 mt-2">
                  {plan.risk_warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Irrigation Plan */}
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">💧 Irrigation Plan</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <strong>Frequency:</strong>
                    <p>{plan.irrigation_plan.frequency}</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Water Amount:</strong>
                    <p>{plan.irrigation_plan.water_amount} L/acre</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Method:</strong>
                    <p>{plan.irrigation_plan.method}</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Best Time:</strong>
                    <p>{plan.irrigation_plan.best_time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fertilizer Plan */}
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">🌱 Fertilizer Plan</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <strong>Nitrogen (N):</strong>
                    <p>{plan.fertilizer_plan.N} kg</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Phosphorus (P):</strong>
                    <p>{plan.fertilizer_plan.P} kg</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Potassium (K):</strong>
                    <p>{plan.fertilizer_plan.K} kg</p>
                  </div>
                  <div className="col-md-3">
                    <strong>Schedule:</strong>
                    <p className="small">{plan.fertilizer_plan.applicationSchedule}</p>
                  </div>
                </div>
                <div className="alert alert-info mt-3 mb-0">
                  <strong>Notes:</strong> {plan.fertilizer_plan.notes}
                </div>
              </div>
            </div>

            {/* Disease Prevention */}
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">🛡️ Disease Prevention Plan</h5>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  {plan.disease_prevention_plan.map((measure, idx) => (
                    <li key={idx} className="mb-2">
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Yield Estimation */}
            <div className="card mb-4">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">📊 Yield Estimation</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Expected Yield:</strong>
                    <p className="h5">{plan.yield_estimation.expected} {plan.yield_estimation.unit}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Yield Potential:</strong>
                    <p className="h5">{plan.yield_estimation.potential} {plan.yield_estimation.unit}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Confidence:</strong>
                    <p className="h5">{Math.round(plan.yield_estimation.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Tips */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">💡 Smart Advisory Tips</h5>
              </div>
              <div className="card-body">
                <ul className="mb-0">
                  {plan.smart_tips.map((tip, idx) => (
                    <li key={idx} className="mb-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Plan History */}
        {plans.length > 0 && (
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">📋 Plan History</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Suitability</th>
                      <th>Risk Level</th>
                      <th>Expected Yield</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>{p.crop_type}</td>
                        <td>
                          <span style={{ color: getSuitabilityColor(p.suitability_score) }}>
                            {p.suitability_score}/100
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getRiskBadgeClass(p.risk_level)}`}>
                            {p.risk_level}
                          </span>
                        </td>
                        <td>{p.yield_estimation.expected} {p.yield_estimation.unit}</td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
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

export default SmartCropPlanDashboard;

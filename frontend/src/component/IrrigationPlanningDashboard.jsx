import React, { useState, useEffect } from "react";
import { addIrrigationPlan, getLatestIrrigationPlan, checkPlanExistsForToday, calculateWeeklyWaterUsage, createIrrigationAlert } from "../services/irrigationPlanningService";
import { getLatestSoilAnalysis } from "../services/soilAnalysisService";
import { getDiseasePredictions } from "../services/diseaseDetectionService";
import { getLatestAnalysis } from "../services/climateMonitoringService";
import toast from "react-hot-toast";
import "./IrrigationPlanningDashboard.css";

const IrrigationPlanningDashboard = () => {
  const [cropType, setCropType] = useState("Rice");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "";

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const existingPlan = await getLatestIrrigationPlan(user.id);
      if (existingPlan) {
        setPlan(existingPlan);
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);

    try {
      // Check if plan exists for today
      const exists = await checkPlanExistsForToday(user.id);
      if (exists) {
        toast.info("Plan already generated for today");
        setLoading(false);
        return;
      }

      // Get climate data
      const climate = await getLatestAnalysis(location);
      if (!climate) {
        toast.error("Climate data not available");
        setLoading(false);
        return;
      }

      // Get soil data
      const soil = await getLatestSoilAnalysis(location);
      if (!soil) {
        toast.error("Soil data not available");
        setLoading(false);
        return;
      }

      // Get disease predictions
      const diseases = await getDiseasePredictions(location);

      // Generate plan
      const newPlan = await addIrrigationPlan(user.id, cropType, location, climate, soil, diseases);
      setPlan(newPlan);

      // Create alert
      const reason = climate.temperature > 30 ? "High temperature detected" : "Regular irrigation schedule";
      await createIrrigationAlert(user.id, newPlan, reason);

      toast.success("Irrigation plan generated!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "Drip":
        return "💧";
      case "Sprinkler":
        return "🚿";
      case "Flood":
        return "🌊";
      default:
        return "💧";
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case "Daily":
        return "#dc3545";
      case "Every2Days":
        return "#ffc107";
      case "Weekly":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  if (!user || !user.id) {
    return <div className="container mt-5"><h3>Please login first</h3></div>;
  }

  const weeklyWater = plan ? calculateWeeklyWaterUsage(plan) : 0;

  return (
    <div className="irrigation-dashboard">
      <div className="container mt-4">
        <h2>💧 Smart Irrigation Planning</h2>

        {/* Crop Selection & Generate */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-6">
                <label className="form-label fw-bold">Select Crop Type</label>
                <select
                  className="form-control"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                >
                  <option value="Rice">🍚 Rice</option>
                  <option value="Wheat">🌾 Wheat</option>
                  <option value="Maize">🌽 Maize</option>
                  <option value="Tomato">🍅 Tomato</option>
                  <option value="Potato">🥔 Potato</option>
                  <option value="Cotton">🌾 Cotton</option>
                </select>
              </div>
              <div className="col-md-6">
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

        {/* Today's Recommendation */}
        {plan && (
          <>
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Frequency</h6>
                    <p className="mb-0" style={{ color: getFrequencyColor(plan.recommendedFrequency), fontWeight: "bold" }}>
                      {plan.recommendedFrequency}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Water Amount</h6>
                    <p className="mb-0">{plan.waterAmount}L/acre</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Method</h6>
                    <p className="mb-0">{getMethodIcon(plan.irrigationMethod)} {plan.irrigationMethod}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Best Time</h6>
                    <p className="mb-0">{plan.bestTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Schedule */}
            <div className="card mb-4">
              <div className="card-body">
                <h5>📅 7-Day Irrigation Schedule</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Frequency</th>
                        <th>Water (L/acre)</th>
                        <th>Method</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.next7DaySchedule.map((day, idx) => (
                        <tr key={idx}>
                          <td>{day.date}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: getFrequencyColor(day.frequency) }}>
                              {day.frequency}
                            </span>
                          </td>
                          <td>{day.waterAmount}</td>
                          <td>{getMethodIcon(day.method)} {day.method}</td>
                          <td>{day.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Water Usage Summary */}
            <div className="card mb-4">
              <div className="card-body">
                <h5>💧 Weekly Water Usage</h5>
                <div className="alert alert-info">
                  <strong>Total: {weeklyWater}L/acre</strong> for the next 7 days
                  <br />
                  <small>Average: {Math.round(weeklyWater / 7)}L/acre per day</small>
                </div>
              </div>
            </div>

            {/* Smart Tips */}
            <div className="card">
              <div className="card-body">
                <h5>💡 Smart Tips</h5>
                <ul className="list-unstyled">
                  <li>✓ Water early morning or late evening to reduce evaporation</li>
                  <li>✓ Check soil moisture before irrigation</li>
                  <li>✓ Adjust plan if rainfall occurs</li>
                  <li>✓ Monitor weather forecasts for changes</li>
                  <li>✓ Use mulch to retain soil moisture</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {!plan && (
          <div className="alert alert-info text-center">
            <p>Generate an irrigation plan to see recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IrrigationPlanningDashboard;

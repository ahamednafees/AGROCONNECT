import React, { useState, useEffect } from "react";
import "./ClimateDashboard.css";

const ClimateMonitoringDashboard = () => {
  const [records, setRecords] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const dummyRecords = [
    {
      id: "dummy1",
      date: "2026-02-27",
      temperature: 25.5,
      rainfall: 12.3,
      humidity: 60,
      soilMoisture: 45,
      isGenerated: true,
    },
    {
      id: "dummy2",
      date: "2026-02-26",
      temperature: 26.1,
      rainfall: 10.2,
      humidity: 58,
      soilMoisture: 50,
      isGenerated: false,
    },
  ];

  const dummyAnalysis = {
    riskLevel: "MODERATE",
    healthScore: 75,
    tempChange: 1.2,
    rainfallChange: -2.5,
    message: "Temperature rising slightly, monitor closely.",
  };

  const embeddedData = {
    users: [
      {
        id: "fe5f",
        fullName: "gokul",
        email: "24csa31@karpagamtech.ac.in",
        phone: "8667581651",
        address: "123 Addresss",
        password: "123456",
        userType: "buyer",
        createdAt: "2025-10-14T09:44:15.283Z",
      },
    ],
    climateRecords: [
      {
        id: "hr01",
        location: "Tiruppur",
        date: "2026-02-27",
        temperature: 28.5,
        rainfall: 45.2,
        humidity: 65.3,
        soilMoisture: 55.1,
        isGenerated: true,
      },
      {
        id: "hr02",
        location: "Tiruppur",
        date: "2026-02-26",
        temperature: 27.1,
        rainfall: 40.0,
        humidity: 60.0,
        soilMoisture: 50.0,
        isGenerated: false,
      },
    ],
    climateAnalysis: {
      riskLevel: "LOW",
      tempChange: 0.7,
      rainfallChange: -0.9,
      humidityChange: -2.2,
      healthScore: 92,
      message: "Temp +0.7°C, Rainfall -0.9%, Humidity -2.2%. Climate conditions stable.",
    },
  };

  useEffect(() => {
    // Replace API calls with dummy data for testing
    setRecords(dummyRecords);
    setAnalysis(dummyAnalysis);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Use embedded data for testing
    if (embeddedData.climateRecords && embeddedData.climateAnalysis) {
      setRecords(embeddedData.climateRecords);
      setAnalysis(embeddedData.climateAnalysis);
    } else {
      // Fallback to dummy data if embedded data is not available
      setRecords(dummyRecords);
      setAnalysis(dummyAnalysis);
    }
    setLoading(false);
  }, []);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "";

  useEffect(() => {
    // Remove loadData call and use only embedded data for testing
    setRecords(embeddedData.climateRecords);
    setAnalysis(embeddedData.climateAnalysis);
    setLoading(false);
  }, []);

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

  const getHealthScoreColor = (score) => {
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

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <p>Loading climate data...</p>
      </div>
    );
  }

  return (
    <div className="climate-dashboard">
      <div className="container mt-4">
        <h2>🌦️ Automated Climate Monitoring</h2>

        {/* Risk Alert */}
        {analysis && analysis.riskLevel !== "LOW" && (
          <div
            className={`alert alert-${
              analysis.riskLevel === "HIGH" ? "danger" : "warning"
            } mb-4`}
          >
            <strong>⚠️ {analysis.riskLevel} RISK:</strong> {analysis.message}
          </div>
        )}

        {/* Stats Row */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Health Score</h6>
                <div
                  className="health-score"
                  style={{ color: getHealthScoreColor(analysis?.healthScore || 100) }}
                >
                  {analysis?.healthScore || 100}/100
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Risk Level</h6>
                <span
                  className={`badge ${getRiskBadgeClass(
                    analysis?.riskLevel || "LOW"
                  )}`}
                >
                  {analysis?.riskLevel || "LOW"}
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Temp Change</h6>
                <p className="mb-0">{analysis?.tempChange || 0}°C</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Rainfall Change</h6>
                <p className="mb-0">{analysis?.rainfallChange || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Trend */}
        <div className="card">
          <div className="card-body">
            <h5>📊 Climate Trend (Last 30 Days)</h5>
            {records.length > 0 ? (
              <div className="climate-chart">
                {records.slice(0, 10).map((record) => (
                  <div key={record.id} className="trend-item">
                    <span className="date-label">{record.date}</span>
                    <div className="metrics">
                      <span>🌡️ {record.temperature}°C</span>
                      <span>🌧️ {record.rainfall}mm</span>
                      <span>💧 {record.humidity}%</span>
                      {record.soilMoisture && (
                        <span>🌱 {record.soilMoisture}%</span>
                      )}
                    </div>
                    {record.isGenerated && (
                      <span className="badge badge-info">Auto</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No climate records available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateMonitoringDashboard;

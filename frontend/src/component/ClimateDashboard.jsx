import React, { useState, useEffect } from "react";
import { getClimateRecords, getLatestAnalysis } from "../services/climateMonitoringService";
import { getActiveAlerts, getUserNotifications, markNotificationRead } from "../services/climateService";
import "./ClimateDashboard.css";

const ClimateDashboard = () => {
  const [records, setRecords] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("monitoring");

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "";

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, analysisData, alertsData, notificationsData] = await Promise.all([
        getClimateRecords(location, 24),
        getLatestAnalysis(location),
        getActiveAlerts(location),
        getUserNotifications(user.id),
      ]);
      setRecords(recordsData);
      setAnalysis(analysisData);
      setAlerts(alertsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading climate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case "HIGH": return "badge-danger";
      case "MODERATE": return "badge-warning";
      default: return "badge-success";
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user || !user.id) {
    return <div className="container mt-5"><h3>Please login first</h3></div>;
  }

  if (loading) {
    return <div className="container mt-5 text-center"><p>Loading climate data...</p></div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="climate-dashboard">
      <div className="container mt-4">
        <h2>🌦️ AI-Powered Climate Monitoring</h2>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "monitoring" ? "active" : ""}`}
              onClick={() => setActiveTab("monitoring")}
            >
              📊 Monitoring
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "alerts" ? "active" : ""}`}
              onClick={() => setActiveTab("alerts")}
            >
              ⚠️ Alerts {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}
            </button>
          </li>
        </ul>

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <>
            {/* Risk Alert Banner */}
            {analysis && analysis.riskLevel !== "LOW" && (
              <div className={`alert alert-${analysis.riskLevel === "HIGH" ? "danger" : "warning"} mb-4`}>
                <strong>⚠️ {analysis.riskLevel} RISK:</strong> {analysis.message}
              </div>
            )}

            {/* AI Insight Card */}
            {analysis && (
              <div className="card mb-4 border-info">
                <div className="card-body">
                  <h6 className="card-title">🤖 AI Analysis</h6>
                  <p className="card-text">{analysis.aiInsight || "Analyzing climate patterns..."}</p>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Health Score</h6>
                    <div className="health-score" style={{ color: getHealthScoreColor(analysis?.healthScore || 100) }}>
                      {analysis?.healthScore || 100}/100
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card stat-card">
                  <div className="card-body text-center">
                    <h6>Risk Level</h6>
                    <span className={`badge ${getRiskBadgeClass(analysis?.riskLevel || "LOW")}`}>
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

            {/* Hourly Trend */}
            <div className="card">
              <div className="card-body">
                <h5>📊 Hourly Climate Trend (Last 24 Hours)</h5>
                {records.length > 0 ? (
                  <div className="climate-chart">
                    {records.slice(0, 24).map((record) => (
                      <div key={record.id} className="trend-item">
                        <span className="date-label">
                          {formatDate(record.timestamp)} {formatTime(record.timestamp)}
                        </span>
                        <div className="metrics">
                          <span>🌡️ {record.temperature}°C</span>
                          <span>🌧️ {record.rainfall}mm</span>
                          <span>💧 {record.humidity}%</span>
                          {record.soilMoisture && <span>🌱 {record.soilMoisture}%</span>}
                        </div>
                        {record.isGenerated && <span className="badge badge-info">Auto</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No climate records available.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <>
            {/* Active Alerts */}
            {alerts.length > 0 && (
              <div className="mb-4">
                <h5>🚨 Active Alerts</h5>
                {alerts.map((alert) => (
                  <div key={alert.id} className={`alert alert-${alert.riskLevel === "HIGH" ? "danger" : "warning"}`}>
                    <strong>{alert.riskLevel} RISK:</strong> {alert.message}
                  </div>
                ))}
              </div>
            )}

            {/* Notifications */}
            <div>
              <h5>📬 Notifications</h5>
              {notifications.length > 0 ? (
                <div className="list-group">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`list-group-item ${!notif.isRead ? "list-group-item-light" : ""}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {notif.title}
                            {!notif.isRead && <span className="badge bg-primary ms-2">New</span>}
                          </h6>
                          <p className="mb-1">{notif.message}</p>
                          <small className="text-muted">{new Date(notif.createdAt).toLocaleString()}</small>
                        </div>
                        <span className={`badge ${getRiskBadgeClass(notif.riskLevel)}`}>
                          {notif.riskLevel}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">No notifications yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClimateDashboard;

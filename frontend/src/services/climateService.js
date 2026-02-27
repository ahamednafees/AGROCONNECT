import axios from "axios";

const API_URL = "http://localhost:3000";

// Thresholds for risk detection
const THRESHOLDS = {
  TEMP_INCREASE: 3, // °C
  RAINFALL_DECREASE: 30, // %
  HUMIDITY_DECREASE: 15, // %
};

// Analyze climate data and determine risk level
export const analyzeClimateRisk = (currentData, previousData) => {
  if (!previousData) return { riskLevel: "LOW", metrics: {}, message: "Insufficient data for comparison" };

  const tempChange = currentData.temperature - previousData.temperature;
  const rainfallChange = ((currentData.rainfall - previousData.rainfall) / previousData.rainfall) * 100;
  const humidityChange = currentData.humidity - previousData.humidity;

  const metrics = { tempChange, rainfallChange: rainfallChange.toFixed(1), humidityChange };

  let riskLevel = "LOW";
  let issues = [];

  if (tempChange >= THRESHOLDS.TEMP_INCREASE) {
    issues.push(`Temperature increased by ${tempChange}°C`);
    riskLevel = "MODERATE";
  }
  if (rainfallChange <= -THRESHOLDS.RAINFALL_DECREASE) {
    issues.push(`rainfall decreased by ${Math.abs(rainfallChange).toFixed(0)}%`);
    riskLevel = riskLevel === "MODERATE" ? "HIGH" : "MODERATE";
  }
  if (humidityChange <= -THRESHOLDS.HUMIDITY_DECREASE) {
    issues.push(`humidity dropped by ${Math.abs(humidityChange)}%`);
    riskLevel = "HIGH";
  }

  const message = issues.length > 0 
    ? `${issues.join(" and ")}. Monitor crop health closely.`
    : "Climate conditions are stable.";

  return { riskLevel, metrics, message };
};

// Fetch climate data by location
export const getClimateData = async (location) => {
  const response = await axios.get(`${API_URL}/climateData?location=${location}&_sort=year,month&_order=desc,desc`);
  return response.data;
};

// Add new climate data
export const addClimateData = async (data) => {
  const response = await axios.post(`${API_URL}/climateData`, {
    ...data,
    id: Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

// Create climate alert
export const createClimateAlert = async (alertData) => {
  const response = await axios.post(`${API_URL}/climateAlerts`, {
    ...alertData,
    id: Math.random().toString(36).substr(2, 4),
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

// Get active alerts for location
export const getActiveAlerts = async (location) => {
  const response = await axios.get(`${API_URL}/climateAlerts?location=${location}&isActive=true`);
  return response.data;
};

// Create notification
export const createNotification = async (userId, alert) => {
  const response = await axios.post(`${API_URL}/notifications`, {
    id: Math.random().toString(36).substr(2, 4),
    userId,
    type: "CLIMATE_ALERT",
    title: `Climate Risk Alert - ${alert.riskLevel}`,
    message: alert.message,
    riskLevel: alert.riskLevel,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

// Get user notifications
export const getUserNotifications = async (userId) => {
  const response = await axios.get(`${API_URL}/notifications?userId=${userId}&_sort=createdAt&_order=desc`);
  return response.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  const response = await axios.patch(`${API_URL}/notifications/${notificationId}`, { isRead: true });
  return response.data;
};

import axios from "axios";

const API_URL = "http://localhost:3000";

// Initialize dummy climate data for all locations
export const initializeClimateData = async () => {
  try {
    // Check if records already exist
    const existing = await axios.get(`${API_URL}/climateRecords`);
    if (existing.data.length > 0) return; // Already initialized

    // Get all unique locations from users
    const users = await axios.get(`${API_URL}/users?userType=seller`);
    const locations = [...new Set(users.data.map((u) => u.address))];

    // Create dummy data for last month for each location
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    for (const location of locations) {
      const baseTemp = 25 + Math.random() * 10;
      const baseRainfall = 40 + Math.random() * 30;
      const baseHumidity = 60 + Math.random() * 20;
      const baseSoilMoisture = 50 + Math.random() * 20;

      const record = {
        id: Math.random().toString(36).substr(2, 4),
        location,
        date: lastMonth.toISOString().split("T")[0],
        temperature: Math.round(baseTemp * 10) / 10,
        rainfall: Math.round(baseRainfall * 10) / 10,
        humidity: Math.round(baseHumidity * 10) / 10,
        soilMoisture: Math.round(baseSoilMoisture * 10) / 10,
        month: lastMonth.getMonth() + 1,
        year: lastMonth.getFullYear(),
        isGenerated: false,
        createdAt: new Date().toISOString(),
      };

      await axios.post(`${API_URL}/climateRecords`, record);
    }

    console.log("Climate data initialized successfully");
  } catch (error) {
    console.error("Error initializing climate data:", error);
  }
};

import axios from "axios";

const API_URL = "http://localhost:3000";

// Irrigation rule engine
const calculateIrrigationPlan = (climate, soil, diseases, cropType) => {
  let frequency = "Every2Days";
  let waterAmount = 60;
  let method = "Sprinkler";
  let bestTime = "Evening";

  // Rule 1: Temperature & Rainfall & Soil Moisture
  if (climate.temperature > 32 && climate.rainfall < 20 && soil.moisture < 40) {
    frequency = "Daily";
    waterAmount = 90;
  } else if (climate.temperature > 28 && climate.rainfall < 30 && soil.moisture < 50) {
    frequency = "Daily";
    waterAmount = 75;
  } else if (climate.temperature >= 25 && climate.temperature <= 32 && climate.rainfall >= 20 && climate.rainfall <= 50 && soil.moisture >= 40 && soil.moisture <= 60) {
    frequency = "Every2Days";
    waterAmount = 60;
  } else if (climate.temperature < 25 && climate.rainfall > 50 && soil.moisture > 60) {
    frequency = "Weekly";
    waterAmount = 30;
  }

  // Rule 2: Disease Risk - Fungal diseases
  const hasFungalDisease = diseases.some(
    (d) => d.diseaseName.toLowerCase().includes("fungal") && d.riskLevel === "HIGH"
  );

  if (hasFungalDisease) {
    method = "Drip";
    bestTime = "Morning";
  }

  // Rule 3: Soil Type adjustment
  if (soil.soilType === "Clay") {
    waterAmount = Math.max(20, waterAmount - 20);
  } else if (soil.soilType === "Sandy") {
    waterAmount = Math.min(100, waterAmount + 20);
  }

  // Rule 4: Crop-specific adjustments
  const cropWaterNeeds = {
    Rice: 1.2,
    Wheat: 0.8,
    Maize: 1.0,
    Tomato: 1.1,
    Potato: 0.9,
    Cotton: 0.7,
  };

  const multiplier = cropWaterNeeds[cropType] || 1.0;
  waterAmount = Math.round(waterAmount * multiplier);

  return {
    frequency,
    waterAmount,
    method,
    bestTime,
  };
};

// Generate 7-day irrigation schedule
const generate7DaySchedule = (plan, startDate) => {
  const schedule = [];
  const frequencyDays = {
    Daily: 1,
    Every2Days: 2,
    Weekly: 7,
  };

  const interval = frequencyDays[plan.frequency];
  let currentDate = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split("T")[0];

    if (i % interval === 0) {
      schedule.push({
        date: dateStr,
        frequency: plan.frequency,
        waterAmount: plan.waterAmount,
        method: plan.method,
        time: plan.bestTime,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
};

// Add irrigation plan
export const addIrrigationPlan = async (userId, cropType, location, climate, soil, diseases) => {
  const plan = calculateIrrigationPlan(climate, soil, diseases, cropType);
  const today = new Date().toISOString().split("T")[0];
  const schedule = generate7DaySchedule(plan, today);

  const response = await axios.post(`${API_URL}/irrigationPlans`, {
    id: Math.random().toString(36).substr(2, 4),
    userId,
    cropType,
    location,
    recommendedFrequency: plan.frequency,
    waterAmount: plan.waterAmount,
    irrigationMethod: plan.method,
    bestTime: plan.bestTime,
    generatedDate: today,
    next7DaySchedule: schedule,
    createdAt: new Date().toISOString(),
  });

  return response.data;
};

// Get latest irrigation plan for user
export const getLatestIrrigationPlan = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/irrigationPlans?userId=${userId}&_sort=createdAt&_order=desc&_limit=1`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching irrigation plan:", error);
    return null;
  }
};

// Check if plan exists for today
export const checkPlanExistsForToday = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get(`${API_URL}/irrigationPlans?userId=${userId}&generatedDate=${today}`);
    return response.data.length > 0;
  } catch (error) {
    return false;
  }
};

// Get all irrigation plans for user
export const getUserIrrigationPlans = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/irrigationPlans?userId=${userId}&_sort=createdAt&_order=desc`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Calculate water usage for 7 days
export const calculateWeeklyWaterUsage = (plan) => {
  const schedule = plan.next7DaySchedule;
  return schedule.reduce((total, day) => total + day.waterAmount, 0);
};

// Generate irrigation alert
export const createIrrigationAlert = async (userId, plan, reason) => {
  const response = await axios.post(`${API_URL}/notifications`, {
    id: Math.random().toString(36).substr(2, 4),
    userId,
    type: "IRRIGATION_ALERT",
    title: `Irrigation Recommendation - ${plan.recommendedFrequency}`,
    message: `${reason}. Recommended: ${plan.irrigationMethod} irrigation, ${plan.waterAmount}L/acre, ${plan.bestTime}`,
    riskLevel: "MODERATE",
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

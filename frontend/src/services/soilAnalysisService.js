import axios from "axios";

const API_URL = "http://localhost:3000";

// Soil nutrient thresholds (mg/kg)
const NUTRIENT_THRESHOLDS = {
  nitrogen: { low: 20, medium: 40, high: 60 },
  phosphorus: { low: 10, medium: 20, high: 30 },
  potassium: { low: 100, medium: 200, high: 300 },
  pH: { optimal: [6, 7.5], acidic: 6, alkaline: 7.5 },
  moisture: { low: 20, medium: 50, high: 80 },
};

// Calculate individual nutrient scores
const getNutrientScore = (value, nutrient) => {
  const threshold = NUTRIENT_THRESHOLDS[nutrient];
  if (!threshold) return 50;

  if (nutrient === "pH") {
    const [optMin, optMax] = threshold.optimal;
    if (value >= optMin && value <= optMax) return 100;
    if (value < optMin) return Math.max(0, 100 - (optMin - value) * 10);
    return Math.max(0, 100 - (value - optMax) * 10);
  }

  if (value <= threshold.low) return 30;
  if (value <= threshold.medium) return 65;
  if (value <= threshold.high) return 85;
  return 100;
};

// Calculate soil health score
export const calculateSoilHealthScore = (soilData) => {
  const nScore = getNutrientScore(soilData.nitrogen, "nitrogen");
  const pScore = getNutrientScore(soilData.phosphorus, "phosphorus");
  const kScore = getNutrientScore(soilData.potassium, "potassium");
  const phScore = getNutrientScore(soilData.pH, "pH");
  const moistureScore = getNutrientScore(soilData.moisture, "moisture");

  const healthScore = Math.round((nScore + pScore + kScore + phScore + moistureScore) / 5);
  return healthScore;
};

// Generate nutrient recommendations
export const generateNutrientRecommendations = (soilData) => {
  const recommendations = [];

  if (soilData.nitrogen < NUTRIENT_THRESHOLDS.nitrogen.medium) {
    recommendations.push({
      nutrient: "Nitrogen",
      issue: "Low nitrogen levels",
      recommendation: "Apply nitrogen-rich fertilizer (Urea, Ammonium Nitrate)",
      dosage: "50-100 kg/hectare",
    });
  }

  if (soilData.phosphorus < NUTRIENT_THRESHOLDS.phosphorus.medium) {
    recommendations.push({
      nutrient: "Phosphorus",
      issue: "Low phosphorus levels",
      recommendation: "Apply phosphate fertilizer (DAP, SSP)",
      dosage: "40-60 kg/hectare",
    });
  }

  if (soilData.potassium < NUTRIENT_THRESHOLDS.potassium.medium) {
    recommendations.push({
      nutrient: "Potassium",
      issue: "Low potassium levels",
      recommendation: "Apply potassium fertilizer (MOP, SOP)",
      dosage: "30-50 kg/hectare",
    });
  }

  if (soilData.pH < 6) {
    recommendations.push({
      nutrient: "pH",
      issue: "Acidic soil",
      recommendation: "Apply lime (Calcium Carbonate)",
      dosage: "2-5 tons/hectare",
    });
  }

  if (soilData.pH > 7.5) {
    recommendations.push({
      nutrient: "pH",
      issue: "Alkaline soil",
      recommendation: "Apply sulfur or acidifying fertilizers",
      dosage: "1-2 tons/hectare",
    });
  }

  return recommendations;
};

// Add soil analysis record
export const addSoilAnalysis = async (soilData) => {
  const healthScore = calculateSoilHealthScore(soilData);
  const recommendations = generateNutrientRecommendations(soilData);

  const response = await axios.post(`${API_URL}/soilAnalysis`, {
    ...soilData,
    id: Math.random().toString(36).substr(2, 4),
    healthScore,
    recommendations,
    testDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

// Get latest soil analysis for location
export const getLatestSoilAnalysis = async (location) => {
  try {
    const response = await axios.get(`${API_URL}/soilAnalysis?location=${location}&_sort=createdAt&_order=desc&_limit=1`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching soil analysis:", error);
    return null;
  }
};

// Get all soil analyses for user
export const getUserSoilAnalyses = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/soilAnalysis?userId=${userId}&_sort=createdAt&_order=desc`);
    return response.data;
  } catch (error) {
    return [];
  }
};

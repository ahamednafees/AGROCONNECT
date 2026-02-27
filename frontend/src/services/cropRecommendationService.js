import axios from "axios";

const API_URL = "http://localhost:3000";

// Crop database with requirements
const CROP_DATABASE = [
  {
    name: "Rice",
    soilPH: [6, 7.5],
    nitrogenReq: "high",
    phosphorusReq: "medium",
    potassiumReq: "medium",
    moistureReq: "high",
    tempRange: [20, 35],
    rainfallReq: "high",
    diseaseResistance: ["fungal", "bacterial"],
  },
  {
    name: "Wheat",
    soilPH: [6, 7.5],
    nitrogenReq: "high",
    phosphorusReq: "medium",
    potassiumReq: "medium",
    moistureReq: "medium",
    tempRange: [15, 25],
    rainfallReq: "medium",
    diseaseResistance: ["fungal"],
  },
  {
    name: "Maize",
    soilPH: [6, 7],
    nitrogenReq: "high",
    phosphorusReq: "high",
    potassiumReq: "medium",
    moistureReq: "medium",
    tempRange: [20, 30],
    rainfallReq: "medium",
    diseaseResistance: ["pest"],
  },
  {
    name: "Tomato",
    soilPH: [6, 6.8],
    nitrogenReq: "medium",
    phosphorusReq: "high",
    potassiumReq: "high",
    moistureReq: "medium",
    tempRange: [20, 30],
    rainfallReq: "low",
    diseaseResistance: ["fungal"],
  },
  {
    name: "Potato",
    soilPH: [5.5, 7],
    nitrogenReq: "high",
    phosphorusReq: "high",
    potassiumReq: "high",
    moistureReq: "medium",
    tempRange: [15, 25],
    rainfallReq: "medium",
    diseaseResistance: ["fungal", "bacterial"],
  },
  {
    name: "Cotton",
    soilPH: [6, 7.5],
    nitrogenReq: "high",
    phosphorusReq: "medium",
    potassiumReq: "high",
    moistureReq: "low",
    tempRange: [20, 35],
    rainfallReq: "low",
    diseaseResistance: ["pest"],
  },
];

// Calculate soil compatibility score
const calculateSoilCompatibility = (crop, soilData) => {
  let score = 100;

  // pH compatibility
  if (soilData.pH < crop.soilPH[0] || soilData.pH > crop.soilPH[1]) {
    score -= 20;
  }

  // Nutrient compatibility
  if (crop.nitrogenReq === "high" && soilData.nitrogen < 40) score -= 15;
  if (crop.phosphorusReq === "high" && soilData.phosphorus < 20) score -= 15;
  if (crop.potassiumReq === "high" && soilData.potassium < 200) score -= 15;

  // Moisture compatibility
  if (crop.moistureReq === "high" && soilData.moisture < 50) score -= 10;
  if (crop.moistureReq === "low" && soilData.moisture > 70) score -= 10;

  return Math.max(0, score);
};

// Calculate climate compatibility score
const calculateClimateCompatibility = (crop, climateData) => {
  let score = 100;

  // Temperature compatibility
  if (climateData.temperature < crop.tempRange[0] || climateData.temperature > crop.tempRange[1]) {
    score -= 20;
  }

  // Rainfall compatibility
  if (crop.rainfallReq === "high" && climateData.rainfall < 50) score -= 15;
  if (crop.rainfallReq === "low" && climateData.rainfall > 100) score -= 15;

  return Math.max(0, score);
};

// Calculate disease risk inverse (lower disease risk = higher score)
const calculateDiseaseRiskInverse = (diseases) => {
  if (diseases.length === 0) return 100;

  const highRiskCount = diseases.filter((d) => d.riskLevel === "HIGH").length;
  const moderateRiskCount = diseases.filter((d) => d.riskLevel === "MODERATE").length;

  const riskScore = highRiskCount * 30 + moderateRiskCount * 15;
  return Math.max(0, 100 - riskScore);
};

// Generate crop recommendations
export const generateCropRecommendations = (soilData, climateData, diseases = []) => {
  const recommendations = [];

  CROP_DATABASE.forEach((crop) => {
    const soilScore = calculateSoilCompatibility(crop, soilData);
    const climateScore = calculateClimateCompatibility(crop, climateData);
    const diseaseScore = calculateDiseaseRiskInverse(diseases);

    const suitability = Math.round(soilScore * 0.4 + climateScore * 0.4 + diseaseScore * 0.2);

    if (suitability >= 50) {
      recommendations.push({
        cropName: crop.name,
        suitability,
        reason: generateReason(crop, soilData, climateData, suitability),
        soilRequirements: `pH: ${crop.soilPH[0]}-${crop.soilPH[1]}, N: ${crop.nitrogenReq}, P: ${crop.phosphorusReq}, K: ${crop.potassiumReq}`,
        climateRequirements: `Temp: ${crop.tempRange[0]}-${crop.tempRange[1]}°C, Rainfall: ${crop.rainfallReq}`,
        estimatedYield: suitability > 80 ? "High" : suitability > 60 ? "Medium" : "Low",
      });
    }
  });

  return recommendations.sort((a, b) => b.suitability - a.suitability);
};

// Generate reason for recommendation
const generateReason = (crop, soilData, climateData, suitability) => {
  const reasons = [];

  if (soilData.pH >= crop.soilPH[0] && soilData.pH <= crop.soilPH[1]) {
    reasons.push("Soil pH is optimal");
  }

  if (climateData.temperature >= crop.tempRange[0] && climateData.temperature <= crop.tempRange[1]) {
    reasons.push("Temperature is suitable");
  }

  if (suitability > 80) {
    reasons.push("Excellent growing conditions");
  }

  return reasons.length > 0 ? reasons.join(". ") : "Meets minimum requirements";
};

// Add crop recommendations
export const addCropRecommendations = async (location, userId, recommendations) => {
  const records = [];

  for (const rec of recommendations) {
    const response = await axios.post(`${API_URL}/cropRecommendations`, {
      ...rec,
      id: Math.random().toString(36).substr(2, 4),
      location,
      userId,
      createdAt: new Date().toISOString(),
    });
    records.push(response.data);
  }

  return records;
};

// Get crop recommendations for user
export const getCropRecommendations = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/cropRecommendations?userId=${userId}&_sort=suitability&_order=desc`);
    return response.data;
  } catch (error) {
    return [];
  }
};

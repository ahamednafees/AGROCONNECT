import axios from "axios";

const API_URL = "http://localhost:3000";

// Disease prediction rules
const DISEASE_RULES = [
  {
    name: "Fungal Disease",
    condition: (climate, soil) => climate.humidity > 75 && climate.temperature > 28,
    riskLevel: (climate, soil) => climate.humidity > 85 ? "HIGH" : "MODERATE",
    symptoms: "White/brown spots on leaves, powdery coating, leaf wilting",
    preventiveMeasures: [
      "Improve air circulation",
      "Reduce leaf wetness",
      "Apply fungicide spray",
      "Remove infected leaves",
    ],
    pesticides: ["Mancozeb", "Carbendazim", "Sulfur", "Copper Fungicide"],
  },
  {
    name: "Bacterial Disease",
    condition: (climate, soil) => climate.humidity > 80 && climate.temperature > 25,
    riskLevel: (climate, soil) => climate.humidity > 85 && climate.temperature > 30 ? "HIGH" : "MODERATE",
    symptoms: "Water-soaked lesions, bacterial ooze, leaf yellowing",
    preventiveMeasures: [
      "Use disease-free seeds",
      "Sanitize tools",
      "Remove infected plants",
      "Avoid overhead irrigation",
    ],
    pesticides: ["Copper Oxychloride", "Streptomycin", "Tetracycline"],
  },
  {
    name: "Drought Stress",
    condition: (climate, soil) => climate.rainfall < 30 && climate.temperature > 32,
    riskLevel: (climate, soil) => climate.rainfall < 20 ? "HIGH" : "MODERATE",
    symptoms: "Leaf wilting, stunted growth, yellowing, premature leaf drop",
    preventiveMeasures: [
      "Increase irrigation frequency",
      "Apply mulch",
      "Use drought-resistant varieties",
      "Improve soil water retention",
    ],
    pesticides: [],
  },
  {
    name: "Root Rot",
    condition: (climate, soil) => soil.moisture > 80 && climate.humidity > 70,
    riskLevel: (climate, soil) => soil.moisture > 90 ? "HIGH" : "MODERATE",
    symptoms: "Root discoloration, plant wilting despite wet soil, foul smell",
    preventiveMeasures: [
      "Improve drainage",
      "Reduce irrigation",
      "Apply fungicide to soil",
      "Aerate soil",
    ],
    pesticides: ["Trichoderma", "Pseudomonas", "Bacillus"],
  },
  {
    name: "Pest Infestation",
    condition: (climate, soil) => climate.temperature > 25 && climate.humidity > 60,
    riskLevel: (climate, soil) => climate.temperature > 30 ? "MODERATE" : "LOW",
    symptoms: "Visible insects, leaf damage, sticky residue, yellowing",
    preventiveMeasures: [
      "Regular monitoring",
      "Remove affected parts",
      "Use organic pesticides",
      "Encourage natural predators",
    ],
    pesticides: ["Neem Oil", "Pyrethrin", "Spinosad", "Imidacloprid"],
  },
];

// Predict diseases based on climate and soil
export const predictDiseases = (climateData, soilData) => {
  const predictions = [];

  DISEASE_RULES.forEach((rule) => {
    if (rule.condition(climateData, soilData)) {
      const riskLevel = rule.riskLevel(climateData, soilData);
      const probability = calculateProbability(riskLevel);

      predictions.push({
        diseaseName: rule.name,
        riskLevel,
        probability,
        symptoms: rule.symptoms,
        preventiveMeasures: rule.preventiveMeasures,
        suggestedPesticides: rule.pesticides,
        triggeredBy: "climate_soil",
      });
    }
  });

  return predictions;
};

// Calculate probability based on risk level
const calculateProbability = (riskLevel) => {
  switch (riskLevel) {
    case "HIGH":
      return 75 + Math.random() * 25;
    case "MODERATE":
      return 50 + Math.random() * 25;
    case "LOW":
      return 25 + Math.random() * 25;
    default:
      return 0;
  }
};

// Add disease prediction record
export const addDiseasePrediction = async (location, userId, predictions) => {
  const records = [];

  for (const prediction of predictions) {
    const response = await axios.post(`${API_URL}/cropDiseases`, {
      ...prediction,
      id: Math.random().toString(36).substr(2, 4),
      location,
      userId,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    });
    records.push(response.data);
  }

  return records;
};

// Get disease predictions for location
export const getDiseasePredictions = async (location) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get(`${API_URL}/cropDiseases?location=${location}&date=${today}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Get high-risk diseases
export const getHighRiskDiseases = async (location) => {
  try {
    const predictions = await getDiseasePredictions(location);
    return predictions.filter((p) => p.riskLevel === "HIGH");
  } catch (error) {
    return [];
  }
};

// Create disease alert notification
export const createDiseaseAlert = async (userId, disease) => {
  const response = await axios.post(`${API_URL}/notifications`, {
    id: Math.random().toString(36).substr(2, 4),
    userId,
    type: "DISEASE_ALERT",
    title: `Disease Risk Alert - ${disease.diseaseName}`,
    message: `${disease.diseaseName} risk detected (${disease.riskLevel}). ${disease.symptoms}`,
    riskLevel: disease.riskLevel,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

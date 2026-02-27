// Crop-specific optimal climate ranges and requirements
const CROP_PROFILES = {
  Rice: {
    temp: { min: 20, max: 30, optimal: 25 },
    rainfall: { min: 150, max: 250, optimal: 200 },
    humidity: { min: 60, max: 90, optimal: 75 },
    soilMoisture: { min: 50, max: 100, optimal: 75 },
    pH: { min: 5.5, max: 7.5, optimal: 6.5 },
    nutrients: { N: 120, P: 60, K: 40 },
    waterRequirement: 50, // L/acre
    yieldPotential: 65, // quintals/acre
  },
  Wheat: {
    temp: { min: 15, max: 25, optimal: 20 },
    rainfall: { min: 40, max: 100, optimal: 60 },
    humidity: { min: 40, max: 70, optimal: 55 },
    soilMoisture: { min: 30, max: 60, optimal: 45 },
    pH: { min: 6.0, max: 7.5, optimal: 6.8 },
    nutrients: { N: 100, P: 50, K: 30 },
    waterRequirement: 30,
    yieldPotential: 50,
  },
  Maize: {
    temp: { min: 18, max: 28, optimal: 23 },
    rainfall: { min: 50, max: 150, optimal: 100 },
    humidity: { min: 50, max: 80, optimal: 65 },
    soilMoisture: { min: 40, max: 70, optimal: 55 },
    pH: { min: 5.5, max: 7.5, optimal: 6.5 },
    nutrients: { N: 150, P: 70, K: 50 },
    waterRequirement: 40,
    yieldPotential: 55,
  },
  Cotton: {
    temp: { min: 21, max: 32, optimal: 27 },
    rainfall: { min: 60, max: 120, optimal: 90 },
    humidity: { min: 40, max: 70, optimal: 55 },
    soilMoisture: { min: 30, max: 60, optimal: 45 },
    pH: { min: 6.0, max: 7.5, optimal: 6.8 },
    nutrients: { N: 100, P: 50, K: 40 },
    waterRequirement: 35,
    yieldPotential: 20,
  },
  Tomato: {
    temp: { min: 20, max: 30, optimal: 25 },
    rainfall: { min: 50, max: 100, optimal: 75 },
    humidity: { min: 50, max: 80, optimal: 65 },
    soilMoisture: { min: 50, max: 80, optimal: 65 },
    pH: { min: 6.0, max: 6.8, optimal: 6.4 },
    nutrients: { N: 120, P: 80, K: 100 },
    waterRequirement: 45,
    yieldPotential: 40,
  },
};

// Calculate climate suitability score
const calculateClimateSuitability = (climate, cropProfile) => {
  let score = 100;
  let details = [];

  // Temperature suitability
  const tempScore = calculateRangeScore(
    climate.temperature,
    cropProfile.temp.min,
    cropProfile.temp.max,
    cropProfile.temp.optimal
  );
  score = score * (tempScore / 100);
  if (tempScore < 70) details.push(`Temperature ${climate.temperature}°C is suboptimal`);

  // Rainfall suitability
  const rainfallScore = calculateRangeScore(
    climate.rainfall,
    cropProfile.rainfall.min,
    cropProfile.rainfall.max,
    cropProfile.rainfall.optimal
  );
  score = score * (rainfallScore / 100);
  if (rainfallScore < 70) details.push(`Rainfall ${climate.rainfall}mm is below optimal`);

  // Humidity suitability
  const humidityScore = calculateRangeScore(
    climate.humidity,
    cropProfile.humidity.min,
    cropProfile.humidity.max,
    cropProfile.humidity.optimal
  );
  score = score * (humidityScore / 100);

  return { score: Math.round(score), details };
};

// Calculate score based on range and optimal value
const calculateRangeScore = (value, min, max, optimal) => {
  if (value < min || value > max) return 40;
  if (value === optimal) return 100;
  const distance = Math.abs(value - optimal);
  const maxDistance = Math.max(optimal - min, max - optimal);
  return Math.round(100 - (distance / maxDistance) * 60);
};

// Calculate soil suitability score
const calculateSoilSuitability = (soil, cropProfile) => {
  let score = 100;
  let details = [];

  // pH suitability
  const phScore = calculateRangeScore(
    soil.pH,
    cropProfile.pH.min,
    cropProfile.pH.max,
    cropProfile.pH.optimal
  );
  score = score * (phScore / 100);
  if (phScore < 70) details.push(`Soil pH ${soil.pH} is suboptimal`);

  // Moisture suitability
  const moistureScore = calculateRangeScore(
    soil.moisture,
    cropProfile.soilMoisture.min,
    cropProfile.soilMoisture.max,
    cropProfile.soilMoisture.optimal
  );
  score = score * (moistureScore / 100);

  return { score: Math.round(score), details };
};

// Generate fertilizer recommendations
const generateFertilizerPlan = (soil, cropProfile, landSize) => {
  const deficiencies = [];
  const recommendations = {};

  // Check N deficiency
  if (soil.N < cropProfile.nutrients.N * 0.7) {
    const needed = (cropProfile.nutrients.N - soil.N) * landSize;
    recommendations.N = Math.round(needed);
    deficiencies.push(`N deficiency: Apply ${recommendations.N}kg`);
  } else {
    recommendations.N = Math.round(cropProfile.nutrients.N * 0.3 * landSize);
  }

  // Check P deficiency
  if (soil.P < cropProfile.nutrients.P * 0.7) {
    const needed = (cropProfile.nutrients.P - soil.P) * landSize;
    recommendations.P = Math.round(needed);
    deficiencies.push(`P deficiency: Apply ${recommendations.P}kg`);
  } else {
    recommendations.P = Math.round(cropProfile.nutrients.P * 0.3 * landSize);
  }

  // Check K deficiency
  if (soil.K < cropProfile.nutrients.K * 0.7) {
    const needed = (cropProfile.nutrients.K - soil.K) * landSize;
    recommendations.K = Math.round(needed);
    deficiencies.push(`K deficiency: Apply ${recommendations.K}kg`);
  } else {
    recommendations.K = Math.round(cropProfile.nutrients.K * 0.3 * landSize);
  }

  return {
    N: recommendations.N,
    P: recommendations.P,
    K: recommendations.K,
    notes: deficiencies.length > 0 ? deficiencies.join(", ") : "Nutrients balanced. Apply maintenance dose.",
    applicationSchedule: "Apply in 3 splits: 50% at planting, 25% at tillering, 25% at flowering",
  };
};

// Generate disease prevention plan
const generateDiseasePrevention = (climate, soil, diseaseRisks) => {
  const measures = [];

  // High humidity → fungal disease risk
  if (climate.humidity > 75) {
    measures.push("Fungal Disease Prevention: Use Mancozeb or Carbendazim spray every 10 days");
    measures.push("Ensure proper field drainage and spacing");
  }

  // High temperature + low rainfall → drought stress
  if (climate.temperature > 32 && climate.rainfall < 30) {
    measures.push("Drought Management: Increase irrigation frequency");
    measures.push("Apply mulch to retain soil moisture");
  }

  // High soil moisture → root rot risk
  if (soil.moisture > 80) {
    measures.push("Root Rot Prevention: Improve drainage, avoid waterlogging");
    measures.push("Use fungicide if symptoms appear");
  }

  // Add disease-specific measures from disease module
  if (diseaseRisks && diseaseRisks.length > 0) {
    diseaseRisks.forEach((disease) => {
      if (disease.riskLevel === "HIGH") {
        measures.push(`${disease.name}: ${disease.preventiveMeasures}`);
      }
    });
  }

  return measures.length > 0 ? measures : ["Maintain field hygiene", "Monitor crop regularly"];
};

// Estimate yield based on suitability and conditions
const estimateYield = (cropProfile, climateSuitability, soilSuitability, diseaseRiskLevel) => {
  let yieldMultiplier = 1;

  // Climate impact
  yieldMultiplier *= climateSuitability.score / 100;

  // Soil impact
  yieldMultiplier *= soilSuitability.score / 100;

  // Disease impact
  if (diseaseRiskLevel === "HIGH") yieldMultiplier *= 0.7;
  else if (diseaseRiskLevel === "MODERATE") yieldMultiplier *= 0.85;

  const expectedYield = Math.round(cropProfile.yieldPotential * yieldMultiplier * 10) / 10;
  const confidence = Math.round((climateSuitability.score + soilSuitability.score) / 2);

  return {
    expected: expectedYield,
    unit: "quintals/acre",
    confidence: confidence / 100,
    potential: cropProfile.yieldPotential,
  };
};

// Generate smart advisory tips
const generateSmartTips = (cropType, climate, soil, diseaseRisks) => {
  const tips = [];

  if (cropType === "Rice") {
    tips.push("Maintain 5cm water level during growing season");
    tips.push("Monitor for leaf blast and brown spot diseases");
    tips.push("Apply potassium at panicle initiation stage");
  } else if (cropType === "Wheat") {
    tips.push("Avoid waterlogging during grain filling");
    tips.push("Monitor for Septoria and Powdery Mildew");
    tips.push("Apply fungicide at flag leaf stage if needed");
  } else if (cropType === "Maize") {
    tips.push("Ensure proper spacing for air circulation");
    tips.push("Monitor for fall armyworm and stem borers");
    tips.push("Apply nitrogen in split doses");
  } else if (cropType === "Cotton") {
    tips.push("Monitor for bollworms and whiteflies");
    tips.push("Maintain optimal plant population");
    tips.push("Apply defoliant 2 weeks before harvest");
  } else if (cropType === "Tomato") {
    tips.push("Provide support structure for vining varieties");
    tips.push("Monitor for early and late blight");
    tips.push("Harvest at breaker stage for better shelf life");
  }

  // Add climate-specific tips
  if (climate.temperature > 30) tips.push("High temperature: Increase irrigation frequency");
  if (climate.humidity > 80) tips.push("High humidity: Improve field ventilation");
  if (soil.moisture < 40) tips.push("Low soil moisture: Increase irrigation");

  return tips;
};

// Main plan generation function
export const generateSmartFarmingPlan = (cropType, climate, soil, diseaseRisks, landSize) => {
  if (!CROP_PROFILES[cropType]) {
    throw new Error(`Crop type ${cropType} not supported`);
  }

  const cropProfile = CROP_PROFILES[cropType];

  // Calculate suitability scores
  const climateSuitability = calculateClimateSuitability(climate, cropProfile);
  const soilSuitability = calculateSoilSuitability(soil, cropProfile);

  // Overall suitability score
  const overallSuitability = Math.round(
    (climateSuitability.score * 0.5 + soilSuitability.score * 0.5)
  );

  // Determine risk level
  let riskLevel = "LOW";
  let riskWarnings = [];

  if (overallSuitability < 50) {
    riskLevel = "HIGH";
    riskWarnings.push("Crop conditions are unfavorable. Consider alternative crops.");
  } else if (overallSuitability < 70) {
    riskLevel = "MODERATE";
    riskWarnings.push("Crop conditions are suboptimal. Implement mitigation measures.");
  }

  // Add disease-related warnings
  if (diseaseRisks && diseaseRisks.length > 0) {
    const highRiskDiseases = diseaseRisks.filter((d) => d.riskLevel === "HIGH");
    if (highRiskDiseases.length > 0) {
      riskWarnings.push(
        `High disease risk: ${highRiskDiseases.map((d) => d.name).join(", ")}`
      );
    }
  }

  // Generate plan components
  const irrigationPlan = {
    frequency: climate.rainfall < 50 ? "Daily" : climate.rainfall < 100 ? "Every2Days" : "Weekly",
    water_amount: Math.round(cropProfile.waterRequirement * (1 + (100 - climate.rainfall) / 100)),
    method: climate.humidity > 75 ? "Drip" : "Sprinkler",
    best_time: climate.temperature > 28 ? "Morning" : "Evening",
  };

  const fertilizerPlan = generateFertilizerPlan(soil, cropProfile, landSize);
  const diseasePrevention = generateDiseasePrevention(climate, soil, diseaseRisks);
  const yieldEstimation = estimateYield(
    cropProfile,
    climateSuitability,
    soilSuitability,
    riskLevel
  );
  const smartTips = generateSmartTips(cropType, climate, soil, diseaseRisks);

  return {
    crop_type: cropType,
    suitability_score: overallSuitability,
    climate_suitability: {
      score: climateSuitability.score,
      status: climateSuitability.score >= 70 ? "Suitable" : "Suboptimal",
      details: climateSuitability.details,
    },
    soil_suitability: {
      score: soilSuitability.score,
      status: soilSuitability.score >= 70 ? "Suitable" : "Suboptimal",
      details: soilSuitability.details,
    },
    irrigation_plan: irrigationPlan,
    fertilizer_plan: fertilizerPlan,
    disease_prevention_plan: diseasePrevention,
    yield_estimation: yieldEstimation,
    risk_level: riskLevel,
    risk_warnings: riskWarnings,
    smart_tips: smartTips,
    created_at: new Date().toISOString(),
  };
};

// Check if plan exists for today
export const checkPlanExists = (plans, cropType, today) => {
  return plans.some(
    (plan) =>
      plan.crop_type === cropType &&
      plan.created_at.split("T")[0] === today
  );
};

// Market Price Forecasting Service
// Rule-based price prediction using climate, soil, and disease data

// Dummy market price data for seeding
const DUMMY_MARKET_PRICES = [
  {
    id: "mp_001",
    crop_type: "Rice",
    location: "Tiruppur",
    current_price: 2500,
    date: "2026-02-27"
  },
  {
    id: "mp_002",
    crop_type: "Wheat",
    location: "Tiruppur",
    current_price: 2200,
    date: "2026-02-27"
  },
  {
    id: "mp_003",
    crop_type: "Maize",
    location: "Tiruppur",
    current_price: 1800,
    date: "2026-02-27"
  },
  {
    id: "mp_004",
    crop_type: "Cotton",
    location: "Tiruppur",
    current_price: 5500,
    date: "2026-02-27"
  },
  {
    id: "mp_005",
    crop_type: "Tomato",
    location: "Tiruppur",
    current_price: 1200,
    date: "2026-02-27"
  }
];

// Crop-specific adjustment multipliers
const CROP_SENSITIVITY = {
  Rice: 1.0,
  Wheat: 0.8,
  Maize: 0.9,
  Cotton: 1.3,
  Tomato: 1.2
};

// Calculate climate risk adjustment
const calculateClimateAdjustment = (climateRiskLevel, cropType = "Rice") => {
  const baseRates = { HIGH: 0.08, MODERATE: 0.03, LOW: 0.0 };
  const multiplier = CROP_SENSITIVITY[cropType] || 1.0;
  return (baseRates[climateRiskLevel] || 0.0) * multiplier;
};

// Calculate rainfall impact
const calculateRainfallImpact = (rainfall, cropType = "Rice") => {
  const multiplier = CROP_SENSITIVITY[cropType] || 1.0;
  if (rainfall < 30) {
    return { adjustment: 0.05 * multiplier, impact: "Drought - Supply Low" };
  } else if (rainfall <= 100) {
    return { adjustment: -0.02 * multiplier, impact: "Good Supply" };
  } else {
    return { adjustment: -0.03 * multiplier, impact: "Excess Supply" };
  }
};

// Calculate soil quality impact
const calculateSoilImpact = (soilQuality, cropType = "Rice") => {
  const baseRates = { Poor: 0.04, Average: 0.01, Good: -0.02 };
  const multiplier = CROP_SENSITIVITY[cropType] || 1.0;
  const rate = baseRates[soilQuality] || 0.0;
  const impacts = { Poor: "Poor Soil - Low Yield", Average: "Average Soil", Good: "Good Soil - High Yield" };
  return { adjustment: rate * multiplier, impact: impacts[soilQuality] || "Unknown" };
};

// Calculate disease risk impact
const calculateDiseaseImpact = (diseaseRiskLevel, cropType = "Rice") => {
  const baseRates = { HIGH: 0.06, MODERATE: 0.02, LOW: 0.0 };
  const multiplier = CROP_SENSITIVITY[cropType] || 1.0;
  const rate = baseRates[diseaseRiskLevel] || 0.0;
  const impacts = { HIGH: "High Disease Risk", MODERATE: "Moderate Disease Risk", LOW: "Low Disease Risk" };
  return { adjustment: rate * multiplier, impact: impacts[diseaseRiskLevel] || "Unknown" };
};

// Generate price forecast
export const generatePriceForecast = (
  currentPrice,
  climateData,
  soilData,
  diseaseRiskLevel,
  cropType = "Rice"
) => {
  // Calculate individual adjustments with crop-specific rates
  const climateAdjustment = calculateClimateAdjustment(climateData.riskLevel, cropType);
  const rainfallImpact = calculateRainfallImpact(climateData.rainfall, cropType);
  const soilImpact = calculateSoilImpact(soilData.quality, cropType);
  const diseaseImpact = calculateDiseaseImpact(diseaseRiskLevel, cropType);

  // Total adjustment
  const totalAdjustment =
    climateAdjustment +
    rainfallImpact.adjustment +
    soilImpact.adjustment +
    diseaseImpact.adjustment;

  // Calculate forecast price
  const forecastPrice = Math.round(currentPrice * (1 + totalAdjustment));
  const priceChangePercent = Math.round(totalAdjustment * 100 * 10) / 10;

  return {
    currentPrice,
    forecastPrice,
    priceChangePercent,
    adjustments: {
      climate: {
        value: Math.round(climateAdjustment * 100 * 10) / 10,
        label: climateData.riskLevel + " Risk"
      },
      rainfall: {
        value: Math.round(rainfallImpact.adjustment * 100 * 10) / 10,
        label: rainfallImpact.impact
      },
      soil: {
        value: Math.round(soilImpact.adjustment * 100 * 10) / 10,
        label: soilImpact.impact
      },
      disease: {
        value: Math.round(diseaseImpact.adjustment * 100 * 10) / 10,
        label: diseaseImpact.impact
      }
    },
    factors: {
      climateRiskLevel: climateData.riskLevel,
      rainfall: climateData.rainfall,
      soilQuality: soilData.quality,
      diseaseRiskLevel: diseaseRiskLevel
    }
  };
};

// Generate dummy trend data (last 5 days)
export const generatePriceTrend = (currentPrice) => {
  const trend = [];
  let price = currentPrice - 150;

  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = Math.floor(Math.random() * 200) - 100; // -100 to +100
    price += variation;

    trend.push({
      date: date.toISOString().split("T")[0],
      price: Math.max(price, currentPrice - 300), // Ensure reasonable range
      dayLabel: i === 0 ? "Today" : `${i} days ago`
    });
  }

  return trend;
};

// Check if price forecast exists for today
export const checkForecastExists = (forecasts, cropType, location, today) => {
  return forecasts.some(
    (forecast) =>
      forecast.crop_type === cropType &&
      forecast.location === location &&
      forecast.generated_date === today
  );
};

// Get soil quality from soil analysis
export const getSoilQuality = (soilAnalysis) => {
  if (!soilAnalysis) return "Average";

  const healthScore = soilAnalysis.healthScore || 50;

  if (healthScore >= 80) return "Good";
  if (healthScore >= 60) return "Average";
  return "Poor";
};

// Get climate risk level
export const getClimateRiskLevel = (climateAnalysis) => {
  if (!climateAnalysis) return "LOW";
  return climateAnalysis.riskLevel || "LOW";
};

// Seed dummy market prices
export const seedMarketPrices = (existingPrices, userLocation = "Tiruppur") => {
  if (existingPrices && existingPrices.length > 0) {
    return existingPrices; // Already seeded
  }

  return DUMMY_MARKET_PRICES.map((price) => ({
    ...price,
    location: userLocation,
    id: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString()
  }));
};

// Get current price for crop and location
export const getCurrentPrice = (marketPrices, cropType, location) => {
  const price = marketPrices.find(
    (p) => p.crop_type === cropType && (p.location === location || p.location === "Tiruppur")
  );

  return price ? price.current_price : 2000; // Default fallback
};

// Format price for display
export const formatPrice = (price) => {
  return `₹${price.toLocaleString("en-IN")}`;
};

// Get price trend color
export const getPriceColor = (changePercent) => {
  if (changePercent > 0) return "#28a745"; // Green - price increase
  if (changePercent < 0) return "#dc3545"; // Red - price decrease
  return "#6c757d"; // Gray - no change
};

// Get price trend icon
export const getPriceIcon = (changePercent) => {
  if (changePercent > 0) return "📈"; // Up
  if (changePercent < 0) return "📉"; // Down
  return "➡️"; // Neutral
};

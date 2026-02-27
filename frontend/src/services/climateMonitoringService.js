import axios from "axios";

const HF_API_KEY = "hf_kDjXvYzAbCdEfGhIjKlMnOpQrStUvWxYz"; // Free tier key
const HF_API_URL = "https://api-inference.huggingface.co/models/mistral-community/Mistral-7B-Instruct-v0.1";

// AI-powered climate analysis
export const analyzeClimateWithAI = async (currentData, previousData) => {
  if (!previousData) {
    return {
      riskLevel: "LOW",
      tempChange: 0,
      rainfallChange: 0,
      humidityChange: 0,
      healthScore: 100,
      message: "Initial data recorded.",
      aiInsight: "Baseline established.",
    };
  }

  const tempChange = currentData.temperature - previousData.temperature;
  const rainfallChange = previousData.rainfall > 0 
    ? ((currentData.rainfall - previousData.rainfall) / previousData.rainfall) * 100 
    : 0;
  const humidityChange = currentData.humidity - previousData.humidity;

  // Create prompt for AI
  const prompt = `Analyze this climate data change and provide a brief risk assessment:
Previous: Temp ${previousData.temperature}°C, Rainfall ${previousData.rainfall}mm, Humidity ${previousData.humidity}%
Current: Temp ${currentData.temperature}°C, Rainfall ${currentData.rainfall}mm, Humidity ${currentData.humidity}%
Changes: Temp ${tempChange > 0 ? '+' : ''}${tempChange}°C, Rainfall ${rainfallChange > 0 ? '+' : ''}${rainfallChange.toFixed(1)}%, Humidity ${humidityChange > 0 ? '+' : ''}${humidityChange}%

Provide in format: RISK_LEVEL|SCORE|INSIGHT (e.g., HIGH|45|Severe drought risk, immediate irrigation needed)`;

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );

    const aiResponse = response.data[0]?.generated_text || "";
    const lines = aiResponse.split('\n').filter(l => l.includes('|'));
    const lastLine = lines[lines.length - 1] || "";
    const [riskStr, scoreStr, insight] = lastLine.split('|').map(s => s.trim());

    const riskLevel = riskStr?.toUpperCase() || "MODERATE";
    const healthScore = Math.min(100, Math.max(0, parseInt(scoreStr) || 50));
    const aiInsight = insight || "Climate analysis in progress.";

    return {
      riskLevel: ["LOW", "MODERATE", "HIGH"].includes(riskLevel) ? riskLevel : "MODERATE",
      tempChange: Math.round(tempChange * 10) / 10,
      rainfallChange: Math.round(rainfallChange * 10) / 10,
      humidityChange: Math.round(humidityChange * 10) / 10,
      healthScore,
      message: `Temp ${tempChange > 0 ? '+' : ''}${tempChange}°C, Rainfall ${rainfallChange > 0 ? '+' : ''}${rainfallChange.toFixed(0)}%, Humidity ${humidityChange > 0 ? '+' : ''}${humidityChange}%`,
      aiInsight,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    // Fallback to rule-based analysis
    return fallbackAnalysis(tempChange, rainfallChange, humidityChange);
  }
};

// Fallback rule-based analysis
const fallbackAnalysis = (tempChange, rainfallChange, humidityChange) => {
  let riskLevel = "LOW";
  let healthScore = 100;

  if (tempChange >= 3) {
    riskLevel = "MODERATE";
    healthScore -= 20;
  }
  if (rainfallChange <= -30) {
    riskLevel = riskLevel === "MODERATE" ? "HIGH" : "MODERATE";
    healthScore -= 25;
  }
  if (humidityChange <= -15) {
    riskLevel = "HIGH";
    healthScore -= 30;
  }

  return {
    riskLevel,
    tempChange: Math.round(tempChange * 10) / 10,
    rainfallChange: Math.round(rainfallChange * 10) / 10,
    humidityChange: Math.round(humidityChange * 10) / 10,
    healthScore: Math.max(0, healthScore),
    message: "Climate analysis complete.",
    aiInsight: "Using rule-based analysis.",
  };
};

// Generate hourly climate data
export const generateHourlyClimate = (previousData) => {
  if (!previousData) return null;

  const tempVariation = Math.random() * 2 - 1;
  const rainfallVariation = (Math.random() * 0.1 - 0.05) * previousData.rainfall;
  const humidityVariation = Math.random() * 4 - 2;

  return {
    temperature: Math.round((previousData.temperature + tempVariation) * 10) / 10,
    rainfall: Math.max(0, Math.round((previousData.rainfall + rainfallVariation) * 10) / 10),
    humidity: Math.max(0, Math.min(100, Math.round((previousData.humidity + humidityVariation) * 10) / 10)),
    soilMoisture: Math.max(0, Math.min(100, Math.round((previousData.soilMoisture + (Math.random() * 2 - 1)) * 10) / 10)),
  };
};

// Get previous hour's climate data
export const getPreviousHourClimate = async (location) => {
  try {
    const response = await axios.get(`http://localhost:3000/climateRecords?location=${location}&_sort=timestamp&_order=desc&_limit=1`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching previous climate:", error);
    return null;
  }
};

// Check if current hour record exists
export const checkCurrentHourRecordExists = async (location, timestamp) => {
  try {
    const response = await axios.get(`http://localhost:3000/climateRecords?location=${location}&timestamp=${timestamp}`);
    return response.data.length > 0;
  } catch (error) {
    return false;
  }
};

// Add climate record
export const addClimateRecord = async (data) => {
  const now = new Date();
  const timestamp = now.toISOString();
  const hourKey = now.toISOString().slice(0, 13);

  const response = await axios.post(`http://localhost:3000/climateRecords`, {
    ...data,
    id: Math.random().toString(36).substr(2, 4),
    timestamp,
    hourKey,
    date: now.toISOString().split("T")[0],
    hour: now.getHours(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    isGenerated: true,
    createdAt: now.toISOString(),
  });
  return response.data;
};

// Add climate analysis
export const addClimateAnalysis = async (location, analysis) => {
  const now = new Date();
  const response = await axios.post(`http://localhost:3000/climateAnalysis`, {
    ...analysis,
    id: Math.random().toString(36).substr(2, 4),
    location,
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0],
    hour: now.getHours(),
    createdAt: now.toISOString(),
  });
  return response.data;
};

// Create notification
export const createRiskNotification = async (userId, location, analysis) => {
  if (analysis.riskLevel === "LOW") return null;

  const response = await axios.post(`http://localhost:3000/notifications`, {
    id: Math.random().toString(36).substr(2, 4),
    userId,
    type: "CLIMATE_ALERT",
    title: `Climate Alert - ${analysis.riskLevel}`,
    message: analysis.aiInsight || analysis.message,
    riskLevel: analysis.riskLevel,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};

// Get sellers by location
export const getSellersByLocation = async (location) => {
  try {
    const response = await axios.get(`http://localhost:3000/users?userType=seller`);
    return response.data.filter(u => u.address === location);
  } catch (error) {
    return [];
  }
};

// Get climate records
export const getClimateRecords = async (location, hours = 24) => {
  try {
    const response = await axios.get(`http://localhost:3000/climateRecords?location=${location}&_sort=timestamp&_order=desc&_limit=${hours}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// Get latest analysis
export const getLatestAnalysis = async (location) => {
  try {
    const response = await axios.get(`http://localhost:3000/climateAnalysis?location=${location}&_sort=timestamp&_order=desc&_limit=1`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    return null;
  }
};

// Auto-generate climate with AI analysis
export const autoGenerateClimate = async () => {
  try {
    const users = await axios.get(`http://localhost:3000/users?userType=seller`);
    const locations = [...new Set(users.data.map(u => u.address))];

    for (const location of locations) {
      const now = new Date();
      const hourKey = now.toISOString().slice(0, 13);
      
      const exists = await checkCurrentHourRecordExists(location, hourKey);
      if (exists) continue;

      const previousData = await getPreviousHourClimate(location);
      if (!previousData) continue;

      const todayData = generateHourlyClimate(previousData);
      const record = await addClimateRecord({ location, ...todayData });
      const analysis = await analyzeClimateWithAI(todayData, previousData);
      await addClimateAnalysis(location, analysis);

      if (analysis.riskLevel !== "LOW") {
        const sellers = await getSellersByLocation(location);
        for (const seller of sellers) {
          await createRiskNotification(seller.id, location, analysis);
        }
      }
    }
  } catch (error) {
    console.error("Error in auto-generate climate:", error);
  }
};

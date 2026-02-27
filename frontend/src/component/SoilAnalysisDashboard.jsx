import React, { useState, useEffect } from "react";
import { addSoilAnalysis, getLatestSoilAnalysis } from "../services/soilAnalysisService";
import { predictDiseases, addDiseasePrediction, getHighRiskDiseases } from "../services/diseaseDetectionService";
import { generateCropRecommendations, addCropRecommendations, getCropRecommendations } from "../services/cropRecommendationService";
import { getLatestAnalysis } from "../services/climateMonitoringService";
import toast from "react-hot-toast";
import "./SoilAnalysisDashboard.css";

const SoilAnalysisDashboard = () => {
  const [soilData, setSoilData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    pH: "",
    moisture: "",
    organicCarbon: "",
  });
  const [latestSoil, setLatestSoil] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const location = user.address || "";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const soil = await getLatestSoilAnalysis(location);
      setLatestSoil(soil);

      if (soil) {
        const recs = await getCropRecommendations(user.id);
        setRecommendations(recs);

        const highRisk = await getHighRiskDiseases(location);
        setDiseases(highRisk);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSoilData({ ...soilData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add soil analysis
      const soil = await addSoilAnalysis({
        ...soilData,
        nitrogen: parseFloat(soilData.nitrogen),
        phosphorus: parseFloat(soilData.phosphorus),
        potassium: parseFloat(soilData.potassium),
        pH: parseFloat(soilData.pH),
        moisture: parseFloat(soilData.moisture),
        organicCarbon: parseFloat(soilData.organicCarbon),
        location,
        userId: user.id,
      });

      // Get climate data
      const climate = await getLatestAnalysis(location);

      // Predict diseases
      if (climate) {
        const diseaseList = predictDiseases(climate, soil);
        if (diseaseList.length > 0) {
          await addDiseasePrediction(location, user.id, diseaseList);
          setDiseases(diseaseList.filter((d) => d.riskLevel === "HIGH"));

          // Create alerts for high-risk diseases
          for (const disease of diseaseList.filter((d) => d.riskLevel === "HIGH")) {
            await axios.post(`http://localhost:3000/notifications`, {
              id: Math.random().toString(36).substr(2, 4),
              userId: user.id,
              type: "DISEASE_ALERT",
              title: `Disease Risk - ${disease.diseaseName}`,
              message: disease.symptoms,
              riskLevel: disease.riskLevel,
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        }

        // Generate crop recommendations
        const recs = generateCropRecommendations(soil, climate, diseaseList);
        if (recs.length > 0) {
          await addCropRecommendations(location, user.id, recs);
          setRecommendations(recs);
        }
      }

      setLatestSoil(soil);
      setSoilData({ nitrogen: "", phosphorus: "", potassium: "", pH: "", moisture: "", organicCarbon: "" });
      toast.success("Soil analysis completed!");
      loadData();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to analyze soil");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "#28a745";
    if (score >= 60) return "#ffc107";
    return "#dc3545";
  };

  if (!user || !user.id) {
    return <div className="container mt-5"><h3>Please login first</h3></div>;
  }

  return (
    <div className="soil-dashboard">
      <div className="container mt-4">
        <h2>🌱 Soil Analysis & Crop Recommendations</h2>

        {/* Soil Health Card */}
        {latestSoil && (
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Soil Health Score</h6>
                  <div className="health-score" style={{ color: getHealthColor(latestSoil.healthScore) }}>
                    {latestSoil.healthScore}/100
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>pH Level</h6>
                  <p className="mb-0">{latestSoil.pH}</p>
                  <small>{latestSoil.pH >= 6 && latestSoil.pH <= 7.5 ? "Optimal" : "Needs adjustment"}</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6>Soil Moisture</h6>
                  <p className="mb-0">{latestSoil.moisture}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disease Risk */}
        {diseases.length > 0 && (
          <div className="card mb-4 border-danger">
            <div className="card-body">
              <h5>⚠️ Disease Risks Detected</h5>
              {diseases.map((disease) => (
                <div key={disease.id} className="alert alert-danger mb-2">
                  <strong>{disease.diseaseName}</strong> - {disease.symptoms}
                  <br />
                  <small>Preventive: {disease.preventiveMeasures.join(", ")}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crop Recommendations */}
        {recommendations.length > 0 && (
          <div className="card mb-4">
            <div className="card-body">
              <h5>🌾 Recommended Crops</h5>
              {recommendations.slice(0, 5).map((rec) => (
                <div key={rec.id} className="alert alert-info mb-2">
                  <strong>{rec.cropName}</strong> - Suitability: {rec.suitability}%
                  <br />
                  <small>{rec.reason}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soil Analysis Form */}
        <div className="card">
          <div className="card-body">
            <h5>📝 Enter Soil Test Results</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Nitrogen (mg/kg)</label>
                  <input
                    type="number"
                    name="nitrogen"
                    className="form-control"
                    value={soilData.nitrogen}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Phosphorus (mg/kg)</label>
                  <input
                    type="number"
                    name="phosphorus"
                    className="form-control"
                    value={soilData.phosphorus}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Potassium (mg/kg)</label>
                  <input
                    type="number"
                    name="potassium"
                    className="form-control"
                    value={soilData.potassium}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">pH Value</label>
                  <input
                    type="number"
                    name="pH"
                    className="form-control"
                    step="0.1"
                    min="4"
                    max="9"
                    value={soilData.pH}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Moisture (%)</label>
                  <input
                    type="number"
                    name="moisture"
                    className="form-control"
                    value={soilData.moisture}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Organic Carbon (%)</label>
                  <input
                    type="number"
                    name="organicCarbon"
                    className="form-control"
                    step="0.1"
                    value={soilData.organicCarbon}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Soil"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysisDashboard;

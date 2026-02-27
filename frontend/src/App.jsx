import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./component/Home";
import Login from "./component/Login";
import Signup from "./component/Signup";
import BuyerDashboard from "./component/BuyerDashboard";
import SellerDashboard from "./component/SellerDashboard";
import EquipmentRenting from "./component/EquipmentRenting.jsx";
import Chat from "./component/Chat.jsx";
import Calendar from "./component/Calendar";
import ClimateDashboard from "./component/ClimateDashboard";
import SoilAnalysisDashboard from "./component/SoilAnalysisDashboard";
import MarketPriceForecastDashboard from "./component/MarketPriceForecastDashboard";
import SmartCropPlanDashboard from "./component/SmartCropPlanDashboard";
import { startClimateScheduler } from "./services/climateScheduler";
import "./App.css";

// Start climate scheduler on app load
startClimateScheduler();

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/equipment-renting" element={<EquipmentRenting />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/climate" element={<ClimateDashboard />} />
          <Route path="/soil-analysis" element={<SoilAnalysisDashboard />} />
          <Route path="/market-price-forecast" element={<MarketPriceForecastDashboard />} />
          <Route path="/smart-crop-plan" element={<SmartCropPlanDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

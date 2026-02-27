# Smart Crop Plan - Visual Architecture & Flow Diagrams

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AgroConnect Smart Farming System                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Frontend Layer (React)                         │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  SmartCropPlanDashboard.jsx                                 │    │   │
│  │  │  ├─ Crop Selection Dropdown                                 │    │   │
│  │  │  ├─ Land Size Input                                         │    │   │
│  │  │  ├─ Generate Plan Button                                    │    │   │
│  │  │  ├─ Plan Display Section                                    │    │   │
│  │  │  │  ├─ Suitability Scores (Climate, Soil, Overall)         │    │   │
│  │  │  │  ├─ Irrigation Plan Details                              │    │   │
│  │  │  │  ├─ Fertilizer Recommendations                           │    │   │
│  │  │  │  ├─ Disease Prevention Measures                          │    │   │
│  │  │  │  ├─ Yield Estimation                                     │    │   │
│  │  │  │  └─ Smart Advisory Tips                                  │    │   │
│  │  │  └─ Plan History Table                                      │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  SmartCropPlanDashboard.css                                 │    │   │
│  │  │  ├─ Gradient Backgrounds                                    │    │   │
│  │  │  ├─ Color-Coded Badges                                      │    │   │
│  │  │  ├─ Progress Bars                                           │    │   │
│  │  │  ├─ Animations & Transitions                                │    │   │
│  │  │  └─ Responsive Design                                       │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Business Logic Layer (Services)                    │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  smartFarmingPlanService.js                                 │    │   │
│  │  │                                                              │    │   │
│  │  │  ┌──────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ CROP_PROFILES (5 Crops)                              │   │    │   │
│  │  │  │ ├─ Rice: 20-30°C, 150-250mm, 65 q/acre              │   │    │   │
│  │  │  │ ├─ Wheat: 15-25°C, 40-100mm, 50 q/acre              │   │    │   │
│  │  │  │ ├─ Maize: 18-28°C, 50-150mm, 55 q/acre              │   │    │   │
│  │  │  │ ├─ Cotton: 21-32°C, 60-120mm, 20 q/acre             │   │    │   │
│  │  │  │ └─ Tomato: 20-30°C, 50-100mm, 40 q/acre             │   │    │   │
│  │  │  └──────────────────────────────────────────────────────┘   │    │   │
│  │  │                                                              │    │   │
│  │  │  ┌──────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ Calculation Engines                                  │   │    │   │
│  │  │  │ ├─ calculateClimateSuitability()                     │   │    │   │
│  │  │  │ ├─ calculateSoilSuitability()                        │   │    │   │
│  │  │  │ ├─ generateFertilizerPlan()                          │   │    │   │
│  │  │  │ ├─ generateDiseasePrevention()                       │   │    │   │
│  │  │  │ ├─ estimateYield()                                   │   │    │   │
│  │  │  │ ├─ generateSmartTips()                               │   │    │   │
│  │  │  │ └─ checkPlanExists()                                 │   │    │   │
│  │  │  └──────────────────────────────────────────────────────┘   │    │   │
│  │  │                                                              │    │   │
│  │  │  ┌──────────────────────────────────────────────────────┐   │    │   │
│  │  │  │ Main Function: generateSmartFarmingPlan()            │   │    │   │
│  │  │  │ Input: crop, climate, soil, diseases, landSize      │   │    │   │
│  │  │  │ Output: Complete farming plan object                │   │    │   │
│  │  │  └──────────────────────────────────────────────────────┘   │    │   │
│  │  │                                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Data Layer (Storage)                             │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  localStorage (Client-Side)                                 │    │   │
│  │  │  └─ farmingPlans: Array of plan objects                     │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  data.json (Mock Database)                                  │    │   │
│  │  │  └─ crop_farming_plans: Collection with sample plans        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  Future: Backend Database (PostgreSQL/MongoDB)              │    │   │
│  │  │  └─ crop_farming_plans table with full schema               │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Plan Generation Flow Diagram

```
START
  │
  ├─→ User Input
  │   ├─ Crop Type (Rice/Wheat/Maize/Cotton/Tomato)
  │   ├─ Land Size (acres)
  │   └─ Location (auto-filled from user profile)
  │
  ├─→ Validation
  │   ├─ Check if crop is supported
  │   ├─ Check if land size is valid (0.5-100 acres)
  │   └─ Check if user is authenticated
  │
  ├─→ Duplicate Check
  │   ├─ Get today's date
  │   ├─ Search for existing plan (same crop, same day)
  │   └─ If exists → Show error & stop
  │
  ├─→ Data Fetching
  │   ├─ Get latest climate data (temperature, rainfall, humidity)
  │   ├─ Get soil analysis data (N, P, K, pH, moisture)
  │   └─ Get disease risk data (from disease module)
  │
  ├─→ Suitability Calculation
  │   ├─ Climate Suitability (50% weight)
  │   │  ├─ Temperature match score
  │   │  ├─ Rainfall match score
  │   │  └─ Humidity match score
  │   │
  │   └─ Soil Suitability (50% weight)
  │      ├─ pH match score
  │      └─ Moisture match score
  │
  ├─→ Overall Score Calculation
  │   └─ (Climate × 0.5) + (Soil × 0.5) = Overall Score (0-100)
  │
  ├─→ Risk Level Determination
  │   ├─ If score ≥ 70 → LOW risk
  │   ├─ If score 50-69 → MODERATE risk
  │   └─ If score < 50 → HIGH risk
  │
  ├─→ Plan Component Generation
  │   │
  │   ├─→ Irrigation Plan
  │   │   ├─ Frequency (Daily/Every2Days/Weekly)
  │   │   ├─ Water Amount (L/acre)
  │   │   ├─ Method (Drip/Sprinkler/Flood)
  │   │   └─ Best Time (Morning/Evening)
  │   │
  │   ├─→ Fertilizer Plan
  │   │   ├─ Check N deficiency
  │   │   ├─ Check P deficiency
  │   │   ├─ Check K deficiency
  │   │   ├─ Calculate dosage per acre
  │   │   └─ Generate application schedule
  │   │
  │   ├─→ Disease Prevention Plan
  │   │   ├─ If humidity > 75% → Fungal prevention
  │   │   ├─ If temp > 32°C & rainfall < 30mm → Drought management
  │   │   ├─ If soil moisture > 80% → Root rot prevention
  │   │   └─ Add disease-specific measures
  │   │
  │   ├─→ Yield Estimation
  │   │   ├─ Base yield = Crop potential
  │   │   ├─ Multiply by climate suitability factor
  │   │   ├─ Multiply by soil suitability factor
  │   │   ├─ Adjust for disease risk
  │   │   └─ Calculate confidence level
  │   │
  │   └─→ Smart Tips Generation
  │       ├─ Crop-specific tips
  │       ├─ Climate-specific tips
  │       └─ Soil-specific tips
  │
  ├─→ Plan Object Creation
  │   └─ Combine all components into structured plan
  │
  ├─→ Storage
  │   ├─ Save to localStorage
  │   ├─ Add timestamp
  │   └─ Add user ID
  │
  ├─→ Display
  │   ├─ Show plan details
  │   ├─ Display risk indicators
  │   ├─ Show plan history
  │   └─ Enable plan comparison
  │
  └─→ END
```

---

## 3. Suitability Score Calculation Flow

```
Climate Data (Temperature, Rainfall, Humidity)
  │
  ├─→ Temperature Suitability
  │   ├─ Get optimal range from crop profile
  │   ├─ Compare current temp with range
  │   ├─ Calculate distance from optimal
  │   └─ Convert to 0-100 score
  │
  ├─→ Rainfall Suitability
  │   ├─ Get optimal range from crop profile
  │   ├─ Compare current rainfall with range
  │   ├─ Calculate distance from optimal
  │   └─ Convert to 0-100 score
  │
  ├─→ Humidity Suitability
  │   ├─ Get optimal range from crop profile
  │   ├─ Compare current humidity with range
  │   ├─ Calculate distance from optimal
  │   └─ Convert to 0-100 score
  │
  └─→ Climate Suitability = Average of all three scores
      │
      └─→ Soil Data (pH, Moisture)
          │
          ├─→ pH Suitability
          │   ├─ Get optimal range from crop profile
          │   ├─ Compare current pH with range
          │   ├─ Calculate distance from optimal
          │   └─ Convert to 0-100 score
          │
          ├─→ Moisture Suitability
          │   ├─ Get optimal range from crop profile
          │   ├─ Compare current moisture with range
          │   ├─ Calculate distance from optimal
          │   └─ Convert to 0-100 score
          │
          └─→ Soil Suitability = Average of both scores
              │
              └─→ Overall Suitability = (Climate × 0.5) + (Soil × 0.5)
                  │
                  └─→ Final Score (0-100)
```

---

## 4. Risk Level Decision Tree

```
                    Overall Suitability Score
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                  ≥ 70      50-69      < 50
                    │         │         │
                    ▼         ▼         ▼
                  LOW      MODERATE    HIGH
                  RISK       RISK      RISK
                    │         │         │
                    ▼         ▼         ▼
                  GREEN     YELLOW      RED
                    │         │         │
                    ▼         ▼         ▼
              Proceed with  Implement  Consider
              plan as is    mitigation alternatives
                            measures
```

---

## 5. Fertilizer Recommendation Logic

```
Soil Nutrient Analysis
  │
  ├─→ Nitrogen (N) Check
  │   ├─ If N < (Optimal × 0.7)
  │   │  └─ Deficiency detected
  │   │     ├─ Calculate needed amount = (Optimal - Current) × Land Size
  │   │     └─ Add to recommendations
  │   │
  │   └─ Else
  │      └─ Apply maintenance dose = Optimal × 0.3 × Land Size
  │
  ├─→ Phosphorus (P) Check
  │   ├─ If P < (Optimal × 0.7)
  │   │  └─ Deficiency detected
  │   │     ├─ Calculate needed amount = (Optimal - Current) × Land Size
  │   │     └─ Add to recommendations
  │   │
  │   └─ Else
  │      └─ Apply maintenance dose = Optimal × 0.3 × Land Size
  │
  ├─→ Potassium (K) Check
  │   ├─ If K < (Optimal × 0.7)
  │   │  └─ Deficiency detected
  │   │     ├─ Calculate needed amount = (Optimal - Current) × Land Size
  │   │     └─ Add to recommendations
  │   │
  │   └─ Else
  │      └─ Apply maintenance dose = Optimal × 0.3 × Land Size
  │
  └─→ Final Fertilizer Plan
      ├─ N: XXX kg
      ├─ P: XXX kg
      ├─ K: XXX kg
      ├─ Notes: Deficiencies detected
      └─ Schedule: 3 splits (50%, 25%, 25%)
```

---

## 6. Disease Prevention Decision Tree

```
Climate & Soil Analysis
  │
  ├─→ Humidity Check
  │   ├─ If humidity > 75%
  │   │  └─ HIGH FUNGAL RISK
  │   │     ├─ Add: "Use Mancozeb or Carbendazim spray"
  │   │     └─ Add: "Ensure proper field drainage"
  │   │
  │   └─ Else
  │      └─ Normal fungal risk
  │
  ├─→ Temperature & Rainfall Check
  │   ├─ If temp > 32°C AND rainfall < 30mm
  │   │  └─ DROUGHT STRESS RISK
  │   │     ├─ Add: "Increase irrigation frequency"
  │   │     └─ Add: "Apply mulch to retain moisture"
  │   │
  │   └─ Else
  │      └─ Normal drought risk
  │
  ├─→ Soil Moisture Check
  │   ├─ If moisture > 80%
  │   │  └─ ROOT ROT RISK
  │   │     ├─ Add: "Improve drainage"
  │   │     └─ Add: "Avoid waterlogging"
  │   │
  │   └─ Else
  │      └─ Normal root rot risk
  │
  └─→ Final Disease Prevention Plan
      ├─ Measure 1: ...
      ├─ Measure 2: ...
      ├─ Measure 3: ...
      └─ Measure N: ...
```

---

## 7. Yield Estimation Formula

```
Expected Yield Calculation
  │
  ├─→ Base Yield = Crop Yield Potential
  │   (e.g., Rice = 65 quintals/acre)
  │
  ├─→ Climate Impact Factor
  │   └─ = Climate Suitability Score / 100
  │
  ├─→ Soil Impact Factor
  │   └─ = Soil Suitability Score / 100
  │
  ├─→ Disease Impact Factor
  │   ├─ If risk = HIGH → 0.70
  │   ├─ If risk = MODERATE → 0.85
  │   └─ If risk = LOW → 1.00
  │
  ├─→ Yield Multiplier
  │   └─ = Climate Factor × Soil Factor × Disease Factor
  │
  ├─→ Expected Yield
  │   └─ = Base Yield × Yield Multiplier
  │
  └─→ Confidence Level
      └─ = (Climate Score + Soil Score) / 2 / 100
```

---

## 8. Data Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│              Smart Crop Plan System                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Climate Monitoring Module                           │   │
│  │  ├─ Provides: Temperature, Rainfall, Humidity       │   │
│  │  ├─ Updates: Hourly                                 │   │
│  │  └─ Used for: Climate Suitability Calculation       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Smart Crop Plan Service                             │   │
│  │  ├─ Calculates: Suitability Scores                   │   │
│  │  ├─ Generates: Recommendations                       │   │
│  │  └─ Produces: Farming Plan                           │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↑                    ↑                    ↑         │
│           │                    │                    │         │
│  ┌────────┴──────┐  ┌─────────┴──────┐  ┌────────┴──────┐  │
│  │ Soil Analysis │  │ Disease        │  │ Irrigation    │  │
│  │ Module        │  │ Detection      │  │ Planning      │  │
│  │               │  │ Module         │  │ Module        │  │
│  │ Provides:     │  │                │  │               │  │
│  │ - N, P, K     │  │ Provides:      │  │ Provides:     │  │
│  │ - pH          │  │ - Risk Levels  │  │ - Frequency   │  │
│  │ - Moisture    │  │ - Disease Type │  │ - Water Amt   │  │
│  │ - Org Carbon  │  │ - Measures     │  │ - Method      │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  SellerDashboard                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Navigation Bar                                      │   │
│  │  ├─ 🌦️ Climate                                      │   │
│  │  ├─ 🌱 Soil                                         │   │
│  │  ├─ 💧 Irrigation                                   │   │
│  │  ├─ 🌾 Smart Plan ← NEW                             │   │
│  │  └─ ...                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SmartCropPlanDashboard                              │   │
│  │  ├─ Input Section                                    │   │
│  │  │  ├─ Crop Dropdown                                 │   │
│  │  │  ├─ Land Size Input                               │   │
│  │  │  └─ Generate Button                               │   │
│  │  │                                                    │   │
│  │  ├─ Plan Display Section                             │   │
│  │  │  ├─ Suitability Cards                             │   │
│  │  │  ├─ Irrigation Details                            │   │
│  │  │  ├─ Fertilizer Plan                               │   │
│  │  │  ├─ Disease Prevention                            │   │
│  │  │  ├─ Yield Estimation                              │   │
│  │  │  └─ Smart Tips                                    │   │
│  │  │                                                    │   │
│  │  └─ History Section                                  │   │
│  │     └─ Plan History Table                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  smartFarmingPlanService                             │   │
│  │  ├─ generateSmartFarmingPlan()                        │   │
│  │  ├─ calculateClimateSuitability()                     │   │
│  │  ├─ calculateSoilSuitability()                        │   │
│  │  ├─ generateFertilizerPlan()                          │   │
│  │  ├─ generateDiseasePrevention()                       │   │
│  │  ├─ estimateYield()                                   │   │
│  │  ├─ generateSmartTips()                               │   │
│  │  └─ checkPlanExists()                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Storage                                        │   │
│  │  ├─ localStorage (farmingPlans)                       │   │
│  │  └─ data.json (crop_farming_plans)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. State Management Flow

```
SmartCropPlanDashboard State
  │
  ├─→ selectedCrop: "Rice"
  │   └─ Updated by: Crop dropdown onChange
  │
  ├─→ landSize: 2.5
  │   └─ Updated by: Land size input onChange
  │
  ├─→ plan: null | { ...planObject }
  │   └─ Updated by: handleGeneratePlan()
  │
  ├─→ plans: []
  │   ├─ Loaded from: localStorage on mount
  │   └─ Updated by: handleGeneratePlan() (prepend new plan)
  │
  ├─→ loading: false | true
  │   ├─ Set to true: When generating plan
  │   └─ Set to false: When generation complete
  │
  └─→ error: null | "error message"
      ├─ Set on: Duplicate plan or generation error
      └─ Cleared on: New generation attempt
```

---

## 11. Error Handling Flow

```
Plan Generation Request
  │
  ├─→ Validation Check
  │   ├─ If crop not supported
  │   │  └─ Error: "Invalid crop type"
  │   │
  │   ├─ If land size invalid
  │   │  └─ Error: "Invalid land size"
  │   │
  │   └─ If user not authenticated
  │      └─ Error: "Please login first"
  │
  ├─→ Duplicate Check
  │   ├─ If plan exists for today
  │   │  └─ Error: "Plan already generated for this crop today"
  │   │
  │   └─ Else
  │      └─ Continue
  │
  ├─→ Data Fetching
  │   ├─ If climate data missing
  │   │  └─ Use mock data
  │   │
  │   ├─ If soil data missing
  │   │  └─ Use mock data
  │   │
  │   └─ If disease data missing
  │      └─ Use empty array
  │
  ├─→ Calculation
  │   ├─ If calculation fails
  │   │  └─ Error: "Plan generation failed"
  │   │
  │   └─ Else
  │      └─ Success
  │
  └─→ Display Error or Plan
```

---

## 12. Performance Optimization Flow

```
Plan Generation Performance
  │
  ├─→ Input Validation: < 5ms
  │   └─ Check crop, land size, user
  │
  ├─→ Duplicate Check: < 10ms
  │   └─ Search localStorage array
  │
  ├─→ Data Fetching: < 20ms
  │   └─ Get climate, soil, disease data
  │
  ├─→ Suitability Calculation: < 30ms
  │   ├─ Climate suitability: < 15ms
  │   └─ Soil suitability: < 15ms
  │
  ├─→ Plan Component Generation: < 25ms
  │   ├─ Irrigation plan: < 5ms
  │   ├─ Fertilizer plan: < 5ms
  │   ├─ Disease prevention: < 5ms
  │   ├─ Yield estimation: < 5ms
  │   └─ Smart tips: < 5ms
  │
  ├─→ Storage: < 10ms
  │   └─ Save to localStorage
  │
  └─→ Total Time: < 100ms
      └─ User perceives as instant
```

---

**Version**: 1.0
**Last Updated**: 2026-02-27
**Status**: Complete

# Climate Prediction & Risk Alert System - Setup Guide

## ✅ Installation Complete

All files have been added to your AgroConnect frontend. Here's what was added:

### 📁 New Files Created:

1. **`frontend/src/services/climateService.js`**
   - Climate analysis logic
   - API calls for climate data, alerts, and notifications
   - Risk detection algorithm

2. **`frontend/src/component/ClimateDashboard.jsx`**
   - Main UI component for climate dashboard
   - Form to record climate data
   - Displays climate trends and risk alerts

3. **`frontend/src/component/ClimateDashboard.css`**
   - Styling for climate dashboard

4. **`frontend/src/component/NotificationBadge.jsx`**
   - Optional notification counter component

### 📝 Modified Files:

1. **`frontend/Data/data.json`**
   - Added `climateData` collection
   - Added `climateAlerts` collection
   - Added `notifications` collection

2. **`frontend/src/App.jsx`**
   - Added `/climate` route

3. **`frontend/src/component/SellerDashboard.jsx`**
   - Added "🌦️ Climate Alert" button in navigation

---

## 🚀 Quick Start

### Step 1: Start JSON Server
```bash
cd AgroConnect/frontend
npx json-server --watch Data/data.json --port 3000
```

### Step 2: Start Frontend (in another terminal)
```bash
cd AgroConnect/frontend
npm run dev
```

### Step 3: Test the Feature
1. Login as a seller (e.g., dhara / 123456)
2. Click "🌦️ Climate Alert" button in the dashboard
3. Add climate data (temperature, rainfall, humidity)
4. System will analyze and show risk level

---

## 📊 How It Works

### Risk Detection Logic:
- **Temperature increases ≥ 3°C** → MODERATE risk
- **Rainfall decreases ≥ 30%** → MODERATE/HIGH risk
- **Humidity drops ≥ 15%** → HIGH risk

### Risk Levels:
- 🟢 **LOW** - Conditions are stable
- 🟡 **MODERATE** - Monitor crop health
- 🔴 **HIGH** - Immediate action needed

---

## ⚙️ Configuration

To adjust thresholds, edit `frontend/src/services/climateService.js`:

```javascript
const THRESHOLDS = {
  TEMP_INCREASE: 3,        // Change to 5 for less sensitivity
  RAINFALL_DECREASE: 30,   // Change to 40 for less sensitivity
  HUMIDITY_DECREASE: 15,   // Change to 20 for less sensitivity
};
```

---

## 🧪 Test Data

Sample climate data is already in `data.json`:
- **Location:** Tiruppur
- **Month 1:** 28°C, 45mm rainfall, 65% humidity
- **Month 2:** 32°C, 20mm rainfall, 50% humidity
- **Alert:** MODERATE risk (temp +4°C, rainfall -55%)

---

## 📱 Features

✅ Record monthly climate data  
✅ Automatic risk analysis  
✅ Alert generation for worsening conditions  
✅ Notification system  
✅ Visual trend display (last 3 months)  
✅ Access control (sellers only)  
✅ Configurable thresholds  

---

## 🔐 Access Control

- **Only sellers/farmers** can access the climate dashboard
- **Buyers** will see "Access Denied" message
- Data is location-based (uses user's address)

---

## 📞 Support

If you encounter any issues:
1. Ensure JSON Server is running on port 3000
2. Check browser console for errors
3. Verify user is logged in as a seller
4. Check that user has an address field

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email/SMS Alerts** - Integrate Twilio or SendGrid
2. **Advanced Charts** - Add recharts or chart.js
3. **Weather API** - Auto-fetch data from OpenWeatherMap
4. **Admin Dashboard** - View all locations' climate data
5. **Historical Reports** - Generate PDF reports

---

**Feature is production-ready!** 🚀

# EV Charging Demand Forecast Dashboard - React Version

This is a React-based conversion of your original Streamlit EV charging dashboard with all the same functionality.

## 🚀 Features

- **Real-time Forecasting**: Uses Prophet ML model for demand prediction
- **Overload Analysis**: Identifies stations requiring capacity expansion
- **Solar Integration**: Finds stations suitable for solar-powered charging
- **What-If Simulator**: Test different capacity and demand scenarios
- **Interactive Maps**: Visual representation of station locations
- **Beautiful UI**: Modern Material-UI design with responsive layout

## 📋 Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- npm or yarn

## 🛠️ Setup Instructions

### 1. Install Python Dependencies (Backend)

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install React Dependencies (Frontend)

```bash
npm install
```

### 3. Start the Backend API

```bash
cd backend
python app.py
```

The Flask API will run on `http://localhost:5000`

### 4. Start the React Frontend

```bash
npm start
```

The React app will run on `http://localhost:3000`

## 🏗️ Architecture

### Backend (Flask API)
- **simulate_ev_data.py**: Generates simulated EV charging data
- **app.py**: Flask REST API with all forecasting endpoints
- **Endpoints**:
  - `/api/stations` - Get all stations
  - `/api/forecast` - Get demand forecast
  - `/api/overload-analysis` - Station capacity analysis
  - `/api/solar-analysis` - Solar-suitable stations
  - `/api/what-if-simulation` - Capacity simulation
  - `/api/top-stations` - Top stations by usage

### Frontend (React + TypeScript)
- **EVDashboard**: Main dashboard component
- **StationFilters**: Station/vehicle/date selection
- **ForecastChart**: Interactive demand visualization
- **OverloadAnalysis**: Capacity warnings and recommendations
- **SolarAnalysis**: Solar integration opportunities
- **WhatIfSimulator**: Interactive scenario testing
- **TopStationsTable**: Rankings by predicted usage

## 📊 Components Overview

1. **Main Dashboard**: Central hub with all functionality
2. **Filters Panel**: Select station, vehicle type, and date
3. **Forecast Chart**: 24-hour demand prediction with confidence intervals
4. **Overload Analysis**: Shows stations exceeding capacity (cars/scooters)
5. **Solar Analysis**: Lists stations suitable for solar charging
6. **Station Map**: Geographic view of all stations
7. **Top Stations**: Rankings by predicted peak demand
8. **What-If Simulator**: Test infrastructure changes

## 🎨 Design Features

- **Material-UI**: Modern, professional design system
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Charts**: Recharts for beautiful visualizations
- **Real-time Updates**: Automatic data refresh on filter changes
- **Loading States**: Smooth user experience with progress indicators
- **Error Handling**: Graceful error messages and fallbacks

## 🔧 Customization

### Adding New Stations
Edit `backend/simulate_ev_data.py` and add new station data to the `stations` array.

### Modifying Capacity Limits
Update `backend/app.py` and modify the `station_capacity` dictionary.

### Styling Changes
Update the theme in `src/App.tsx` or individual component styles.

## 📱 Usage

1. Select a station from the filters
2. Choose vehicle type (car/scooter)
3. Pick a date for analysis
4. View real-time forecasts and recommendations
5. Use the What-If Simulator to test scenarios
6. Check overload warnings and solar opportunities

## 🤝 Deployment

### Frontend
```bash
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend
Deploy the Flask app to your preferred cloud service (AWS, Azure, Heroku, etc.)

## 📈 Data Flow

1. Frontend makes API calls to Flask backend
2. Backend generates/processes EV data using simulate_ev_data.py
3. Prophet model creates forecasts
4. Results are formatted and sent back to frontend
5. React components render the data with interactive visualizations

## 🆚 Differences from Streamlit Version

- **Better Performance**: React provides smoother interactions
- **Modern UI**: Material-UI design system
- **Mobile Responsive**: Works great on all devices
- **Extensible**: Easy to add new features and components
- **Production Ready**: Can be easily deployed to cloud services

This React version maintains all the functionality of your original Streamlit app while providing a more professional and scalable user interface.

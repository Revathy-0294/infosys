import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ElectricCar as ElectricCarIcon,
  TwoWheeler as TwoWheelerIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StationFilters from './StationFilters';
import ForecastChart from './ForecastChart';
import OverloadAnalysis from './OverloadAnalysis';
import SolarAnalysis from './SolarAnalysis';
import StationMap from './StationMap';
import TopStationsTable from './TopStationsTable';
import WhatIfSimulator from './WhatIfSimulator';
import { apiService } from '../services/apiService';

interface Station {
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

interface ForecastData {
  station_name: string;
  vehicle_type: string;
  date: string;
  forecast: Array<{
    ds: string;
    yhat: number;
    yhat_lower: number;
    yhat_upper: number;
  }>;
}

const EVDashboard: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('car');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      loadForecast();
    }
  }, [selectedStation, selectedVehicleType, selectedDate]);

  const loadStations = async () => {
    try {
      const stationsData = await apiService.getStations();
      setStations(stationsData);
      if (stationsData.length > 0) {
        setSelectedStation(stationsData[0].station_name);
      }
    } catch (err) {
      setError('Failed to load stations');
    }
  };

  const loadForecast = async () => {
    if (!selectedStation) return;
    
    setLoading(true);
    setError('');
    
    try {
      const forecast = await apiService.getForecast(
        selectedStation,
        selectedVehicleType,
        selectedDate
      );
      setForecastData(forecast);
    } catch (err) {
      setError('Failed to load forecast data');
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (station: string) => {
    setSelectedStation(station);
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    setSelectedVehicleType(vehicleType);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Toolbar>
          <Box sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50%',
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ElectricCarIcon sx={{ color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            EV Charging Demand Forecast Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Filters */}
        <StationFilters
          stations={stations}
          selectedStation={selectedStation}
          selectedVehicleType={selectedVehicleType}
          selectedDate={selectedDate}
          onStationChange={handleStationChange}
          onVehicleTypeChange={handleVehicleTypeChange}
          onDateChange={handleDateChange}
        />

        {loading && (
          <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <LinearProgress 
              sx={{ 
                height: 6,
                background: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #667eea, #764ba2)'
                }
              }} 
            />
          </Box>
        )}

        {/* Main Content Layout */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top Row - Forecast Chart and Top Stations */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 3 
          }}>
            {/* Main Forecast Chart */}
            <Box sx={{ flex: { lg: 2 } }}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 600
                    }}
                  >
                    <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Forecasted Demand for {selectedStation} ({selectedVehicleType}) on {selectedDate}
                  </Typography>
                  {forecastData && (
                    <ForecastChart 
                      data={forecastData.forecast}
                      title={`${selectedStation} - ${selectedVehicleType}`}
                    />
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Top Stations */}
            <Box sx={{ flex: { lg: 1 } }}>
              <TopStationsTable 
                vehicleType={selectedVehicleType}
                date={selectedDate}
              />
            </Box>
          </Box>

          {/* Middle Row - Analysis Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Overload Analysis */}
            <Box sx={{ flex: 1 }}>
              <OverloadAnalysis date={selectedDate} />
            </Box>

            {/* Solar Analysis */}
            <Box sx={{ flex: 1 }}>
              <SolarAnalysis date={selectedDate} />
            </Box>
          </Box>

          {/* Station Map */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}
              >
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Station Map
              </Typography>
              <StationMap 
                stations={stations}
                selectedStation={selectedStation}
                vehicleType={selectedVehicleType}
              />
            </CardContent>
          </Card>

          {/* What-If Simulator */}
          <WhatIfSimulator 
            stations={stations}
            selectedDate={selectedDate}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default EVDashboard;

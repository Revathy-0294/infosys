import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { apiService } from '../services/apiService';

interface Station {
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

interface WhatIfSimulationResult {
  station_name: string;
  vehicle_type: string;
  adjusted_peak_demand: number;
  new_capacity: number;
  overload_status: string;
  queue_time_hours: number;
  recommendation: string;
  unmet_demand: number;
}

interface WhatIfSimulatorProps {
  stations: Station[];
  selectedDate: string;
}

const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ stations, selectedDate }) => {
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('car');
  const [ports, setPorts] = useState<number>(20);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [sessionTime, setSessionTime] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (stations.length > 0) {
      setSelectedStation(stations[0].station_name);
    }
  }, [stations]);

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    try {
      const simResult = await apiService.getWhatIfSimulation(
        selectedStation,
        selectedVehicleType,
        ports,
        multiplier,
        sessionTime,
        selectedDate
      );
      setResult(simResult);
    } catch (err) {
      setError('Failed to perform what-if simulation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            fontWeight: 600,
            mb: 3
          }}
        >
          🔁 What-If Simulator: Station Capacity & Demand Analysis
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#667eea' }}>Station</InputLabel>
            <Select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              {stations.map((station) => (
                <MenuItem key={station.station_id} value={station.station_name}>
                  {station.station_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#667eea' }}>Vehicle Type</InputLabel>
            <Select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="car">Car</MenuItem>
              <MenuItem value="scooter">Scooter</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            type="number"
            label="Number of Ports"
            value={ports}
            onChange={(e) => setPorts(parseInt(e.target.value, 10))}
            InputLabelProps={{ sx: { color: '#667eea' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
          
          <TextField
            fullWidth
            type="number"
            label="Demand Multiplier"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            InputLabelProps={{ sx: { color: '#667eea' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
          
          <TextField
            fullWidth
            type="number"
            label="Session Time (mins)"
            value={sessionTime}
            onChange={(e) => setSessionTime(parseInt(e.target.value, 10))}
            InputLabelProps={{ sx: { color: '#667eea' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
          
          <Button
            variant="contained"
            fullWidth
            onClick={handleSimulate}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: 2,
              height: 56,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.3)',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Simulate'}
          </Button>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {error}
          </Alert>
        )}
        
        {result && !loading && (
          <Box sx={{ 
            mt: 3,
            p: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                mb: 2
              }}
            >
              Simulation Results
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2
            }}>
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Station
                </Typography>
                <Typography variant="body2">{result.station_name}</Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Vehicle Type
                </Typography>
                <Typography variant="body2">{result.vehicle_type}</Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Adjusted Peak Demand
                </Typography>
                <Typography variant="body2">{result.adjusted_peak_demand.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  New Capacity
                </Typography>
                <Typography variant="body2">{result.new_capacity}</Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Overload Status
                </Typography>
                <Typography variant="body2">{result.overload_status}</Typography>
              </Box>
              
              <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Queue Time (hrs)
                </Typography>
                <Typography variant="body2">{result.queue_time_hours.toFixed(2)}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 255, 255, 0.8)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea', mb: 1 }}>
                Recommendation
              </Typography>
              <Typography variant="body2">{result.recommendation}</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatIfSimulator;


import React from 'react';
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { TuneOutlined as FilterIcon } from '@mui/icons-material';

interface Station {
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

interface StationFiltersProps {
  stations: Station[];
  selectedStation: string;
  selectedVehicleType: string;
  selectedDate: string;
  onStationChange: (station: string) => void;
  onVehicleTypeChange: (vehicleType: string) => void;
  onDateChange: (date: string) => void;
}

const StationFilters: React.FC<StationFiltersProps> = ({
  stations,
  selectedStation,
  selectedVehicleType,
  selectedDate,
  onStationChange,
  onVehicleTypeChange,
  onDateChange,
}) => {
  return (
    <Card sx={{ 
      mb: 3,
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: 2,
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <Box sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50%',
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FilterIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            Filters
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#667eea' }}>Station</InputLabel>
              <Select
                value={selectedStation}
                label="Station"
                onChange={(e) => onStationChange(e.target.value)}
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
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#667eea' }}>Vehicle Type</InputLabel>
              <Select
                value={selectedVehicleType}
                label="Vehicle Type"
                onChange={(e) => onVehicleTypeChange(e.target.value)}
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
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              InputLabelProps={{
                shrink: true,
                sx: { color: '#667eea' }
              }}
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
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StationFilters;

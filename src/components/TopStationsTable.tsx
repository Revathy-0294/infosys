import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  LinearProgress,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { apiService } from '../services/apiService';

interface TopStation {
  station_name: string;
  predicted_peak: number;
}

interface TopStationsTableProps {
  vehicleType: string;
  date: string;
}

const TopStationsTable: React.FC<TopStationsTableProps> = ({ vehicleType, date }) => {
  const [topStations, setTopStations] = useState<TopStation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopStations();
  }, [vehicleType, date]);

  const loadTopStations = async () => {
    setLoading(true);
    try {
      const stations = await apiService.getTopStations(date, vehicleType);
      setTopStations(stations);
    } catch (error) {
      console.error('Failed to load top stations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              fontWeight: 600
            }}
          >
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Top 5 Stations by Predicted Usage
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              sx={{ 
                height: 6,
                borderRadius: 3,
                background: 'rgba(102, 126, 234, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: 3
                }
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

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
          <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Top 5 Stations by Predicted Usage
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <TableContainer 
            component={Paper} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: '1px solid rgba(102, 126, 234, 0.2)',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#667eea',
                    borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#667eea',
                    borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    Station Name
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 600, 
                    color: '#667eea',
                    borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
                  }}>
                    Peak Demand
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topStations.map((station, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        transform: 'scale(1.01)',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: index < 3 
                          ? 'linear-gradient(45deg, #667eea, #764ba2)'
                          : 'rgba(102, 126, 234, 0.1)',
                        color: index < 3 ? 'white' : '#667eea',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        #{index + 1}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {station.station_name}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 600,
                      color: '#667eea',
                      fontFamily: 'monospace'
                    }}>
                      {Math.round(station.predicted_peak * 100) / 100}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopStationsTable;

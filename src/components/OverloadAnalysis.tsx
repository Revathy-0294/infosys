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
  Alert,
  Chip,
  Box,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as ScooterIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

interface OverloadSuggestion {
  station_id: number;
  station_name: string;
  vehicle_type: string;
  forecasted_peak: number;
  capacity: number;
  unmet_demand: number;
  recommendation: string;
}

interface OverloadAnalysisData {
  car_analysis: {
    suggestions: OverloadSuggestion[];
    message: string;
  };
  scooter_analysis: {
    suggestions: OverloadSuggestion[];
    message: string;
  };
}

interface OverloadAnalysisProps {
  date: string;
}

const OverloadAnalysis: React.FC<OverloadAnalysisProps> = ({ date }) => {
  const [data, setData] = useState<OverloadAnalysisData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOverloadAnalysis();
  }, [date]);

  const loadOverloadAnalysis = async () => {
    setLoading(true);
    try {
      const analysisData = await apiService.getOverloadAnalysis(date);
      setData(analysisData);
    } catch (error) {
      console.error('Failed to load overload analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Add')) {
      return 'error';
    }
    return 'success';
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('Add')) {
      return <WarningIcon fontSize="small" />;
    }
    return <CheckIcon fontSize="small" />;
  };

  const renderAnalysisTable = (suggestions: OverloadSuggestion[]) => (
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
              Station
            </TableCell>
            <TableCell align="right" sx={{ 
              fontWeight: 600, 
              color: '#667eea',
              borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
            }}>
              Peak Demand
            </TableCell>
            <TableCell align="right" sx={{ 
              fontWeight: 600, 
              color: '#667eea',
              borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
            }}>
              Capacity
            </TableCell>
            <TableCell align="right" sx={{ 
              fontWeight: 600, 
              color: '#667eea',
              borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
            }}>
              Unmet Demand
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 600, 
              color: '#667eea',
              borderBottom: '2px solid rgba(102, 126, 234, 0.3)'
            }}>
              Recommendation
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suggestions.map((suggestion, index) => (
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
              <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                {suggestion.station_name}
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                color: '#667eea',
                fontFamily: 'monospace'
              }}>
                {Math.round(suggestion.forecasted_peak * 100) / 100}
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                fontFamily: 'monospace'
              }}>
                {suggestion.capacity}
              </TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 600,
                color: suggestion.unmet_demand > 0 ? '#f44336' : '#4caf50',
                fontFamily: 'monospace'
              }}>
                {Math.max(0, Math.round(suggestion.unmet_demand * 100) / 100)}
              </TableCell>
              <TableCell>
                <Chip
                  label={suggestion.recommendation}
                  color={getRecommendationColor(suggestion.recommendation)}
                  variant="outlined"
                  size="small"
                  icon={getRecommendationIcon(suggestion.recommendation)}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderWidth: 2,
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Overload Analysis
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
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Overload Analysis
        </Typography>

        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(102, 126, 234, 0.2)', 
          mb: 3 
        }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            aria-label="vehicle type tabs"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(102, 126, 234, 0.7)',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#667eea',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                height: 3
              }
            }}
          >
            <Tab
              label="Cars"
              icon={<CarIcon />}
              iconPosition="start"
            />
            <Tab
              label="Scooters"
              icon={<ScooterIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {data && (
          <>
            {tabValue === 0 && (
              <>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#667eea'
                    }
                  }}
                >
                  {data.car_analysis.message}
                </Alert>
                {renderAnalysisTable(data.car_analysis.suggestions)}
              </>
            )}
            {tabValue === 1 && (
              <>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#667eea'
                    }
                  }}
                >
                  {data.scooter_analysis.message}
                </Alert>
                {renderAnalysisTable(data.scooter_analysis.suggestions)}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OverloadAnalysis;

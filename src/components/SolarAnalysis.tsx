import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Chip,
  Box,
  LinearProgress,
} from '@mui/material';
import { WbSunny as SolarIcon } from '@mui/icons-material';
import { apiService } from '../services/apiService';

interface SolarCandidate {
  station_id: number;
  station_name: string;
  vehicle_type: string;
  avg_daytime_demand: number;
  solar_candidate: string;
}

interface SolarAnalysisProps {
  date: string;
}

const SolarAnalysis: React.FC<SolarAnalysisProps> = ({ date }) => {
  const [candidates, setCandidates] = useState<SolarCandidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSolarAnalysis();
  }, [date]);

  const loadSolarAnalysis = async () => {
    setLoading(true);
    try {
      const analysisData = await apiService.getSolarAnalysis(date);
      setCandidates(analysisData);
    } catch (error) {
      console.error('Failed to load solar analysis:', error);
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
            <SolarIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Solar-Suitable Stations
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
          <SolarIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Solar-Suitable Stations
        </Typography>
        
        {candidates.length > 0 ? (
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(102, 126, 234, 0.1)',
            overflow: 'hidden'
          }}>
            <List sx={{ p: 0 }}>
              {candidates.map((candidate, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
                    }
                  }}>
                    <ListItemIcon>
                      <Box sx={{
                        background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
                        borderRadius: '50%',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SolarIcon sx={{ color: '#b8860b', fontSize: 20 }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ 
                          fontWeight: 600,
                          color: '#667eea'
                        }}>
                          {candidate.station_name}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          mt: 0.5
                        }}>
                          Type: {candidate.vehicle_type} • Avg. Daytime Demand: {Math.round(
                            candidate.avg_daytime_demand * 100
                          ) / 100}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={candidate.solar_candidate} 
                      color="success" 
                      size="small"
                      sx={{
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </ListItem>
                  {index < candidates.length - 1 && (
                    <Divider sx={{ 
                      borderColor: 'rgba(102, 126, 234, 0.1)',
                      mx: 2
                    }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Alert 
            severity="info"
            sx={{
              borderRadius: 2,
              background: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              '& .MuiAlert-icon': {
                color: '#667eea'
              }
            }}
          >
            No solar-suitable stations found for the selected date.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SolarAnalysis;


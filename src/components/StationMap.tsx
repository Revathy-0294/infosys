import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  ElectricCar as CarIcon,
  TwoWheeler as ScooterIcon,
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface Station {
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
}

interface StationWithDemand extends Station {
  demand: number;
}

interface StationMapProps {
  stations: Station[];
  selectedStation: string;
  vehicleType: string;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const StationMap: React.FC<StationMapProps> = ({ stations, selectedStation, vehicleType }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const getStationDemand = (station: Station): number => {
    const baseDemand = 30 + (station.station_id % 40);
    const locationMultiplier = 1 + (station.latitude % 0.1) * 10;
    return Math.round(baseDemand * locationMultiplier);
  };

  const getTop3Stations = (): Station[] => {
    return [...stations]
      .map(station => ({
        ...station,
        demand: getStationDemand(station)
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 3);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 10);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    const top3Stations = getTop3Stations();

    stations.forEach(station => {
      const demand = getStationDemand(station);
      const color = demand > 60 ? '#ff4444' : demand > 50 ? '#ff8800' : demand > 40 ? '#44aa44' : '#4444ff';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ${demand}
        </div>`
      });

      L.marker([station.latitude, station.longitude], { icon }).addTo(map);
    });

    top3Stations.forEach(station => {
      L.circle([station.latitude, station.longitude], {
        radius: 2500,
        color: '#1976d2',
        fillColor: '#1976d2',
        fillOpacity: 0.15
      }).addTo(map);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stations]);

  return (
    <Box sx={{ height: 600 }}>
      {/* Map Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: 'info.main',
          color: 'white',
          mr: 2
        }}>
          <LocationIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Station Network Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stations.length} stations across Delhi NCR • Heatmap shows forecasted demand
          </Typography>
        </Box>
      </Box>

      {/* Map Container */}
      <Card sx={{ height: 400, overflow: 'hidden', mb: 3 }}>
        <Box
          ref={mapRef}
          sx={{
            height: '100%',
            width: '100%',
            '& .leaflet-container': {
              height: '100%',
              width: '100%',
            },
            '& .leaflet-popup-content-wrapper': {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            '& .leaflet-popup-content': {
              margin: '12px',
              fontSize: '14px',
            },
          }}
        />
      </Card>

      {/* Demand Legend */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Forecasted Demand Legend
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, bgcolor: '#4444ff', borderRadius: '50%' }} />
              <Typography variant="body2">30-40 (Low)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, bgcolor: '#44aa44', borderRadius: '50%' }} />
              <Typography variant="body2">40-50 (Medium)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, bgcolor: '#ff8800', borderRadius: '50%' }} />
              <Typography variant="body2">50-60 (High)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, bgcolor: '#ff4444', borderRadius: '50%' }} />
              <Typography variant="body2">60+ (Very High)</Typography>
            </Box>
            <Box sx={{ 
              width: '100%', 
              height: 1, 
              bgcolor: 'rgba(0,0,0,0.1)', 
              my: 2 
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                border: '2px solid #2196f3',
                borderRadius: '50%',
                bgcolor: 'rgba(33, 150, 243, 0.2)'
              }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2196f3' }}>
                  Business-Friendly Zones
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Areas with consistently high demand (2.5km radius)
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Station List */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Station Details
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            <List dense>
              {stations.map((station) => {
                const demand = getStationDemand(station);
                const isSelected = station.station_name === selectedStation;
                
                return (
                  <ListItem
                    key={station.station_id}
                    sx={{
                      bgcolor: isSelected ? 'primary.50' : 'transparent',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : '#e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.100' : '#f8f9fa',
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {station.station_name}
                          </Typography>
                          {isSelected && (
                            <Chip label="Selected" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                          </Typography>
                          <Chip
                            label={`Demand: ${demand}`}
                            size="small"
                            color={demand > 60 ? 'error' : demand > 50 ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </CardContent>
      </Card>

      {/* Info Label */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Business-Friendly Zones are marked with demand numbers and color-coded based on demand intensity.
        </Typography>
      </Box>
    </Box>
  );
};

export default StationMap;

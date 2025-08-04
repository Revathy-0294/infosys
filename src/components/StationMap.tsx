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
  const heatmapLayerRef = useRef<any>(null);

  const getVehicleIcon = (type: string) => {
    return type === 'car' ? <CarIcon /> : <ScooterIcon />;
  };

  const getStationDemand = (station: Station) => {
    // Simulate demand based on station ID and location
    const baseDemand = 30 + (station.station_id % 40); // 30-70 range
    const locationMultiplier = 1 + (station.latitude % 0.1) * 10; // Vary by location
    return Math.round(baseDemand * locationMultiplier);
  };

  const createCustomIcon = (isSelected: boolean, demand: number) => {
    const size = isSelected ? 32 : 24;
    const color = demand > 60 ? '#ff4444' : demand > 50 ? '#ff8800' : demand > 40 ? '#44aa44' : '#4444ff';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid ${isSelected ? '#3f51b5' : 'white'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '14px' : '12px'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${isSelected ? '★' : demand}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Ensure the container is properly mounted
    setTimeout(() => {
      if (!mapRef.current) return;

      try {
        // Initialize map centered on Delhi NCR
        const map = L.map(mapRef.current).setView([28.6139, 77.2090], 10);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Create heatmap data
        const heatmapData = stations.map(station => {
          const demand = getStationDemand(station);
          return [station.latitude, station.longitude, demand];
        });

        // Add heatmap layer
        if (heatmapData.length > 0) {
          const heatmapLayer = (L as any).heatLayer(heatmapData, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: {
              0.2: '#4444ff',   // Low demand - Blue
              0.4: '#44aa44',   // Medium-Low - Green
              0.6: '#ff8800',   // Medium-High - Orange
              0.8: '#ff4444',   // High demand - Red
              1.0: '#ff0000'    // Very High - Bright Red
            }
          }).addTo(map);
          heatmapLayerRef.current = heatmapLayer;
        }

        // Add station markers
        stations.forEach(station => {
          const demand = getStationDemand(station);
          const isSelected = station.station_name === selectedStation;
          const icon = createCustomIcon(isSelected, demand);

          const marker = L.marker([station.latitude, station.longitude], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #3f51b5;">${station.station_name}</h3>
                <p style="margin: 4px 0;"><strong>Demand:</strong> ${demand}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${isSelected ? 'Selected' : 'Active'}</p>
              </div>
            `);

          if (isSelected) {
            marker.openPopup();
          }
        });

        // Force map to invalidate size after initialization
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    try {
      // Update heatmap when stations change
      if (heatmapLayerRef.current) {
        const heatmapData = stations.map(station => {
          const demand = getStationDemand(station);
          return [station.latitude, station.longitude, demand];
        });
        
        if (heatmapData.length > 0) {
          heatmapLayerRef.current.setLatLngs(heatmapData);
        }
      }

      // Clear existing markers and add new ones
      const layersToRemove: L.Layer[] = [];
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layersToRemove.push(layer);
        }
      });
      
      layersToRemove.forEach(layer => {
        try {
          mapInstanceRef.current!.removeLayer(layer);
        } catch (error) {
          console.error('Error removing layer:', error);
        }
      });

      // Add updated station markers
      stations.forEach(station => {
        const demand = getStationDemand(station);
        const isSelected = station.station_name === selectedStation;
        const icon = createCustomIcon(isSelected, demand);

        try {
          const marker = L.marker([station.latitude, station.longitude], { icon })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #3f51b5;">${station.station_name}</h3>
                <p style="margin: 4px 0;"><strong>Demand:</strong> ${demand}</p>
                <p style="margin: 4px 0;"><strong>Location:</strong> ${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> ${isSelected ? 'Selected' : 'Active'}</p>
              </div>
            `);

          if (isSelected) {
            marker.openPopup();
          }
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      });

      // Force map to invalidate size after updates
      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (error) {
            console.error('Error invalidating map size:', error);
          }
        }
      }, 50);

    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [stations, selectedStation]);

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
    </Box>
  );
};

export default StationMap;

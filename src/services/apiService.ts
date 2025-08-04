import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  getStations: async () => {
    const response = await axios.get(`${API_BASE_URL}/stations`);
    return response.data;
  },
  getForecast: async (station: string, vehicleType: string, date: string) => {
    const response = await axios.get(`${API_BASE_URL}/forecast`, {
      params: { station, vehicle_type: vehicleType, date },
    });
    return response.data;
  },
  getOverloadAnalysis: async (date: string) => {
    const response = await axios.get(`${API_BASE_URL}/overload-analysis`, {
      params: { date },
    });
    return response.data;
  },
  getSolarAnalysis: async (date: string) => {
    const response = await axios.get(`${API_BASE_URL}/solar-analysis`, {
      params: { date },
    });
    return response.data;
  },
  getWhatIfSimulation: async (
    station_name: string,
    vehicle_type: string,
    ports: number,
    multiplier: number,
    session_time: number,
    date: string
  ) => {
    const response = await axios.get(`${API_BASE_URL}/what-if-simulation`, {
      params: {
        station_name,
        vehicle_type,
        ports,
        multiplier,
        session_time,
        date,
      },
    });
    return response.data;
  },
  getTopStations: async (date: string, vehicle_type: string) => {
    const response = await axios.get(`${API_BASE_URL}/top-stations`, {
      params: { date, vehicle_type },
    });
    return response.data;
  },
};

export { apiService };

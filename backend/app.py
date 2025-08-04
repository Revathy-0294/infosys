from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from prophet import Prophet
from simulate_ev_data import simulate_ev_data
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Station capacity dictionary
station_capacity = {
    "Connaught Place": {"car": 21, "scooter": 19},
    "Nehru Place": {"car": 20, "scooter": 18},
    "Rajouri Garden": {"car": 19, "scooter": 17},
    "Saket": {"car": 21, "scooter": 20},
    "Dwarka": {"car": 18, "scooter": 16},
    "Karol Bagh": {"car": 17, "scooter": 15},
    "Lajpat Nagar": {"car": 21, "scooter": 20},
    "Vasant Kunj": {"car": 16, "scooter": 15},
    "Preet Vihar": {"car": 15, "scooter": 15},
    "Rohini": {"car": 15, "scooter": 15},
}

@app.route('/api/ev-data')
def get_ev_data():
    """Get simulated EV data"""
    data = simulate_ev_data().to_dict(orient='records')
    return jsonify(data)

@app.route('/api/stations')
def get_stations():
    """Get all station information"""
    df = simulate_ev_data()
    stations = df.groupby(['station_id', 'station_name', 'latitude', 'longitude']).first().reset_index()
    return jsonify(stations[['station_id', 'station_name', 'latitude', 'longitude']].to_dict(orient='records'))

@app.route('/api/forecast')
def get_forecast():
    """Get forecast for specific station, vehicle type, and date"""
    station_name = request.args.get('station')
    vehicle_type = request.args.get('vehicle_type')
    date_str = request.args.get('date')
    
    if not all([station_name, vehicle_type, date_str]):
        return jsonify({'error': 'Missing required parameters'}), 400
    
    df = simulate_ev_data()
    selected_date = pd.to_datetime(date_str)
    train_start = selected_date - pd.Timedelta(days=7)
    train_end = selected_date - pd.Timedelta(days=1)
    
    # Filter training data
    train_mask = (pd.to_datetime(df["date"], format="%d-%m-%Y") >= train_start) & (pd.to_datetime(df["date"], format="%d-%m-%Y") <= train_end)
    station_mask = (df["station_name"] == station_name) & (df["vehicle_type"] == vehicle_type)
    train_df = df[train_mask & station_mask]
    
    if train_df.empty:
        return jsonify({'error': 'Not enough historical data'}), 400
    
    # Prepare time series for Prophet
    ts = train_df.groupby(["date", "hour", "latitude", "longitude"])["vehicles_charged"].sum().reset_index()
    ts["ds"] = pd.to_datetime(ts["date"], format="%d-%m-%Y") + pd.to_timedelta(ts["hour"], unit="h")
    ts = ts.rename(columns={"ds": "ds", "vehicles_charged": "y"})
    
    # Train Prophet model
    m = Prophet()
    m.fit(ts[["ds", "y"]])
    
    # Forecast for selected date (24 hours)
    forecast_hours = pd.date_range(selected_date, selected_date + pd.Timedelta(hours=23), freq="H")
    future = pd.DataFrame({"ds": forecast_hours})
    forecast = m.predict(future)
    
    # Format response
    forecast_data = {
        'station_name': station_name,
        'vehicle_type': vehicle_type,
        'date': date_str,
        'forecast': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict(orient='records')
    }
    
    return jsonify(forecast_data)

@app.route('/api/overload-analysis')
def get_overload_analysis():
    """Get overload analysis for all stations"""
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'error': 'Date parameter required'}), 400
    
    df = simulate_ev_data()
    selected_date = pd.to_datetime(date_str)
    train_start = selected_date - pd.Timedelta(days=7)
    train_end = selected_date - pd.Timedelta(days=1)
    
    forecast_hours = pd.date_range(selected_date, selected_date + pd.Timedelta(hours=23), freq="H")
    train_mask = (pd.to_datetime(df["date"], format="%d-%m-%Y") >= train_start) & (pd.to_datetime(df["date"], format="%d-%m-%Y") <= train_end)
    
    all_forecast_rows = []
    
    for station_name in df["station_name"].unique():
        for vtype in ["car", "scooter"]:
            mask = (df["station_name"] == station_name) & (df["vehicle_type"] == vtype)
            train = df[train_mask & mask]
            
            if not train.empty:
                ts = train.groupby(["date", "hour", "latitude", "longitude"])["vehicles_charged"].sum().reset_index()
                ts["ds"] = pd.to_datetime(ts["date"], format="%d-%m-%Y") + pd.to_timedelta(ts["hour"], unit="h")
                ts = ts.rename(columns={"ds": "ds", "vehicles_charged": "y"})
                
                m = Prophet()
                m.fit(ts[["ds", "y"]])
                future = pd.DataFrame({"ds": forecast_hours})
                f = m.predict(future)
                
                for _, row in f.iterrows():
                    all_forecast_rows.append({
                        "station_id": df[df["station_name"] == station_name]["station_id"].iloc[0],
                        "station_name": station_name,
                        "vehicle_type": vtype,
                        "ds": row["ds"].isoformat(),
                        "yhat": row["yhat"]
                    })
    
    forecast_df = pd.DataFrame(all_forecast_rows)
    
    # Analyze overload for cars and scooters
    car_analysis = analyze_overload(forecast_df[forecast_df["vehicle_type"] == "car"])
    scooter_analysis = analyze_overload(forecast_df[forecast_df["vehicle_type"] == "scooter"])
    
    return jsonify({
        'car_analysis': car_analysis,
        'scooter_analysis': scooter_analysis
    })

def analyze_overload(forecast_df):
    """Analyze overload for given forecast data"""
    if forecast_df.empty:
        return {'suggestions': [], 'message': 'No data available'}
    
    peak_df = (
        forecast_df.groupby(['station_id', 'station_name', 'vehicle_type'], as_index=False)
        .agg({'yhat': 'max'})
        .rename(columns={'yhat': 'forecasted_peak'})
    )
    
    peak_df['capacity'] = peak_df.apply(
        lambda row: station_capacity.get(row['station_name'], {}).get(row['vehicle_type'], np.nan),
        axis=1
    )
    
    peak_df['overload_pct'] = peak_df['forecasted_peak'] / peak_df['capacity']
    peak_df['unmet_demand'] = peak_df['forecasted_peak'] - peak_df['capacity']
    overloaded = peak_df[peak_df['overload_pct'] > 0.9]
    
    if overloaded.empty:
        busiest = peak_df.sort_values('forecasted_peak', ascending=False).head(3)
        busiest['recommendation'] = 'Monitor usage'
        result = busiest
        message = "No station exceeds 90% of its capacity. Showing top 3 busiest stations."
    else:
        overloaded = overloaded.copy()
        overloaded['recommendation'] = overloaded['unmet_demand'].apply(
            lambda x: f"Add {int(np.ceil(x/5))} more ports" if x > 0 else "Monitor usage"
        )
        
        not_overloaded = peak_df[~peak_df.index.isin(overloaded.index)]
        next_busiest = not_overloaded.sort_values('forecasted_peak', ascending=False).head(2)
        next_busiest['recommendation'] = 'Monitor usage'
        result = pd.concat([overloaded, next_busiest]).sort_values('forecasted_peak', ascending=False).head(3)
        
        if (overloaded['forecasted_peak'] > overloaded['capacity']).any():
            message = "Some stations exceed their maximum capacity! Immediate action required."
        else:
            message = "Some stations are above 90% capacity. Consider adding more ports."
    
    return {
        'suggestions': result[['station_id', 'station_name', 'vehicle_type', 'forecasted_peak', 'capacity', 'unmet_demand', 'recommendation']].to_dict(orient='records'),
        'message': message
    }

@app.route('/api/solar-analysis')
def get_solar_analysis():
    """Get solar-suitable stations analysis"""
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'error': 'Date parameter required'}), 400
    
    df = simulate_ev_data()
    selected_date = pd.to_datetime(date_str)
    train_start = selected_date - pd.Timedelta(days=7)
    train_end = selected_date - pd.Timedelta(days=1)
    
    forecast_hours = pd.date_range(selected_date, selected_date + pd.Timedelta(hours=23), freq="H")
    train_mask = (pd.to_datetime(df["date"], format="%d-%m-%Y") >= train_start) & (pd.to_datetime(df["date"], format="%d-%m-%Y") <= train_end)
    
    all_forecast_rows = []
    
    for station_name in df["station_name"].unique():
        for vtype in ["car", "scooter"]:
            mask = (df["station_name"] == station_name) & (df["vehicle_type"] == vtype)
            train = df[train_mask & mask]
            
            if not train.empty:
                ts = train.groupby(["date", "hour", "latitude", "longitude"])["vehicles_charged"].sum().reset_index()
                ts["ds"] = pd.to_datetime(ts["date"], format="%d-%m-%Y") + pd.to_timedelta(ts["hour"], unit="h")
                ts = ts.rename(columns={"ds": "ds", "vehicles_charged": "y"})
                
                m = Prophet()
                m.fit(ts[["ds", "y"]])
                future = pd.DataFrame({"ds": forecast_hours})
                f = m.predict(future)
                
                for _, row in f.iterrows():
                    all_forecast_rows.append({
                        "station_id": df[df["station_name"] == station_name]["station_id"].iloc[0],
                        "station_name": station_name,
                        "vehicle_type": vtype,
                        "ds": row["ds"],
                        "yhat": row["yhat"]
                    })
    
    forecast_df = pd.DataFrame(all_forecast_rows)
    forecast_df['hour'] = pd.to_datetime(forecast_df['ds']).dt.hour
    
    # Filter for 10:00 to 16:00 (solar hours)
    solar_df = forecast_df[(forecast_df['hour'] >= 10) & (forecast_df['hour'] <= 16)]
    avg_df = solar_df.groupby(['station_id', 'station_name', 'vehicle_type'], as_index=False)['yhat'].mean().rename(columns={'yhat': 'avg_daytime_demand'})
    
    # Get top 3 per vehicle type
    solar_candidates = []
    for vtype in avg_df['vehicle_type'].unique():
        top3 = avg_df[avg_df['vehicle_type'] == vtype].sort_values('avg_daytime_demand', ascending=False).head(3)
        for _, row in top3.iterrows():
            solar_candidates.append({
                'station_id': row['station_id'],
                'station_name': row['station_name'],
                'vehicle_type': row['vehicle_type'],
                'avg_daytime_demand': row['avg_daytime_demand'],
                'solar_candidate': 'Yes'
            })
    
    return jsonify(solar_candidates)

@app.route('/api/what-if-simulation')
def what_if_simulation():
    """What-if simulation for station capacity and demand"""
    station_name = request.args.get('station_name')
    vehicle_type = request.args.get('vehicle_type')
    ports = int(request.args.get('ports', 20))
    multiplier = float(request.args.get('multiplier', 1.0))
    session_time = int(request.args.get('session_time', 30))
    date_str = request.args.get('date')
    
    if not all([station_name, vehicle_type, date_str]):
        return jsonify({'error': 'Missing required parameters'}), 400
    
    df = simulate_ev_data()
    selected_date = pd.to_datetime(date_str)
    train_start = selected_date - pd.Timedelta(days=7)
    train_end = selected_date - pd.Timedelta(days=1)
    
    forecast_hours = pd.date_range(selected_date, selected_date + pd.Timedelta(hours=23), freq="H")
    train_mask = (pd.to_datetime(df["date"], format="%d-%m-%Y") >= train_start) & (pd.to_datetime(df["date"], format="%d-%m-%Y") <= train_end)
    
    mask = (df["station_name"] == station_name) & (df["vehicle_type"] == vehicle_type)
    train = df[train_mask & mask]
    
    if train.empty:
        return jsonify({'error': 'No data available for simulation'}), 400
    
    ts = train.groupby(["date", "hour", "latitude", "longitude"])["vehicles_charged"].sum().reset_index()
    ts["ds"] = pd.to_datetime(ts["date"], format="%d-%m-%Y") + pd.to_timedelta(ts["hour"], unit="h")
    ts = ts.rename(columns={"ds": "ds", "vehicles_charged": "y"})
    
    m = Prophet()
    m.fit(ts[["ds", "y"]])
    future = pd.DataFrame({"ds": forecast_hours})
    forecast = m.predict(future)
    
    # Simulation calculations
    adjusted_peak = forecast['yhat'].max() * multiplier
    new_capacity = ports
    avg_charge_time = session_time / 60  # convert to hours
    new_queue_time = (adjusted_peak / new_capacity) * avg_charge_time
    overload_status = "Would overload" if adjusted_peak > 0.9 * new_capacity else "OK"
    unmet = max(0, adjusted_peak - new_capacity)
    recommendation = f"Add {int(np.ceil(unmet/5))} more ports" if overload_status == "Would overload" else "Monitor usage"
    
    return jsonify({
        'station_name': station_name,
        'vehicle_type': vehicle_type,
        'adjusted_peak_demand': adjusted_peak,
        'new_capacity': new_capacity,
        'overload_status': overload_status,
        'queue_time_hours': new_queue_time,
        'recommendation': recommendation,
        'unmet_demand': unmet
    })

@app.route('/api/top-stations')
def get_top_stations():
    """Get top 5 stations by predicted usage"""
    date_str = request.args.get('date')
    vehicle_type = request.args.get('vehicle_type', 'car')
    
    if not date_str:
        return jsonify({'error': 'Date parameter required'}), 400
    
    df = simulate_ev_data()
    selected_date = pd.to_datetime(date_str)
    train_start = selected_date - pd.Timedelta(days=7)
    train_end = selected_date - pd.Timedelta(days=1)
    
    forecast_hours = pd.date_range(selected_date, selected_date + pd.Timedelta(hours=23), freq="H")
    train_mask = (pd.to_datetime(df["date"], format="%d-%m-%Y") >= train_start) & (pd.to_datetime(df["date"], format="%d-%m-%Y") <= train_end)
    
    top_stations = []
    
    for station_name in df["station_name"].unique():
        mask = (df["station_name"] == station_name) & (df["vehicle_type"] == vehicle_type)
        train = df[train_mask & mask]
        
        if not train.empty:
            ts = train.groupby(["date", "hour", "latitude", "longitude"])["vehicles_charged"].sum().reset_index()
            ts["ds"] = pd.to_datetime(ts["date"], format="%d-%m-%Y") + pd.to_timedelta(ts["hour"], unit="h")
            ts = ts.rename(columns={"ds": "ds", "vehicles_charged": "y"})
            
            m = Prophet()
            m.fit(ts[["ds", "y"]])
            future = pd.DataFrame({"ds": forecast_hours})
            f = m.predict(future)
            
            top_stations.append({
                "station_name": station_name,
                "predicted_peak": f["yhat"].max()
            })
    
    # Sort and get top 5
    top_stations.sort(key=lambda x: x['predicted_peak'], reverse=True)
    return jsonify(top_stations[:5])

if __name__ == '__main__':
    app.run(debug=True, port=5000)

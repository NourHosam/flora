import React, { useState } from 'react';
import { analyzeCropData } from '../services/api';
import './CropRecommendation.css';

const CropRecommendation = () => {
    const [soilParams, setSoilParams] = useState({
        nitrogen: '',
        phosphorus: '',
        potassium: ''
    });

    const [climateParams, setClimateParams] = useState({
        temperature: '',
        humidity: '',
        rainfall: '120',
        ph: ''
    });

    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSoilChange = (param, value) => {
        setSoilParams(prev => ({ 
            ...prev,
            [param]: value
        }));
    };

    const handleClimateChange = (param, value) => {
        setClimateParams(prev => ({ 
            ...prev,
            [param]: value
        }));
    };

    const handleRainfallChange = (value) => {
        setClimateParams(prev => ({ 
            ...prev,
            rainfall: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRecommendations(null);

        try {
            const allData = {
                ...soilParams,
                ...climateParams
            };

            const numericData = Object.fromEntries(
                Object.entries(allData).map(([key, value]) => [key, parseFloat(value) || 0])
            );

            console.log('Sending data to backend:', numericData);
            const response = await analyzeCropData(numericData);
            console.log('Full API response:', response);

            if (response) {
                const recommendationData = {
                    name: response.crop || response.recommended_crop || 'Unknown Crop',
                    suitability: response.confidence > 0.8 ? "High" : response.confidence > 0.6 ? "Medium" : "Low",
                    score: Math.round((response.confidence || 0.5) * 100),
                    description: response.reasons ? response.reasons.join('. ') : 'Based on your soil and climate conditions.',
                    season: getSeasonFromCrop(response.crop)
                };

                setRecommendations([recommendationData]);
            }
        } catch (err) {
            console.error('Full error details:', err);
            setError('Failed to get crop recommendation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getSeasonFromCrop = (crop) => {
        const summerCrops = ['tomato', 'pepper', 'corn', 'cucumber'];
        const winterCrops = ['wheat', 'cabbage', 'broccoli', 'carrot'];

        if (!crop) return 'Various Seasons';

        const cropLower = crop.toLowerCase();
        if (summerCrops.some(c => cropLower.includes(c))) return 'Spring/Summer';
        if (winterCrops.some(c => cropLower.includes(c))) return 'Fall/Winter';

        return 'Various Seasons';
    };

    const getRainfallColor = (value) => {
        const rainfall = parseFloat(value) || 0;
        if (rainfall < 100) return '#ff6b6b';
        if (rainfall < 200) return '#ffa726';
        if (rainfall < 300) return '#4caf50';
        return '#2e7d32';
    };

    return (
        <div className="crop-recommendation">
            <div className="recommendation-header">
                <h1>Crop Recommendation</h1>
                <p>Enter your environmental parameters to receive AI-powered crop recommendations</p>
            </div>

            <div className="recommendation-content">
                <div className="parameters-section">
                    <div className="parameters-card">
                        <h2>Environmental Parameters</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="soil-nutrients">
                                <h3>Soil Nutrients (ppm)</h3>
                                <div className="nutrient-grid">
                                    <div className="nutrient-item">
                                        <label>Nitrogen (N)</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                min="0"
                                                max="3000"
                                                value={soilParams.nitrogen}
                                                onChange={(e) => handleSoilChange('nitrogen', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 50"
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="nutrient-item">
                                        <label>Phosphorus (P)</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                min="0"
                                                max="200"
                                                value={soilParams.phosphorus}
                                                onChange={(e) => handleSoilChange('phosphorus', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 40"
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="nutrient-item">
                                        <label>Potassium (K)</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                min="0"
                                                max="400"
                                                value={soilParams.potassium}
                                                onChange={(e) => handleSoilChange('potassium', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 30"
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="climate-conditions">
                                <h3>Climate Conditions</h3>
                                <div className="climate-grid">
                                    <div className="climate-item">
                                        <label>Temperature (°C)</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                value={climateParams.temperature}
                                                onChange={(e) => handleClimateChange('temperature', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 25.5"
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="climate-item">
                                        <label>Humidity (%)</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={climateParams.humidity}
                                                onChange={(e) => handleClimateChange('humidity', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 65.0"
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="climate-item">
                                        <label>Rainfall (mm)</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="0"
                                                max="500"
                                                value={climateParams.rainfall}
                                                onChange={(e) => handleRainfallChange(e.target.value)}
                                                className="rainfall-slider"
                                            />
                                            <span
                                                className="rainfall-value"
                                                style={{ color: getRainfallColor(climateParams.rainfall) }}
                                            >
                                                {climateParams.rainfall} mm
                                            </span>
                                        </div>
                                    </div>

                                    <div className="climate-item">
                                        <label>Soil pH</label>
                                        <div className="input-container">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="14"
                                                value={climateParams.ph}
                                                onChange={(e) => handleClimateChange('ph', e.target.value)}
                                                className="climate-input"
                                                placeholder="e.g., 6.5"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="recommend-btn"
                                disabled={loading}
                            >
                                {loading ? 'Analyzing...' : 'Get Crop Recommendations'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="results-section">
                    <div className="results-card">
                        <h2>Recommended Crops</h2>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {recommendations ? (
                            <div className="recommendations-list">
                                {recommendations.map((crop, index) => (
                                    <div key={index} className="crop-card">
                                        <div className="crop-header">
                                            <h3>{crop.name}</h3>
                                            <span className={`suitability-badge ${crop.suitability.toLowerCase()}`}>
                                                {crop.suitability} Suitability
                                            </span>
                                        </div>
                                        <div className="crop-score">
                                            <div className="score-bar">
                                                <div
                                                    className="score-fill"
                                                    style={{ width: `${crop.score}%` }}
                                                />
                                            </div>
                                            <span className="score-value">{crop.score}% Match</span>
                                        </div>
                                        <p className="crop-description">{crop.description}</p>
                                        <div className="crop-meta">
                                            <span className="season-tag">{crop.season}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="placeholder">
                                <div className="placeholder-icon">💡</div>
                                <p>Enter your parameters to receive crop recommendations</p>
                                <small>Adjust the values and click "Get Crop Recommendations"</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropRecommendation;
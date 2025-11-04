import React, { useState, useEffect, useCallback } from 'react';
import { analyzeCropData, fetchCropHistory } from '../services/api';
import './CropRecommendation.css';

const CropRecommendation = () => {
  const [soilParams, setSoilParams] = useState({ nitrogen:null, phosphorus: null, potassium: null });
  const [climateParams, setClimateParams] = useState({ temperature: null, humidity: null, rainfall: 120, ph: null});
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ================== Load History ==================
  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchCropHistory();
      
      // معالجة البيانات لضمان أن history تكون مصفوفة
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.history)) {
        setHistory(data.history);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      } else if (data && typeof data === 'object') {
        // إذا كانت البيانات كائن، نحوله لمصفوفة
        const historyArray = Object.values(data).filter(item => 
          item && typeof item === 'object'
        );
        setHistory(historyArray);
      } else {
        console.warn('Unexpected history data format:', data);
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

<<<<<<< HEAD
  // ================== Handle Input Changes ==================
  const handleParamChange = (category, param, value) => {
    const numericValue = parseFloat(value) || 0;
    if (category === 'soil') setSoilParams(prev => ({ ...prev, [param]: numericValue }));
    if (category === 'climate') setClimateParams(prev => ({ ...prev, [param]: numericValue }));
  };

  // ================== Submit Form ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setRecommendations(null);

    try {
      const allData = { ...soilParams, ...climateParams };
      const numericData = Object.fromEntries(
        Object.entries(allData).map(([k, v]) => [k, parseFloat(v) || 0])
      );

      const response = await analyzeCropData(numericData);
=======
    const handleSoilChange = (param, value) => {
        setSoilParams(prev => ({ ...prev, [param]: value }));
    };

    const handleClimateChange = (param, value) => {
        setClimateParams(prev => ({ ...prev, [param]: value }));
    };

    const handleRainfallChange = (value) => {
        setClimateParams(prev => ({ ...prev, rainfall: value }));
    };
>>>>>>> 427b181a96bd9cbb94e03a20316f3a4eaf8df2dc

      // معالجة استجابة الـ API بشكل آمن
      let cropName = 'Unknown Crop';
      let confidence = 0.5;

      if (typeof response === 'string') {
        cropName = response;
      } else if (response && typeof response === 'object') {
        cropName = response.crop || response.recommended_crop || response.prediction || 'Unknown Crop';
        confidence = response.confidence || response.score || 0.5;
      }

      setRecommendations([{
        name: cropName,
        suitability: confidence > 0.8 ? "High" :
                     confidence > 0.6 ? "Medium" : "Low",
        score: Math.round(confidence * 100),
        description: response.reasons ? 
          (Array.isArray(response.reasons) ? response.reasons.join('. ') : String(response.reasons)) 
          : 'Based on your soil and climate conditions.',
        season: getSeasonFromCrop(cropName)
      }]);

<<<<<<< HEAD
      await loadHistory();
    } catch (err) {
      console.error(err);
      if (err.message.includes('401') || err.message.includes('token')) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.message || 'Failed to get crop recommendation.');
      }
    } finally {
      setLoading(false);
    }
  };
=======
            console.log('Sending data directly to Hugging Face API:', numericData);
            const response = await analyzeCropData(numericData);
            console.log('Full API response:', response);
>>>>>>> 427b181a96bd9cbb94e03a20316f3a4eaf8df2dc

  // ================== Helpers ==================
  
  // دالة تحديد لون كمية الأمطار - أضفها هنا
  const getRainfallColor = (value) => {
    const rainfall = parseFloat(value) || 0;
    if (rainfall < 100) return '#ff6b6b';      // أحمر - قليل جداً
    if (rainfall < 200) return '#ffa726';      // برتقالي - قليل
    if (rainfall < 300) return '#4caf50';      // أخضر - متوسط
    return '#2e7d32';                          // أخضر غامق - جيد
  };

  const getSeasonFromCrop = (crop) => {
    if (!crop) return 'Various Seasons';
    const cropLower = String(crop).trim().toLowerCase();
    const summerCrops = ['tomato', 'pepper', 'corn', 'cucumber', 'maize', 'rice'];
    const winterCrops = ['wheat', 'cabbage', 'broccoli', 'carrot', 'potato', 'barley'];
    if (summerCrops.some(c => cropLower.includes(c))) return 'Spring/Summer';
    if (winterCrops.some(c => cropLower.includes(c))) return 'Fall/Winter';
    return 'Various Seasons';
  };

  // دالة مساعدة لعرض التاريخ بشكل آمن
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  // دالة مساعدة لاستخراج اسم المحصول من عنصر التاريخ
  const getHistoryCropName = (item) => {
    if (!item) return 'Unknown Crop';
    return item.name || item.crop || item.recommended_crop || item.prediction || 'Unknown Crop';
  };

  // دالة مساعدة لاستخراج نسبة المطابقة من عنصر التاريخ
  const getHistoryScore = (item) => {
    if (!item) return 0;
    return item.score || item.confidence * 100 || 50;
  };

  // دالة مساعدة لاستخراج مدى الملائمة من عنصر التاريخ
  const getHistorySuitability = (item) => {
    const score = getHistoryScore(item);
    return score > 80 ? "High" : score > 60 ? "Medium" : "Low";
  };

  // ================== Render ==================
  return (
    <div className="crop-recommendation">
      <div className="recommendation-header">
        <h1>Crop Recommendation</h1>
        <p>Enter environmental parameters to get AI-powered crop recommendations</p>
      </div>

      <div className="recommendation-content">
        {/* Left Panel: Input */}
        <div className="parameters-section">
          <div className="parameters-card">
            <h2>Environmental Parameters</h2>
            <form onSubmit={handleSubmit}>
              <div className="soil-nutrients">
                <h3>Soil Nutrients (ppm)</h3>
                <div className="nutrient-grid">
                  {['nitrogen','phosphorus','potassium'].map(nutrient => (
                    <div key={nutrient} className="nutrient-item">
                      <label>{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</label>
                      <input 
                        type="number" 
                         
                        min="0"
                        value={soilParams[nutrient]}
                        onChange={e => handleParamChange('soil', nutrient, e.target.value)}
                        required 
                      />
                    </div>
                  ))}
                </div>
              </div>

<<<<<<< HEAD
              <div className="climate-conditions">
                <h3>Climate Conditions</h3>
                <div className="climate-grid">
                  {['temperature','humidity','ph'].map(param => (
                    <div key={param} className="climate-item">
                      <label>{param.charAt(0).toUpperCase() + param.slice(1)}</label>
                      <input 
                        type="number" 
                        
                        value={climateParams[param]}
                        onChange={e => handleParamChange('climate', param, e.target.value)}
                        required 
                      />
=======
                <div className="results-section">
                    <div className="results-card">
                        <h2>Recommended Crops</h2>

                        {error && <div className="error-message">{error}</div>}

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
>>>>>>> 427b181a96bd9cbb94e03a20316f3a4eaf8df2dc
                    </div>
                  ))}
                  <div className="climate-item">
                    <label>Rainfall (mm)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="500"
                      value={climateParams.rainfall}
                      onChange={e => handleParamChange('climate', 'rainfall', e.target.value)} 
                    />
                    {/* استخدم الدالة هنا لعرض اللون */}
                    <span style={{ 
                      color: getRainfallColor(climateParams.rainfall),
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {climateParams.rainfall} mm
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Get Crop Recommendations'}
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>

        {/* Right Panel: Results + History */}
        <div className="results-section">
          <div className="results-card">
            <h2>Recommended Crops</h2>
            {recommendations ? (
              <div className="recommendations-list">
                {recommendations.map((crop, i) => (
                  <div key={i} className="crop-card">
                    <h3>{crop.name}</h3>
                    <span className={`suitability-badge ${crop.suitability.toLowerCase()}`}>
                      {crop.suitability} Suitability
                    </span>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${crop.score}%` }} />
                    </div>
                    <span>{crop.score}% Match</span>
                    <p>{crop.description}</p>
                    <small>{crop.season}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recommendation yet. Submit parameters to get recommendations.</p>
            )}

            <h2>History</h2>
            <div className="history-container">
              {!Array.isArray(history) || history.length === 0 ? (
                <p>No previous recommendations.</p>
              ) : (
                history.map((item, idx) => (
                  <div key={item.id || idx} className="history-item">
                    <p><strong>Crop:</strong> {getHistoryCropName(item)}</p>
                    <p><strong>Suitability:</strong> {getHistorySuitability(item)}</p>
                    <p><strong>Score:</strong> {getHistoryScore(item)}%</p>
                    <p><strong>Date:</strong> {formatDate(item.date || item.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;

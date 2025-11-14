import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeDiseaseFromFile, fetchDiseaseHistory } from '../services/api';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchDiseaseHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.history)) {
        setHistory(data.history);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      } else if (data && Array.isArray(data.predictions)) {
        setHistory(data.predictions);
      } else if (data && typeof data === 'object') {
        const historyArray = Object.values(data).filter(item => 
          item && typeof item === 'object' && (item.status || item.prediction || item.result)
        );
        setHistory(historyArray.length > 0 ? historyArray : []);
      } else {
        console.warn('Unexpected disease history data format:', data);
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to fetch disease history:', err);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('⚠️ Please select a valid image file.');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setError('No file selected.');

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeDiseaseFromFile(selectedFile);

      if (!response.success) {
        setError(response.message || 'Failed to detect disease');
      } else {
        setResult({
          status: response.status,
          confidence: response.confidence,
          message: response.message,
          raw: response.raw
        });
      }

      await loadHistory();
    } catch (err) {
      console.error(err);
      if (err.message.includes('401') || err.message.includes('token')) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.message || 'Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('⚠️ Please drop a valid image file.');
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const getHistoryStatus = (item) => {
    if (!item) return 'Unknown';
    return item.status || item.prediction || item.result || item.label || 'Unknown';
  };

  const getHistoryConfidence = (item) => {
    if (!item) return 0;
    return item.confidence || item.score || item.probability || 0;
  };

  return (
    <div className="page-container">
      <div className="grid-container">
        {/* Left Panel: Upload */}
        <div className="card upload-card">
          <h2>🌿 Upload Leaf Image</h2>
          <form onSubmit={handleSubmit}>
            <label className="label-title">Select Image</label>
            <div className="file-upload-container">
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file-input-hidden"
              />
              <label htmlFor="fileInput" className="custom-file-btn">
                📤 Choose Image
              </label>
              <span className="file-name">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>

            <div 
              className="upload-box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              ) : (
                <>
                  <div className="upload-icon">🌱</div>
                  <p>Drag & drop an image here or click to upload</p>
                  <small>Supported formats: JPG, PNG, JPEG</small>
                </>
              )}
            </div>

            <div className="button-row">
              <button 
                type="submit" 
                disabled={loading || !selectedFile} 
                className="btn predict-btn"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyzing...
                  </>
                ) : 'Predict Disease'}
              </button>
              <button 
                type="button" 
                onClick={handleReset} 
                className="btn reset-btn"
              >
                Reset
              </button>
            </div>
          </form>

          {error && <div className="error-message">⚠️ {error}</div>}
        </div>

        {/* Right Panel: Result + History */}
        <div className="card result-card">
          <h2>Detection Results</h2>
          {result ? (
            <div className="result-box">
              <div className={`result-status ${result.confidence > 0.7 ? 'healthy' : result.confidence > 0.4 ? 'warning' : 'diseased'}`}>
                <strong>Diagnosis:</strong> {result.status}
              </div>
              <div className="confidence-meter">
                <div className="meter-container">
                  <div 
                    className="meter-fill"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                  <span className="confidence-value">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <img
                src="https://img.freepik.com/premium-photo/cute-plant-pot-cartoon-vector-icon-illustration-nature-object-icon-concept-isolated-premium-vector-flat-cartoon-style_839035-1754184.jpg"
                alt="leaf"
                className="placeholder-img"
              />
              <p>Upload an image to see detection results</p>
            </div>
          )}

          <h2>Detection History</h2>
          <div className="history-container">
            {!Array.isArray(history) || history.length === 0 ? (
              <p className="no-history">No previous detections found.</p>
            ) : (
              history.map((item, idx) => (
                <div key={item.id || idx} className="history-item">
                  <div className="history-confidence">
                    <strong>Confidence:</strong> {(getHistoryConfidence(item) * 100).toFixed(2)}%
                  </div>
                  <div className="history-date">
                    <strong>Date:</strong> {formatDate(item.date || item.created_at || item.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;

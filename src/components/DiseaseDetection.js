import React, { useState, useRef } from 'react';
import { analyzeDisease } from '../services/api'; // ✅ استدعاء الدالة من ملف api.js
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('No file selected.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('📤 Sending image to Disease Detection API...');
      const response = await analyzeDisease(selectedFile); // ✅ استخدام دالة الـ API
      console.log('✅ API Response:', response);

      setResult({
        status: response.status || 'Unknown',
        confidence: response.overall_confidence || 0,
        message: response.message || 'Detection completed successfully.',
      });
    } catch (err) {
      console.error('❌ API Error:', err);
      setError('Failed to get disease detection result. Please try again.');
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

  return (
    <div className="page-container">
      <div className="grid-container">
        {/* 🟢 Left Panel */}
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

            <div className="upload-box">
              {selectedFile ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="preview-image"
                />
              ) : (
                <>
                  <div className="upload-icon">🌱</div>
                  <p>Upload an image to get started</p>
                </>
              )}
            </div>

            <div className="button-row">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn predict-btn"
              >
                {loading ? 'Analyzing...' : 'Predict'}
              </button>
              <button type="button" onClick={handleReset} className="btn reset-btn">
                Reset
              </button>
            </div>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>

        {/* 🟢 Right Panel */}
        <div className="card result-card">
          <h2>Detection Results</h2>
          {result ? (
            <div className="result-box">
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
              <p><strong>Message:</strong> {result.message}</p>
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
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;

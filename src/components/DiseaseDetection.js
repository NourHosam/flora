import React, { useState, useRef } from 'react';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // تثبيت دالة loadHistory لتجنب تحذيرات useEffect
  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchDiseaseHistory();
      
      // معالجة البيانات لضمان أن history تكون مصفوفة
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.history)) {
        setHistory(data.history);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      } else if (data && Array.isArray(data.predictions)) {
        setHistory(data.predictions);
      } else if (data && typeof data === 'object') {
        // إذا كانت البيانات كائن، نحوله لمصفوفة
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
      setHistory([]); // تأكد من أن history تبقى مصفوفة فارغة في حالة الخطأ
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // إدارة preview URL بشكل آمن لتجنب memory leak
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('No file selected.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://mai-22-plant-disease-detection.hf.space/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data);
    } catch (err) {
      setError(`Failed to get prediction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <div className="grid-container">
        {/* Left Panel */}
        <div className="card upload-card">
          <h2>Upload Leaf Image</h2>
        <form onSubmit={handleSubmit}>
  <label className="label-title">Select Image</label>

  {/* الزر المخصص لاختيار الصورة */}
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
    <button type="submit" disabled={loading || !selectedFile} className="btn predict-btn">
      {loading ? 'Predicting...' : 'Predict'}
    </button>
    <button type="button" onClick={handleReset} className="btn reset-btn">
      Reset
    </button>
  </div>
</form>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="card result-card">
          <h2>Detection Results</h2>
          {result ? (
            <div className="result-box">
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Confidence:</strong> {(result.overall_confidence * 100).toFixed(2)}%</p>
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
                  <div className="history-status">
                    <strong>Diagnosis:</strong> {getHistoryStatus(item)}
                  </div>
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
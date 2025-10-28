const API_BASE_URL = 'http://localhost:5000';

// Crop Recommendation API
export const analyzeCropData = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/crop-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Crop recommendation error:', error);
        throw error;
    }
};

// Plant Disease Detection API
export const analyzeDisease = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/disease`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Disease detection error:', error);
        throw error;
    }
};
// Crop Recommendation API
export const analyzeCropData = async (data) => {
    try {
        const response = await fetch('https://mai-22-crop-recommendation-deployment.hf.space/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Crop recommendation error:', error);
        throw error;
    }
};

// Plant Disease Detection API
export const analyzeDisease = async (formData) => {
    try {
        const response = await fetch('https://mai-22-plant-disease-detection.hf.space/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Disease detection error:', error);
        throw error;
    }
};

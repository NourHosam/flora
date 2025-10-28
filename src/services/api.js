// ✅ Crop Recommendation API
export const analyzeCropData = async (data) => {
    try {
        const response = await fetch('https://mai-22-crop-recommendation-deployment.hf.space/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', // مهم لضمان استلام JSON
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Crop API error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Crop recommendation error:', error);
        throw new Error('Failed to fetch crop recommendation');
    }
};



// 🌿 Plant Disease Detection API
export const analyzeDisease = async (formData) => {
    if (!formData) {
        throw new Error('No image data provided');
    }

    try {
        const response = await fetch('https://mai-22-plant-disease-detection.hf.space/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Disease API error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Disease detection error:', error);
        throw new Error('Failed to detect disease');
    }
};

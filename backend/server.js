const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
 
const app = express();
 
app.use(cors({
    origin: ['http://localhost:3000', 'https://flora-teal-one.vercel.app'],  // غير ده لو الفرونت اند على port تاني
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
 
app.use(express.json({ limit: '50mb' }));
 
// إعداد multer لتخزين في الذاكرة
const upload = multer({ storage: multer.memoryStorage() });
 
// طريق لكشف المرض
app.post('/api/disease', upload.single('image'), async (req, res) => {
    try {
        console.log('🟢 Received disease detection request');
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'لم يتم استقبال ملف الصورة'
            });
        }
 
        console.log(`📸 Image received: ${req.file.originalname}`);
        console.log(`Type: ${req.file.mimetype}, Size: ${req.file.size} bytes`);
 
        // إنشاء FormData عشان Flask يستقبله
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
 
        // الـ Endpoint الصحيح لـ Flask
        const YOUR_SPACE_URL = 'https://mai-22-plant-disease-detection.hf.space/predict';
 
        console.log('Sending request to Hugging Face Plant Disease API...');
 
        const response = await axios.post(YOUR_SPACE_URL, formData, {
            headers: {
                ...formData.getHeaders()  // headers للـ FormData
            },
            timeout: 30000
        });
 
        console.log('✅ Disease detection successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
 
        // استجابة Flask مباشرة
        res.json({
            success: true,
            status: response.data.status,
            confidence: response.data.overall_confidence,
            message: 'تم إكمال كشف المرض',
            response: response.data
        });
 
    } catch (error) {
        console.error('❌ Disease detection failed:');
        console.error('Response Error:', error.response?.status, error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'فشل في كشف المرض',
            details: error.response?.data || error.message,
            space_url: 'https://mai-22-plant-disease-detection.hf.space'
        });
    }
});
 
// طريق لمعلومات المساحة (مش ضروري، بس لو عايزه احتفظ به)
app.get('/api/space-info', (req, res) => {
    res.json({
        your_space: 'https://mai-22-plant-disease-detection.hf.space',
        space_owner: 'Mai-22',
        space_name: 'plant-disease-detection',
        api_endpoint: 'https://mai-22-plant-disease-detection.hf.space/predict'
    });
});
 
// ========== ⬆️ الكود ينتهي هنا ⬆️ ==========

// Crop Recommendation Route (اتركها كما هي أو عدلها بنفس الطريقة)
app.post('/api/crop-recommendation', async (req, res) => {
    try {
        console.log('Crop recommendation request:', req.body);

        // جرب هذه الـendpoints المختلفة
        const endpoints = [
            '/recommend',
            '/predict',
            '/api/recommend',
            '/api/predict',
            '/analyze',
            '/classify'
        ];

        const baseURL = 'https://mai-22-crop-recommendation-deployment.hf.space';

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying crop endpoint: ${baseURL}${endpoint}`);
                
                const response = await axios.post(
                    `${baseURL}${endpoint}`,
                    req.body,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000
                    }
                );

                console.log('✅ Crop API response:', response.data);
                return res.json(response.data);
                
            } catch (error) {
                console.log(`❌ Failed with ${endpoint}: ${error.response?.status || error.message}`);
                continue;
            }
        }

        // إذا كل الـendpoints فشلت
        throw new Error('All crop endpoints failed');

    } catch (error) {
        console.error('❌ All crop endpoints failed:', error.message);
        
        res.status(500).json({
            error: 'Could not find the correct crop API endpoint',
            message: 'The crop recommendation API is running but the endpoint is not found',
            details: error.message,
            suggestion: 'Please check the API documentation for the correct endpoint'
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
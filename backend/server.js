import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Handle JSON and form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // قبول جميع أنواع الصور المطلوبة
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Test route
app.get('/', (req, res) => {
    res.send('Server is running ✅');
});

// ========== ⬇️ ضع الكود الجديد هنا ⬇️ ==========
app.post('/api/disease', upload.single('image'), async (req, res) => {
    try {
        console.log('🟢 Received disease detection request');

        // التحقق من رفع الصورة
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // تحديد نوع الصورة (MIME type)
        const mimeMap = {
            'image/jpeg': 'jpeg',
            'image/jpg': 'jpeg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/bmp': 'bmp',
            'image/gif': 'gif',
            'image/svg+xml': 'svg+xml'
        };
        const mimeType = mimeMap[req.file.mimetype] || 'jpeg';

        // تحويل الصورة إلى base64
        const imageData = req.file.buffer.toString('base64');
        const imageBase64 = `data:image/${mimeType};base64,${imageData}`;

        console.log(`📸 Image received: ${req.file.originalname}`);
        console.log(`Type: ${req.file.mimetype} (${mimeType}), Size: ${req.file.size} bytes`);
        console.log('Sending request to Hugging Face Plant Disease API...');

        // رابط الـ API
        const baseURL = 'https://mai-22-plant-disease-detection.hf.space/run/predict';

        // طلب POST متوافق مع Hugging Face API
        const response = await axios.post(
            baseURL,
            { data: [imageBase64] },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000 // 30 ثانية كحد أقصى
            }
        );

        console.log('✅ Disease API responded successfully');
        console.log(response.data);

        // إرجاع النتيجة بتنسيق موحد
        return res.status(200).json({
            success: true,
            model: 'Plant Disease Detection (Hugging Face Space)',
            source: baseURL,
            timestamp: new Date().toISOString(),
            prediction: response.data
        });

    } catch (error) {
        console.error('❌ Disease detection failed:');

        if (error.response) {
            console.error('Response Error:', error.response.status, error.response.data);
        } else {
            console.error('Message:', error.message);
        }

        return res.status(500).json({
            success: false,
            error: 'Disease detection failed',
            message: error.message,
            hint: 'Make sure the Hugging Face Space is running and supports /run/predict endpoint',
            reference: 'https://huggingface.co/docs/api-inference/detailed_parameters#image-inputs'
        });
    }
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
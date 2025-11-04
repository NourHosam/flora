// ================= Utility =================
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function withRetries(fn, maxRetries = 2, initialDelay = 500) {
  let attempt = 0;
  let delay = initialDelay;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay. Error: ${err.message}`);
      await sleep(delay);
      delay *= 2; // exponential backoff
      attempt++;
    }
  }

  throw lastError;
}

// دالة مساعدة لقراءة الـ token من التخزين
function getStoredToken() {
  // جرب localStorage أولاً (لو remember=true)، ثم sessionStorage
  let token = localStorage.getItem('auth_token');
  if (!token) token = sessionStorage.getItem('auth_token');
  if (!token) throw new Error('No token found. Please log in first.');
  return token;
}

// ================= Crop Recommendation =================
export const analyzeCropData = async (data) => {
  const token = getStoredToken(); // يقرأ الـ token من التخزين فقط
  
  return withRetries(async () => {
    const res = await fetch('https://mai-22-crop-recommendation-deployment.hf.space/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Crop API error! status: ${res.status}`);
    return res.json();
  });
};

export const fetchCropHistory = async () => {
  const token = getStoredToken(); // يقرأ الـ token من التخزين فقط
  
  return withRetries(async () => {
    const res = await fetch('https://mai-22-crop-recommendation-deployment.hf.space/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Crop History API error! status: ${res.status}`);
    return res.json();
  });
};

// ================= Disease Detection =================
const DISEASE_ENDPOINT = 'https://mai-22-plant-disease-detection.hf.space/predict';

const fileToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Failed to read file for base64 conversion'));
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

const fetchWithTimeout = (url, options = {}, timeout = 30000) => 
  Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeout))
  ]);

async function safeParseResponse(res) {
  try { return { type: 'json', data: await res.json() }; }
  catch { return { type: 'text', data: await res.text() }; }
}

async function safeReadText(res) { try { return await res.text(); } catch { return null; } }

export async function analyzeDisease(input, opts = {}) {
  const token = getStoredToken(); // يقرأ الـ token من التخزين فقط
  const { retries = 2, timeout = 30000 } = opts;

  const file = (input instanceof File || (input && input.type && input.size)) ? input : null;
  const initialFormData = input instanceof FormData ? input : null;
  let lastError = null;

  const tryFormData = async fd => {
    const res = await fetchWithTimeout(DISEASE_ENDPOINT, {
      method: 'POST',
      body: fd,
      headers: { 'Authorization': `Bearer ${token}` },
    }, timeout);

    if (!res.ok) {
      const txt = await safeReadText(res);
      throw new Error(`Status ${res.status}: ${txt || res.statusText}`);
    }

    return await safeParseResponse(res);
  };

  const tryFormDataFields = async fileObj => {
    const fields = ['file','image','img','image_file','upload','data'];
    for (const f of fields) {
      try {
        const fd = new FormData();
        fd.append(f, fileObj, fileObj.name || 'upload.jpg');
        return { parsed: await tryFormData(fd), fieldUsed: f };
      } catch (err) { lastError = err; }
    }
    throw lastError || new Error('All FormData field attempts failed');
  };

  const tryBase64Json = async fileObj => {
    const base64 = await fileToBase64(fileObj);
    const rawBase64 = base64.split(',')[1] || base64;
    const keys = ['image','file','data','image_base64'];

    for (const key of keys) {
      for (const payload of [
        { [key]: base64 }, { [key]: rawBase64 },
        { data: { [key]: base64 } }, { data: { [key]: rawBase64 } }
      ]) {
        try {
          const res = await fetchWithTimeout(DISEASE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type':'application/json',
              'Accept':'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }, timeout);

          if (!res.ok) {
            const txt = await safeReadText(res);
            throw new Error(`Status ${res.status}: ${txt || res.statusText}`);
          }

          return { parsed: await safeParseResponse(res), keyUsed: key, payloadExample: payload };
        } catch (err) { lastError = err; }
      }
    }
    throw lastError || new Error('All base64 JSON attempts failed');
  };

  const normalizeParsed = parsed => {
    if (!parsed) return { success: false, message: 'No response' };
    if (parsed.type === 'json') {
      const data = parsed.data;
      const status = data.status || data.label || data.prediction || (typeof data === 'string' ? data : null);
      const confidence = data.overall_confidence ?? data.confidence ?? data.score ?? 0;
      return { success: true, status: status ?? 'OK', confidence: Number(confidence) || 0, raw: data, message: data.message || data.info || 'OK' };
    } else {
      return { success: true, status: 'OK', confidence: 0, raw: parsed.data, message: typeof parsed.data === 'string' ? parsed.data.substring(0, 500) : 'OK' };
    }
  };

  try {
    if (initialFormData) return normalizeParsed(await withRetries(() => tryFormData(initialFormData), retries));
    if (file) {
      try { return normalizeParsed((await withRetries(() => tryFormDataFields(file), retries)).parsed); } catch {}
      return normalizeParsed((await withRetries(() => tryBase64Json(file), retries)).parsed);
    }
    throw new Error('No valid input for disease analysis');
  } catch (err) {
    console.error(`Disease analysis failed: ${err.message}`);
    return { success: false, status: null, confidence: 0, raw: null, message: err.message || 'Unknown error' };
  }
}

export const analyzeDiseaseFromFile = async (file, opts = {}) => {
  if (!(file instanceof File)) throw new Error('Input must be a File object');
  const fd = new FormData();
  fd.append('file', file, file.name || 'upload.jpg');
  return analyzeDisease(fd, opts);
};

// ================= Disease History =================
const DISEASE_HISTORY_ENDPOINT = 'https://mai-22-plant-disease-detection.hf.space/history';
export const fetchDiseaseHistory = async () => {
  const token = getStoredToken(); // يقرأ الـ token من التخزين فقط
  
  return withRetries(async () => {
    const res = await fetch(DISEASE_HISTORY_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`Disease History API error! status: ${res.status}`);
    return res.json();
  });
};
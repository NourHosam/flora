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



// services/api.js
const DISEASE_ENDPOINT = 'https://mai-22-plant-disease-detection.hf.space/predict';

/**
 * Helper: convert File/Blob -> base64 data URL
 */
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Failed to read file for base64 conversion'));
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

/**
 * Helper: timeout wrapper for fetch
 */
const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeout))
  ]);
};

/**
 * Advanced analyzeDisease with multiple fallback strategies
 * @param {File | FormData} input - selected File object OR a prepared FormData
 * @param {Object} opts - options: { endpoint, retries, timeout, debug }
 * @returns {Object} standardized result: { success, status, confidence, raw, message }
 */
export async function analyzeDisease(input, opts = {}) {
  const {
    endpoint = DISEASE_ENDPOINT,
    retries = 2,            // retries on network/timeouts/5xx
    timeout = 30000,        // ms per request
    debug = false
  } = opts;

  // Normalize input: if user passed File -> we'll create form data inside attempts
  const file = (input instanceof File || (input && input.type && input.size)) ? input : null;
  const initialFormData = (input instanceof FormData) ? input : null;

  // possible field names to try when sending multipart form-data
  const fieldNames = ['file', 'image', 'img', 'image_file', 'upload', 'data'];

  // possible JSON keys to try when sending base64 payload
  const base64Keys = ['image', 'file', 'data', 'image_base64'];

  const log = (...args) => { if (debug) console.log('[analyzeDisease]', ...args); };

  let lastError = null;

  // Strategy 1: If input is already a FormData -> try sending it first (but try different keys if necessary)
  async function tryFormData(formData) {
    try {
      log('Trying FormData direct POST to', endpoint);
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        body: formData, // DO NOT set Content-Type - browser will set multipart boundary
      }, timeout);

      log('Response status:', res.status);
      if (!res.ok) {
        const text = await safeReadText(res);
        throw new Error(`Status ${res.status}: ${text || res.statusText}`);
      }
      const parsed = await safeParseResponse(res);
      return parsed;
    } catch (err) {
      throw err;
    }
  }

  // Strategy: try sending FormData with various field names (if we have a File)
  async function tryFormDataFieldVariations(fileObj) {
    for (const name of fieldNames) {
      try {
        const fd = new FormData();
        fd.append(name, fileObj, fileObj.name || 'upload.jpg');
        log(`Attempting FormData with field "${name}"`);
        const parsed = await tryFormData(fd);
        // if succeeded, tag which field succeeded
        return { parsed, usedField: name };
      } catch (err) {
        log(`FormData field "${name}" failed:`, err.message);
        lastError = err;
        // continue to next field name
      }
    }
    throw lastError || new Error('All FormData field attempts failed');
  }

  // Strategy: try base64 JSON payloads
  async function tryBase64Json(fileObj) {
    const base64 = await fileToBase64(fileObj); // data:image/..;base64,...
    // some APIs expect raw base64 without prefix - try both
    const rawBase64 = base64.split(',')[1] || base64;

    for (const key of base64Keys) {
      for (const payload of [
        { [key]: base64 },
        { [key]: rawBase64 },
        { data: { [key]: base64 } },
        { data: { [key]: rawBase64 } }
      ]) {
        try {
          log('Attempting base64 JSON with key:', key);
          const res = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          }, timeout);

          log('Response status (base64):', res.status);
          if (!res.ok) {
            const txt = await safeReadText(res);
            throw new Error(`Status ${res.status}: ${txt || res.statusText}`);
          }
          const parsed = await safeParseResponse(res);
          return { parsed, usedKey: key, payloadExample: payload };
        } catch (err) {
          log(`Base64 attempt with key "${key}" failed:`, err.message);
          lastError = err;
        }
      }
    }
    throw lastError || new Error('All base64 JSON attempts failed');
  }

  // Helper to safely parse response as JSON or text
  async function safeParseResponse(response) {
    try {
      const json = await response.json();
      return { type: 'json', data: json };
    } catch (e) {
      // fallback to text
      const text = await response.text();
      return { type: 'text', data: text };
    }
  }
  async function safeReadText(response) {
    try { return await response.text(); } catch { return null; }
  }

  // Retry wrapper for a function that performs one "attempt"
  async function withRetries(fn, maxRetries = 0) {
    let attempt = 0;
    let delay = 500; // start delay ms
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        lastError = err;
        // don't retry on 4xx (bad request), except maybe network blips; but we'll allow limited retries
        log(`Attempt ${attempt} failed:`, err.message);
        if (attempt > maxRetries) break;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      }
    }
    throw lastError;
  }

  // MAIN: Attempt ordered strategies
  try {
    // If caller sent FormData already -> try that first
    if (initialFormData) {
      try {
        const parsed = await withRetries(() => tryFormData(initialFormData), retries);
        const out = normalizeParsed(parsed);
        out.debug = { strategy: 'user-provided-formdata' };
        log('Succeeded with user FormData', out);
        return out;
      } catch (err) {
        log('User FormData attempt failed, will try other strategies');
      }
    }

    // If caller sent File -> try many FormData field names
    if (file) {
      try {
        const { parsed, usedField } = await withRetries(() => tryFormDataFieldVariations(file), retries);
        const out = normalizeParsed(parsed);
        out.debug = { strategy: 'formdata-field-variation', usedField };
        log('Succeeded with FormData field variation', out);
        return out;
      } catch (err) {
        log('All FormData field-name attempts failed, will try base64 JSON');
      }

      // Try base64 JSON fallbacks
      try {
        const { parsed, usedKey } = await withRetries(() => tryBase64Json(file), retries);
        const out = normalizeParsed(parsed);
        out.debug = { strategy: 'base64-json', usedKey };
        log('Succeeded with base64 JSON', out);
        return out;
      } catch (err) {
        log('All base64 attempts failed');
      }
    }

    // If nothing worked:
    throw new Error('All request strategies failed');
  } catch (err) {
    log('Final failure:', err.message);
    return {
      success: false,
      status: null,
      confidence: 0,
      raw: null,
      message: err.message || 'Unknown error'
    };
  }

  // Normalize parsed response into a friendly object
  function normalizeParsed(parsed) {
    if (!parsed) return { success: false, message: 'No response' };

    // if parsed.type === 'json'
    if (parsed.type === 'json') {
      const data = parsed.data;
      // many HF Spaces using Gradio return { data: [...], label: ..., ... } or custom fields
      // try common keys:
      const status = data.status || data.label || data.prediction || (typeof data === 'string' ? data : undefined);
      const confidence = (
        (data.overall_confidence ?? data.confidence ?? data.score) ||
        (Array.isArray(data.data) && data.data[1]) ||
        0
      );

      return {
        success: true,
        status: status ?? 'OK',
        confidence: typeof confidence === 'number' ? confidence : (parseFloat(confidence) || 0),
        raw: data,
        message: data.message || data.info || 'OK'
      };
    } else {
      // text/html response
      return {
        success: true,
        status: 'OK',
        confidence: 0,
        raw: parsed.data,
        message: typeof parsed.data === 'string' ? parsed.data.substring(0, 500) : 'OK'
      };
    }
  }
}

/**
 * Convenience wrapper: pass a File object (from input[type=file]) and it will call analyzeDisease
 * Usage in component:
 *   const result = await analyzeDiseaseFromFile(selectedFile, { debug: true });
 */
export async function analyzeDiseaseFromFile(file, opts = {}) {
  // create FormData fallback for initial attempt
  const fd = new FormData();
  fd.append('file', file, file.name || 'upload.jpg');
  // call analyzeDisease with either the FormData or the raw file (function handles both)
  return analyzeDisease(fd, opts);
}

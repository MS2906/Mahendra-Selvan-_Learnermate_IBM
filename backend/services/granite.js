/**
 * granite.js — IBM watsonx.ai REST client for Granite 4 H Small
 *
 * Uses IBM Cloud IAM token exchange then calls the
 * /ml/v1/text/chat endpoint (Chat API — required for Granite 4).
 * No extra SDKs required.
 */

const https = require("https");

const MODEL_ID = "ibm/granite-4-h-small"; // Granite 4 H Small (multitenant)

// ---------- IAM token cache ----------
let _iamToken = null;
let _iamExpiry = 0;

async function getIAMToken() {
  const now = Date.now();
  if (_iamToken && now < _iamExpiry - 60_000) return _iamToken;

  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    throw new Error("WATSONX_API_KEY is not configured. Open learnmate/backend/.env and add your IBM Cloud API key.");
  }

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  }).toString();

  let data;
  try {
    data = await httpPost(
      "iam.cloud.ibm.com",
      "/identity/token",
      { "Content-Type": "application/x-www-form-urlencoded" },
      body
    );
  } catch (err) {
    if (err.message.includes("BXNIM0415E") || err.message.includes("could not be found")) {
      throw new Error(
        "IBM Cloud API key is invalid or expired. Please update WATSONX_API_KEY in learnmate/backend/.env with a valid IBM Cloud API key."
      );
    }
    throw new Error(`IBM IAM authentication failed: ${err.message}`);
  }

  const json = JSON.parse(data);
  if (!json.access_token) {
    throw new Error(`IAM did not return an access token: ${JSON.stringify(json)}`);
  }
  _iamToken = json.access_token;
  _iamExpiry = now + json.expires_in * 1000;
  return _iamToken;
}

// ---------- low-level HTTPS helper ----------
function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () =>
          res.statusCode >= 400
            ? reject(new Error(`HTTP ${res.statusCode}: ${data}`))
            : resolve(data)
        );
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ---------- main generate function (Chat API) ----------
/**
 * @param {string} systemPrompt  - system instruction
 * @param {string} userPrompt    - user message / task
 * @param {object} [opts]
 * @param {number} [opts.maxTokens=1200]
 * @param {number} [opts.temperature=0.7]
 * @returns {Promise<string>} generated text
 */
async function generate(systemPrompt, userPrompt, { maxTokens = 1200, temperature = 0.7 } = {}) {
  const projectId = process.env.WATSONX_PROJECT_ID;
  if (!projectId || projectId.startsWith("your_")) {
    throw new Error("WATSONX_PROJECT_ID is not configured. Open learnmate/backend/.env and add your watsonx.ai project ID.");
  }

  const token = await getIAMToken();
  const baseUrl = new URL(process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com");

  const payload = JSON.stringify({
    model_id: MODEL_ID,
    project_id: projectId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  const path = "/ml/v1/text/chat?version=2024-10-08";
  let data;
  try {
    data = await httpPost(
      baseUrl.hostname,
      path,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      payload
    );
  } catch (err) {
    if (err.message.includes("404")) {
      throw new Error(
        `Model '${MODEL_ID}' not found. Verify it is available in your watsonx.ai project (us-south region). Check WATSONX_URL in .env.`
      );
    }
    if (err.message.includes("403")) {
      throw new Error("Access denied to watsonx.ai. Check that Watson Machine Learning is associated with your project.");
    }
    throw err;
  }

  const json = JSON.parse(data);
  // Chat API response: choices[0].message.content
  const content = json.choices?.[0]?.message?.content;
  if (content === undefined || content === null) {
    throw new Error(`Unexpected response from Granite: ${JSON.stringify(json)}`);
  }
  return content.trim();
}

module.exports = { generate };

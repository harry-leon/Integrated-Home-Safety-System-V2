/*
  ESP32 telemetry patch for Integrated-Home-Safety-System-V2

  Copy the blocks below into your existing sketch.
  This patch sends gas/LDR/PIR/weather data to the backend so the frontend
  dashboard can show live values from /api/devices.
*/

// =========================================================
// BACKEND TELEMETRY CONFIG
// Add near your other global constants
// =========================================================
const char* DEVICE_CODE = "SL-FRONT-001";
const char* BACKEND_TELEMETRY_URL = "http://192.168.1.10:8080/api/telemetry/report";

// =========================================================
// BACKEND TELEMETRY
// Add these helper functions near your other helpers
// =========================================================
void sendTelemetryToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[TEL] Skip telemetry - WiFi disconnected");
    return;
  }

  const int gasVal = analogRead(MQ2_PIN);
  const int ldrVal = analogRead(LDR_PIN);
  const int pirVal = digitalRead(PIR_PIN);

  HTTPClient http;
  http.begin(BACKEND_TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  JsonDocument doc;
  doc["deviceCode"] = DEVICE_CODE;
  doc["gasValue"] = gasVal;
  doc["ldrValue"] = ldrVal;
  doc["pirTriggered"] = (pirVal == HIGH);
  doc["temperature"] = weatherTemp;
  doc["weatherDesc"] = weatherDesc;

  String payload;
  serializeJson(doc, payload);

  const int httpCode = http.POST(payload);
  if (httpCode > 0) {
    Serial.printf("[TEL] POST %d | %s\n", httpCode, payload.c_str());
  } else {
    Serial.printf("[TEL] POST failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// =========================================================
// OPTIONAL: keep Blynk sensor writes and backend telemetry together
// Replace your current sendSensorData() with this version
// =========================================================
void sendSensorData() {
  const int g = analogRead(MQ2_PIN);
  Blynk.virtualWrite(V1, g);
  Blynk.virtualWrite(V2, g > GAS_THRESHOLD ? 255 : 0);
  sendTelemetryToBackend();
}

// =========================================================
// SETUP HOOK
// Make sure this interval exists in setup()
// You can keep the same 1000ms, or change to 3000ms if preferred
// =========================================================
/*
  timer.setInterval(3000L, sendSensorData);
*/

// =========================================================
// DEBUG HOOK
// Optional: add this line after WiFi connects in setup()
// =========================================================
/*
  Serial.printf("[NET] Backend telemetry -> %s\n", BACKEND_TELEMETRY_URL);
*/

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
// BLYNK DATASTREAM MAPPING (100% theo danh sach trong Blynk template)
// =========================================================
const int VPIN_RADIAL_GAUGE = V1;              // Radial Gauge (gas sensor)
const int VPIN_TEST_LED = 2;                   // TESTLED (pin 2)
const int VPIN_LDR_VALUE = V3;                 // LDR sensor
const int VPIN_PIR_VALUE = V4;                 // PIR sensor
const int VPIN_DOOR_CONTROL = V20;             // DOOR
const int VPIN_DOOR_STATUS = V30;              // DoorStatus
const int VPIN_ALERT_ENABLE = V40;             // ALERT_ENABLE
const int VPIN_TEMPERATURE = V50;              // Tempurature
const int VPIN_WEATHER_CONDITION = V51;        // Weather_Condition
const int VPIN_FINGER_ID = V100;               // Finger_ID
const int VPIN_REGISTER_FINGERPRINT = V101;    // Register FingerPrint
const int VPIN_DELETE_FINGERPRINT = V102;      // Delete FingerPrint
const int VPIN_DISPLAY = V103;                 // Display
const int VPIN_NAME = V104;                    // Name

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
  const int ldr = analogRead(LDR_PIN);
  const int pir = digitalRead(PIR_PIN);

  Blynk.virtualWrite(VPIN_RADIAL_GAUGE, g);
  Blynk.virtualWrite(VPIN_TEST_LED, g > GAS_THRESHOLD ? 255 : 0);
  Blynk.virtualWrite(VPIN_LDR_VALUE, ldr);
  Blynk.virtualWrite(VPIN_PIR_VALUE, pir);
  Blynk.virtualWrite(VPIN_TEMPERATURE, weatherTemp);
  Blynk.virtualWrite(VPIN_WEATHER_CONDITION, weatherDesc);

  sendTelemetryToBackend();
}

// =========================================================
// OPTIONAL: callbacks for control pins from Blynk app
// (merge into your existing callbacks/state variables)
// =========================================================
/*
bool gasAlertEnabled = true;

BLYNK_WRITE(V40) {
  gasAlertEnabled = param.asInt() == 1;
}

void publishDoorStatusToBlynk(bool isDoorOpened) {
  Blynk.virtualWrite(VPIN_DOOR_STATUS, isDoorOpened ? "Opened" : "Closed");
}
*/

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

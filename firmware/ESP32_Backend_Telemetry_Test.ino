// =============================================
// ESP32 TELEMETRY TEST - BLYNK + BACKEND
//
// Purpose:
// - Read MQ2, LDR, PIR from the real board.
// - Send values to Blynk virtual pins.
// - POST the same values directly to backend /api/telemetry/report.
//
// Backend DeviceReportDTO fields:
// - String deviceCode
// - Integer gasValue
// - Integer ldrValue
// - boolean pirTriggered
// - Double temperature
// - String weatherDesc
//
// Expected backend response: 202 Accepted
// =============================================

#define BLYNK_TEMPLATE_ID   "YOUR_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "YOUR_TEMPLATE_NAME"
#define BLYNK_AUTH_TOKEN    "YOUR_BLYNK_AUTH_TOKEN"

#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =========================================================
// HARDWARE PINS
// =========================================================
#define MQ2_PIN 35
#define LDR_PIN 34
#define PIR_PIN 27

// =========================================================
// THRESHOLDS
// =========================================================
#define GAS_THRESHOLD 1400

// =========================================================
// BLYNK VIRTUAL PINS
// =========================================================
#define VPIN_GAS 1
#define VPIN_GAS_LED 2
#define VPIN_LDR 3
#define VPIN_PIR 4

// =========================================================
// WIFI + BACKEND CONFIG
// =========================================================
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";

const char* DEVICE_CODE = "SL-FRONT-001";

// Change this IP to the IPv4 LAN address of the machine running Spring Boot.
// Keep :8080 and /api/telemetry/report unchanged.
const char* BACKEND_TELEMETRY_URL = "http://192.168.1.100:8080/api/telemetry/report";

// Optional fixed values for the current backend DTO.
// The real smart-lock sketch can keep using OpenWeather values instead.
double weatherTemp = 0.0;
String weatherDesc = "TEST";

BlynkTimer timer;

// =========================================================
// BACKEND TELEMETRY
// =========================================================
void sendTelemetryToBackend(int gasVal, int ldrVal, int pirVal) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[TEL] Skip - WiFi disconnected");
    return;
  }

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

  int httpCode = http.POST(payload);

  if (httpCode == 202) {
    Serial.printf("[TEL] Accepted (202) | %s\n", payload.c_str());
  } else if (httpCode > 0) {
    Serial.printf("[TEL] HTTP %d | %s\n", httpCode, payload.c_str());
  } else {
    Serial.printf("[TEL] Failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// =========================================================
// SENSOR READ + BLYNK + BACKEND
// =========================================================
void sendSensorData() {
  int gasVal = analogRead(MQ2_PIN);
  int ldrVal = analogRead(LDR_PIN);
  int pirVal = digitalRead(PIR_PIN);

  Blynk.virtualWrite(VPIN_GAS, gasVal);
  Blynk.virtualWrite(VPIN_GAS_LED, gasVal > GAS_THRESHOLD ? 255 : 0);
  Blynk.virtualWrite(VPIN_LDR, ldrVal);
  Blynk.virtualWrite(VPIN_PIR, pirVal == HIGH ? 1 : 0);

  sendTelemetryToBackend(gasVal, ldrVal, pirVal);

  Serial.printf(
    "[GAS]%d [LDR]%d [PIR]%d [BLYNK]V1/V3/V4 [BACKEND]%s\n",
    gasVal,
    ldrVal,
    pirVal,
    BACKEND_TELEMETRY_URL
  );
}

// =========================================================
// SETUP
// =========================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(MQ2_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);

  Serial.println();
  Serial.println("=== ESP32 Backend Telemetry Test ===");
  Serial.printf("[CFG] Device code: %s\n", DEVICE_CODE);
  Serial.printf("[CFG] Backend URL: %s\n", BACKEND_TELEMETRY_URL);

  WiFi.begin(ssid, pass);
  Serial.print("[WIFI] Connecting");

  unsigned long wifiStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 20000) {
    Serial.print(".");
    delay(500);
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WIFI] Connected: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("[WIFI] Failed - telemetry will be skipped until WiFi reconnects");
  }

  Blynk.config(auth);
  Blynk.connect(5000);

  if (Blynk.connected()) {
    Serial.println("[BLYNK] Connected");
  } else {
    Serial.println("[BLYNK] Not connected yet");
  }

  timer.setInterval(1000L, sendSensorData);
}

// =========================================================
// LOOP
// =========================================================
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Blynk.run();
  }

  timer.run();
}

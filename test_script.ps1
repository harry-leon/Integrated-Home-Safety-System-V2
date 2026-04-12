$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080"

Write-Host "1. Bypassing Login..."
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/test-token" -Method Get
$token = ($loginResponse.Content | ConvertFrom-Json).accessToken
Write-Host "Token received!"

Write-Host "2. Step-up Re-auth..."
$body = @{ password = "password" } | ConvertTo-Json
$reauthResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/re-auth" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" } -Body $body
$verificationToken = ($reauthResponse.Content | ConvertFrom-Json).verificationToken
Write-Host "Verification Token received!"

Write-Host "3. Sending Toggle Command to Offline Device (SL-BACK-002)..."
$deviceId = "33333333-4444-4444-4444-444444444444"
$toggleResponse = Invoke-WebRequest -Uri "$baseUrl/api/devices/$deviceId/lock/toggle" -Method Post -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token"; "X-Verification-Token" = $verificationToken } -Body "{}"
Write-Host "Command Queued ID: $($toggleResponse.Content)"

Write-Host "4. Simulating SL-BACK-002 coming online..."
$webhookResponse = Invoke-WebRequest -Uri "$baseUrl/api/integration/blynk/webhook?deviceCode=SL-BACK-002&pin=V0&value=1" -Method Get
Write-Host "Webhook triggered! Check Terminal logs!"

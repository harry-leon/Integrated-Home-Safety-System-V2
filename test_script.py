import urllib.request
import json

base_url = "http://localhost:8080"

try:
    # 1. Login
    data = json.dumps({"email": "admin@smartlock.com", "password": "password"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/auth/login", data=data, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    login_res = json.loads(res.read())
    token = login_res["token"]
    print("1. Logged in successfully!")

    # 2. Re-auth to get verification token
    req = urllib.request.Request(f"{base_url}/api/auth/re-auth", data=data, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    res = urllib.request.urlopen(req)
    reauth_res = json.loads(res.read())
    verification_token = reauth_res["verificationToken"]
    print("2. Step-up verification passed!")

    # 3. Send Toggle Command to Offline Device (Back Door)
    device_id = "33333333-4444-4444-4444-444444444444"
    req = urllib.request.Request(f"{base_url}/api/devices/{device_id}/lock/toggle", data=b"", headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "X-Verification-Token": verification_token
    })
    res = urllib.request.urlopen(req)
    print(f"3. Toggle Command Sent! (Command ID: {res.read().decode('utf-8')})")

    # 4. Trigger Blynk Webhook to simulate device coming online
    print("4. Simulating device 'SL-BACK-002' coming online...")
    device_code = "SL-BACK-002"
    req = urllib.request.Request(f"{base_url}/api/integration/blynk/webhook?deviceCode={device_code}&pin=V0&value=1")
    res = urllib.request.urlopen(req)
    print("Webhook successfully triggered! Check the Spring Boot console for processing logs.")

except Exception as e:
    print(f"Error occurred: {e}")

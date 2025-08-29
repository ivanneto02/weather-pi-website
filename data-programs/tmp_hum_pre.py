import smbus2
import bme280
import time
from datetime import datetime
from dotenv import load_dotenv
import os
import requests as re
from requests_aws4auth import AWS4Auth

load_dotenv()

ACCESS_KEY_ID = os.getenv("ACCESS_KEY_ID")
ACCESS_KEY_SECRET = os.getenv("ACCESS_KEY_SECRET")
REGION = os.getenv("REGION")
SERVICE = os.getenv("SERVICE")
URL = os.getenv("TMP_HUM_PRE_URL")
NUM_SAMPLES = int(os.getenv("NUM_SAMPLES"))

def parse_data(data):
    return {
        "pk": "sensor#default",
        "timestamp": str(int(time.time() * 1000)),
        "temperature": data[0],
        "humidity": data[1],
        "pressure": data[2],
    }

def collect_samples(device, i2c_bus, device_address, calibration_params):
    samples = list()
    for i in range(0, NUM_SAMPLES):
        data = None
        try:
            data = device.sample(i2c_bus, device_address, calibration_params)
        except Exception as e:
            time.sleep(3)
            print("[TMP_HUM_PRE] ERROR GATHERING SINGLE SAMPLE, CONTINUING", e)
            continue # DO NOT ADD DATA TO SAMPLES IF UNABLE TO COLLECT, BUT CONTINUE GATHERING SAMPLES
        sample = parse_data((data.temperature, data.humidity, data.pressure))
        samples.append(sample)
        time.sleep(3)
    return samples

def main():
    bme280_address = 0x76
    i2c_bus = smbus2.SMBus(1)
    calibration_params = bme280.load_calibration_params(bus=i2c_bus, address=bme280_address)

    auth = AWS4Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET, REGION, SERVICE)

    try:
        while True:
            samples = collect_samples(bme280, i2c_bus, bme280_address, calibration_params)

            try:
                res = re.put(
                        URL,
                        json={"data": samples},
                        auth=auth,
                )
                print("[TMP_HUM_PRE]", res.json())
            except Exception as e:
                print("[TMP_HUM_PRE] SKIPPING SAMPLE", e)
    except Exception as e:
        print(f"[TMP_HUM_PRE] ERROR GATHERING DATA, SHUTTING DOWN GRACEFULLY", e)
        # nothing will be sent to DynamoDB if error

if __name__ == "__main__":
    main()


import pms5003
import time
from dotenv import load_dotenv
import os
import requests as re
from requests_aws4auth import AWS4Auth

load_dotenv()

ACCESS_KEY_ID = os.getenv("ACCESS_KEY_ID")
ACCESS_KEY_SECRET = os.getenv("ACCESS_KEY_SECRET")
REGION = os.getenv("REGION")
SERVICE = os.getenv("SERVICE")
URL = os.getenv("AIR_QUAL_URL")
NUM_SAMPLES = int(os.getenv("NUM_SAMPLES"))

def parse_data(data):
    return {
        "pk" : "sensor#default",
        "timestamp": str(int(time.time() * 1000)),
        "PM1.0_1": data[0],
        "PM2.5_1": data[1],
        "PM10_1": data[2],
        "PM1.0_2": data[3],
        "PM2.5_2": data[4],
        "PM10_2": data[5],
        "count_03": data[6],
        "count_05": data[7],
        "count_10": data[8],
        "count_25": data[9],
        "count_50": data[10],
        "count_100": data[11],
    }

def collect_samples(device):
    samples = list()
    for i in range(0, NUM_SAMPLES):
        data = None
        try:
            data = device.read()
            # print(data)
        except Exception as e:
            print("[AIRQUAL] ERROR READING SENSOR", e)
            time.sleep(3)
            continue # DO NOT ADD DATA TO SAMPLES IF UNABLE TO COLLECT
        sample = parse_data(data.data)
        samples.append(sample)
        time.sleep(3)
    return samples

def main():
    pms5003_device = pms5003.PMS5003(device='/dev/serial0', baudrate=9600)

    auth = AWS4Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET, REGION, SERVICE)

    try:
        while True:
            samples = collect_samples(pms5003_device)

            try:
                res = re.put(
                        URL,
                        json={"data": samples},
                        auth=auth,
                )
                print("[AIRQUAL] ", res.json())
            except Exception as e:
                res = re.put(
                        URL,
                        json={"data": samples},
                        auth=auth,
                )
                print("[AIRQUAL] TRYING TO UPLOAD SAMPLE ONE MORE TIME")
    except Exception as e:
        print(f"[AIRQUAL] ERROR GATHERING ALL SAMPLES", e)
        # nothing will be sent to DynamoDB if error
    finally:
        try:
            if pms5003_device._serial:
                pms5003_device._serial.close()
        except Exception as e:
            print("[AIRQUAL] ERROR CLOSING PMS5003 SERIAL")
            pass

if __name__ == "__main__":
    main()


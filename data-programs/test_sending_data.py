import json
import requests as re
import random
from datetime import datetime
import time
from requests_aws4auth import AWS4Auth

def create_airqual_dummy_data(sleeptime):

    data = list()

    for i in range(0, 3):
        dummy = {
            "pk": str(datetime.timestamp(datetime.now())),
            "PM1.0_1": random.randint(0, 3),
            "PM2.5_1": random.randint(0, 3),
            "PM10_1": random.randint(0, 3),
            "PM1.0_2": random.randint(0, 3),
            "PM2.5_2": random.randint(0, 3),
            "PM10_2": random.randint(0, 3),
            "count_03": random.randint(100, 500),
            "count_05": random.randint(100, 500),
            "count_10": random.randint(10, 50),
            "count_25": random.randint(0, 3),
            "count_50": random.randint(0, 3),
            "count_50": random.randint(0, 3),
        }

        data.append(dummy)
        print(dummy)
        time.sleep(sleeptime)

    return data;

def create_dummy_temp_hum_pre_data(sleeptime):

    data = list()

    for i in range(0, 3):
        dummy = {
            "pk": str(datetime.timestamp(datetime.now())),
            "temperature": random.uniform(25.0, 40.0),
            "humidity": random.uniform(35.0, 45.0),
            "pressure": random.uniform(700.0, 1000.0),
        }

        data.append(dummy)
        print(dummy)
        time.sleep(sleeptime)

    return data;

def main():

    TMP_HUM_PRE_URL = "<redacted>"
    AIR_QUAL_URL = "<redacted>"

    SECRET_ID = "<redacted>"
    SECRET = "<redacted>"
    REGION = "us-west-1"
    SERVICE = "execute-api"

    auth = AWS4Auth(SECRET_ID, SECRET, REGION, SERVICE)

    temp_hum_pre_dummy_data = create_dummy_temp_hum_pre_data(sleeptime=0.1)
    # air_qual_dummy_data = create_airqual_dummy_data(sleeptime=0.1)

    try:
        res = re.put(
            TMP_HUM_PRE_URL,
            json={"data": temp_hum_pre_dummy_data},
            auth=auth
        )
        print(res.json())
    except Exception as e:
        print("Failed to send request", e)

if __name__ == "__main__":
    main()

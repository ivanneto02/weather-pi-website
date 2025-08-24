import smbus2
import bme280
import time
from datetime import datetime

def main():

    bme280_address = 0x76
    i2c_bus = smbus2.SMBus(1)
    calibration_params = bme280.load_calibration_params(bus=i2c_bus, address=bme280_address)

    while True:
        data = bme280.sample(i2c_bus, bme280_address, calibration_params)
        print(f"TIME={datetime.now()} TEMPERATURE={data.temperature}, HUMIDITY={data.humidity}, PRESSURE={data.pressure}")
        time.sleep(2)

if __name__ == "__main__":
    main()

import pms5003
import time
from datetime import datetime

def main():
    pms5003_device = pms5003.PMS5003(device='/dev/serial0', baudrate=9600)

    while True:
        try:
            data = pms5003_device.read()
            print(f"TIME={datetime.now()},DATA={data}")
        except:
            print(f"ERROR GATHERING")

        time.sleep(2)

if __name__ == "__main__":
    main()

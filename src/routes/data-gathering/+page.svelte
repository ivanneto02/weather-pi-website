<h1>Gathering Data</h1>

<br />

<h2>Real-Time Information</h2>

<p>
	A Raspberry Pi 1 was connected alongside PMS5003 and BME280 sensors to gather air quality,
	temperature, humidity, and pressure information from the environment in Riverside, CA, near UC
	Riverside.
</p>

<p>The data you see displayed in the homepage is real-time and gathered 10 seconds ago, at most.</p>

<br />
<h2>Crash-redundant Systems Programming</h2>

<h3>Crash recovery</h3>
<p>
	The Raspberry Pi runs a Raspberry Pi OS Lite to keep a lower CPU and memory load, and several
	scripts and systemd services were created to recover from crashes. All of this results in a 24-7
	data-gathering effort that can be implemented anywhere.
</p>

<p>
	Crashes and systemctl service stops causes an immediate Python script restart, and the data
	gathering process resumes. The Raspberry Pi is connected to a Uninterruptible Power Supply (UPS)
	to prevent loss of power.
</p>

<p>
	Lack of connection errors are handled through a robust Python, Exception-based programming.
	Exceptions are carefully placed so that samples remain in-memory throughout a lack of connection
	error.
</p>

<h3>DynamoDB Unproccessed Data</h3>
<p>
	The AWS Lambda function that uploads data to DynamoDB has built-in redundancy handled through an
	exponential "back off" method to upload data to DynamoDB in 25-sized BatchWriteCommand PUT
	requests. If any failure occurs in the upload, my lambda function retries the upload 5 times,
	waiting in exponential intervals (100ms, 200ms, 400ms, 800ms, ...). This ensures greatly improved
	chances that the upload request is successful.
</p>

<br />
<h2>Data Format</h2>

<p>The BME280 sensor gathers temperature, humidity, and pressure data, once per sample</p>

<p>BME280 data format:</p>

<ul>
	<li>temperature: float</li>
	<li>humidity: float</li>
	<li>pressure: float</li>
</ul>

<p>PMS5003 data format:</p>

<ul>
	<li>count_03: int</li>
	<li>count_05: int</li>
	<li>count_10: int</li>
	<li>count_25: int</li>
	<li>count_50: int</li>
	<li>PM1.0 factory: int</li>
	<li>PM2.5 factory: int</li>
	<li>PM10.0 factory: int</li>
	<li>PM1.0 outside: int</li>
	<li>PM2.5 outside: int</li>
	<li>PM10.0 outside: int</li>
</ul>

<p>
	Note: "factory" vs "outside" refers to the sensor calibration. Factory calibration is apt for
	indoor use, and "outside" calibration is for outdoor environments. This Raspberry Pi is currently
	deployed outdoors, so the "outside" measurement is the more representative one.
</p>

<h1>Gathering Data</h1>

<h2>Real-Time Information</h2>

<p>
	A Raspberry Pi 1 was connected alongside PMS5003 and BME280 sensors to gather air quality,
	temperature, humidity, and pressure information from the environment around the UC Riverside area
	in Riverside, CA.
</p>

<p>The data you see displayed in the homepage is real-time and gathered 10 seconds ago, at most.</p>

<h2>Serverless Architecture</h2>

<p>
	AWS DynamoDB was used to store time-series sensor data from the Raspberry Pi. An AWS API Gateway
	was utilized to keep the entire pipeline serverless. Lambda functions were used to format and
	store, as well as query the data from DynamoDB.
</p>

<h2>Crash-redundant Systems Programming</h2>

<p>
	The Raspberry Pi runs a Raspberry Pi OS Lite to keep a lower CPU and memory load, and several
	scripts and systemd services were created to recover from crashes. All of this results in a 24-7
	data-gathering effort that can be implemented anywhere.
</p>

<h2>Air Quality Data Format</h2>

<p>TODO</p>

<h2>Temperature, Humidity, Pressure Data Format</h2>

<p>TODO</p>

<div class="border-l-1 border-b-1 rounded border-indigo-800 p-5">
	<h2>Pressure Information</h2>

	<ul>
		<li>Sensor: BME280</li>
		<li>Unit: Pascal (Pa)</li>
		<li>Protocol: I2C</li>
		<li>Period: 3s</li>
		<li>Average: last 10 samples</li>
		<li>Location: Riverside, CA</li>
		<li>Device: Raspberry Pi 1 2012.11</li>
	</ul>

	<p>
		Pressure is gathered every 3 seconds, averaging the last 10 samples (30 seconds) to quickly
		display real-time data every 5 minutes.
	</p>

	<p>
		The sensor sits in my apartment, and its reading do not change very often. Changes in
		temperature and humidity can affect pressure. The eventual goal is to make this sensor predict
		when rain could be possible. Further, future work involves matching the pressure measurement to
		current altitude.
	</p>
</div>

<div class="border-l-1 border-b-1 rounded border-indigo-800 p-5">
	<h2>Humidity Information</h2>

	<ul>
		<li>Sensor: BME280</li>
		<li>Unit: Relative Humidity (%)</li>
		<li>Protocol: I2C</li>
		<li>Period: 3s</li>
		<li>Average: last 10 samples</li>
		<li>Location: Riverside, CA</li>
		<li>Device: Raspberry Pi 1 2011.12</li>
	</ul>
	<p>
		Humidity is gathered every 3 seconds, averaging the last 10 samples (30 seconds) to quickly
		display real-time data every 5 minutes.
	</p>

	<p>
		In this context, relative humidity percentage means how much water is in the air, relative to
		how much it can hold at a particular moment.
	</p>

	<p>
		The sensor sits in my apartment. Cooking, running the shower, portable AC, and air purifiers all
		affect the relative humidity of my apartment. I want to see how humidity numbers change over
		time, suggesting changes that need to be made to keep a healthy humidity (around 40%).
	</p>
</div>

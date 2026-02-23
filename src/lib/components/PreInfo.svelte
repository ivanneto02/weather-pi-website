<div class="flex w-full flex-row gap-3">
	<div class="basis-2/5 min-w-0 border-r border-white/10 pr-3">
		<h2 class="mt-0">Pressure Information</h2>
		<ul class="mt-1 pl-4">
			<li>Sensor: BME280</li>
			<li>Unit: Pascal (Pa)</li>
			<li>Protocol: I2C</li>
			<li>Period: 3s</li>
			<li>Average: last 10 samples</li>
			<li>Location: Riverside, CA</li>
			<li>Device: Raspberry Pi 1 2011.12</li>
		</ul>
	</div>

	<div class="basis-3/5 min-w-0 pl-1">
		<p class="mt-1">
			Pressure is gathered every 3 seconds, averaging the last 10 samples (30 seconds) to quickly
			display real-time data every 5 minutes.
		</p>

		<p class="mt-2">
			The sensor sits in my apartment, and its reading do not change very often. Changes in
			temperature and humidity can affect pressure. The eventual goal is to make this sensor predict
			when rain could be possible. Further, future work involves matching the pressure measurement
			to current altitude.
		</p>
	</div>
</div>

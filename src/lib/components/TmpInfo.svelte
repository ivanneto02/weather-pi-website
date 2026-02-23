<div class="flex w-full flex-row gap-3">
	<div class="basis-2/5 min-w-0 border-r border-white/10 pr-3">
		<h2 class="mt-0">Temperature Information</h2>
		<ul class="mt-1 pl-4">
			<li>Sensor: BME280</li>
			<li>Unit: Degrees Celcius (C)</li>
			<li>Protocol: I2C</li>
			<li>Period: 3s</li>
			<li>Average: last 10 samples</li>
			<li>Location: Riverside, CA</li>
			<li>Device: Raspberry Pi 1 2011.12</li>
		</ul>
	</div>

	<div class="basis-3/5 min-w-0 pl-1">
		<p class="mt-1">
			Temperature is gathered every 3 seconds, averaging the last 10 samples (30 seconds) to
			quickly display real-time data every 5 minutes.
		</p>

		<p class="mt-2">
			The sensor sits in my apartment, which I have been wanting to gather more information about.
			I want to know how quickly and during what intervals the temperatures are changing. Air
			conditioned keeps the apartment at an even 27C most of the time because of my pets. I seek
			to see what happens over periods of time when I'm not home.
		</p>
	</div>
</div>

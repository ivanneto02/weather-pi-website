<div class="flex h-full w-full flex-row items-center gap-3">
	<div class="flex h-full basis-2/5 min-w-0 flex-col items-center justify-center border-r border-white/10 pr-3 text-center">
		<h2 class="mt-0">Pressure Information</h2>
		<ul class="mt-1 w-fit pl-4 text-left">
			<li>Sensor: BME280</li>
			<li>Unit: Pascal (Pa)</li>
			<li>Protocol: I2C</li>
			<li>Period: 3s</li>
			<li>Displayed: latest sample</li>
			<li>Location: Riverside, CA</li>
			<li>Reference: Near UC Riverside (&lt; 1 mile)</li>
			<li>Device: Raspberry Pi 1 2011.12</li>
		</ul>
	</div>

	<div class="flex h-full basis-3/5 min-w-0 flex-col justify-center pl-1 text-center">
		<p class="mx-auto mt-1 max-w-prose">
			Pressure is gathered every 3 seconds and the dashboard displays the latest available sample, refreshed every 5 minutes.
		</p>

		<p class="mx-auto mt-2 max-w-prose">
			With the sensor deployed outdoors in Riverside, pressure trends better represent local weather
			changes near UC Riverside. Combined with temperature and humidity, this setup is more useful
			for spotting shifts that may indicate changing conditions.
		</p>
	</div>
</div>

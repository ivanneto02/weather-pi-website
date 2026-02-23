<div class="flex h-full w-full flex-row items-center gap-3">
	<div class="flex h-full basis-2/5 min-w-0 flex-col items-center justify-center border-r border-white/10 pr-3 text-center">
		<h2 class="mt-0">Humidity Information</h2>
		<ul class="mt-1 w-fit pl-4 text-left">
			<li>Sensor: BME280</li>
			<li>Unit: Relative Humidity (%)</li>
			<li>Protocol: I2C</li>
			<li>Period: 3s</li>
			<li>Average: last 10 samples</li>
			<li>Location: Riverside, CA</li>
			<li>Reference: Near UC Riverside (&lt; 1 mile)</li>
			<li>Device: Raspberry Pi 1 2011.12</li>
		</ul>
	</div>

	<div class="flex h-full basis-3/5 min-w-0 flex-col justify-center pl-1 text-center">
		<p class="mx-auto mt-1 max-w-prose">
			Humidity is gathered every 3 seconds, averaging the last 10 samples (30 seconds) to quickly
			display real-time data every 5 minutes.
		</p>

		<p class="mx-auto mt-2 max-w-prose">
			In this context, relative humidity percentage means how much water is in the air, relative to
			how much it can hold at a particular moment.
		</p>

		<p class="mx-auto mt-2 max-w-prose">
			Because the node is now deployed outdoors, these humidity readings reflect surrounding ambient
			air rather than indoor activity. This makes trends more useful for tracking local weather
			shifts near UC Riverside over time.
		</p>
	</div>
</div>

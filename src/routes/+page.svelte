<script lang="ts">
	import TempChart from '$lib/components/TempChart.svelte';
	import PreChart from '$lib/components/PreChart.svelte';
	import HumChart from '$lib/components/HumChart.svelte';
	import AirQualityChart from '$lib/components/AirQualityChart.svelte';
	import ThreeLinesChart from '$lib/components/ThreeLinesChart.svelte';
	import AirQualityParticlesChart from '$lib/components/AirQualityParticlesChart.svelte';

	import { onMount } from 'svelte';
	import { getCurrentDateString } from '$lib/date/getCurrentDateString.ts';
	import { meanAirQualityData } from '$lib/processing/meanAirQualityData.ts';
	import { meanTmpHumPreData } from '$lib/processing/meanTmpHumPreData';

	let tmpHumPreData: Array<any> | null = null;

	let airQualityData: Array<any> | null = null;

	// temperature, humidity, pressure data
	let tmp: number | null = null;
	let hum: number | null = null;
	let pre: number | null = null;

	// particle count
	let count_03: number | null = null;
	let count_05: number | null = null;
	let count_10: number | null = null;
	let count_25: number | null = null;
	let count_50: number | null = null;
	let count_100: number | null = null;

	// harmful particles
	let PM1_0_1: number | null = null;
	let PM1_0_2: number | null = null;
	let PM2_5_1: number | null = null;
	let PM2_5_2: number | null = null;
	let PM10_1: number | null = null;
	let PM10_2: number | null = null;

	let dt = getCurrentDateString();

	async function fetchAirQualityData() {
		let response = fetch('https://jbn6u8l8h7.execute-api.us-west-1.amazonaws.com/prod/samples', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((response) => {
				if (!response.ok) {
					console.log('Unable to retrieve data');
				}
				return response.json();
			})
			.then((response) => {
				// UPDATE UI
				airQualityData = response;
				let processed_response = meanAirQualityData(response);
				count_03 = processed_response.count_03.toFixed(2);
				count_05 = processed_response.count_05.toFixed(2);
				count_10 = processed_response.count_10.toFixed(2);
				count_25 = processed_response.count_25.toFixed(2);
				count_50 = processed_response.count_50.toFixed(2);
				count_100 = processed_response.count_100.toFixed(2);
			});
	}

	async function fetchTmpHumPreData() {
		let response = fetch('https://93xdazuw09.execute-api.us-west-1.amazonaws.com/prod/samples', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((response) => {
				if (!response.ok) {
					console.log('Unable to retrieve data');
				}
				return response.json();
			})
			.then((response) => {
				// UPDATE UI, only last 5 minutes mean
				tmpHumPreData = response;
				let processedTmpHumPreData = meanTmpHumPreData(response.slice(0, 10));
				tmp = processedTmpHumPreData.temperature;
				hum = processedTmpHumPreData.humidity;
				pre = processedTmpHumPreData.pressure;
			});
	}

	onMount(() => {
		dt = getCurrentDateString();
		fetchTmpHumPreData();
		fetchAirQualityData();

		const clock = setInterval(() => {
			dt = getCurrentDateString();
		}, 1000);
		const tmpHumPreData = setInterval(fetchTmpHumPreData, 300000);
		const airQualityData = setInterval(fetchAirQualityData, 300000);

		return () => {
			clearInterval(clock);
			clearInterval(tmpHumPreData);
			clearInterval(airQualityData);
		};
	});
</script>

<h1>WeatherPI Data Viewer</h1>

<p>{dt.dayName}, {dt.month} {dt.day}, {dt.year} ({dt.thour}:{dt.minute}:{dt.second} {dt.ampm})</p>

<h3>Mean values in the last 10 minutes:</h3>

<div class="flex flex-row gap-1 mb-1">
	<TempChart reading={tmp} />
	<HumChart reading={hum} />
	<PreChart reading={pre} />
</div>

<ThreeLinesChart data={tmpHumPreData} />

<h2>Air Quality</h2>

<div class="mb-5">
	<p class="text-red-600">key = calibration for indoors</p>
	<p class="text-indigo-500">key = calibration for outdoors</p>
</div>

<div class="flex flex-col gap-1">
	<div class="flex flex-row gap-1">
		<AirQualityChart reading={count_03} title={'0.3 µm³ count per 0.1L'} />
		<div class="flex flex-row gap-1">
			<AirQualityChart color="text-red-600" reading={PM1_0_1} title={'PM1.0'} />
			<AirQualityChart color="text-indigo-500" reading={PM1_0_2} title={'PM1.0'} />
		</div>
	</div>
	<div class="flex flex-row gap-1">
		<AirQualityChart reading={count_05} title={'0.5 µm³ count per 0.1L'} />
		<div class="flex flex-row gap-1">
			<AirQualityChart color="text-red-600" reading={PM2_5_1} title={'PM2.5'} />
			<AirQualityChart color="text-indigo-500" reading={PM2_5_2} title={'PM2.5'} />
		</div>
	</div>
	<div class="flex flex-col gap-1">
		<div class="flex flex-row gap-1">
			<AirQualityChart color="text-red-600" reading={PM10_1} title={'PM10'} />
			<AirQualityChart color="text-indigo-600" reading={PM10_2} title={'PM10'} />
		</div>
		<AirQualityChart reading={count_10} title={'1.0 µm³ count per 0.1L'} />
	</div>
	<div class="flex flex-row gap-1">
		<AirQualityChart reading={count_25} title={'2.5 µm³ count per 0.1L'} />
	</div>
	<div class="flex flex-row gap-1">
		<AirQualityChart reading={count_50} title={'5.0 µm³ count per 0.1L'} />
	</div>
	<div class="flex flex-row gap-1">
		<AirQualityChart reading={count_100} title={'10.0 µm³ count per 0.1L'} />
	</div>
</div>

<AirQualityParticlesChart data={airQualityData} />

<div>Future: will contain counts for heavy metal particles, contaminants, etc.</div>

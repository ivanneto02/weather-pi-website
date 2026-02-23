<script lang="ts">
	import AirQualityChart from '$lib/components/AirQualityChart.svelte';
	import TemperatureLineChart from '$lib/components/TemperatureLineChart.svelte';
	import HumidityLineChart from '$lib/components/HumidityLineChart.svelte';
	import PressureLineChart from '$lib/components/PressureLineChart.svelte';
	import AirQualityParticlesChart from '$lib/components/AirQualityParticlesChart.svelte';
	import TmpHumPreAndReadingChart from '$lib/components/TmpHumPreAndReadingChart.svelte';

	import { onMount } from 'svelte';
	import { getCurrentDateString } from '$lib/date/getCurrentDateString.ts';
	import { meanAirQualityData } from '$lib/processing/meanAirQualityData.ts';
	import { on } from 'svelte/events';
	import { HTP_ENDPOINT, AQ_ENDPOINT } from '$lib/config/endpoints';

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
	let showHumidityChart = false;
	let showPressureChart = false;
	let latestSampleTimestamp: number | null = null;

	async function fetchAirQualityData() {
		let response = fetch(AQ_ENDPOINT, {
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
		const url = `${HTP_ENDPOINT}?latest=1`;
		let response = fetch(url, {
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
				const latest = Array.isArray(response) ? response[0] : null;
				tmp = latest ? Number(latest.temperature) : null;
				hum = latest ? Number(latest.humidity) : null;
				pre = latest ? Number(latest.pressure) : null;
				latestSampleTimestamp = latest ? Number(latest.timestamp) : null;
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

<section class="hero">
	<div class="hero__left">
		<p class="eyebrow">WeatherPI</p>
		<h1>Weather & Air Monitor</h1>
		<p class="hero__sub">Real-time readings from Riverside, CA</p>
		<div class="hero__status">
			<span class="status-dot"></span>
			<span>Live</span>
			<span class="hero__time">
				{dt.dayName}, {dt.month}
				{dt.day}, {dt.year} · {dt.thour}:{dt.minute}:{dt.second}
				{dt.ampm}
			</span>
		</div>
	</div>
</section>

<section class="mean-block">
	<div class="mean-card__header">
		<h3>Latest readings</h3>
		<p class="mean-card__timestamp">
			Latest sample:
			{latestSampleTimestamp ? new Date(latestSampleTimestamp).toLocaleString() : 'loading...'}
		</p>
	</div>
	<TmpHumPreAndReadingChart {tmp} {hum} {pre} />
</section>

<section class="chart-block">
	<div class="chart-block__header"></div>
	<TemperatureLineChart
		on:ready={() => {
			showHumidityChart = true;
		}}
	/>
	{#if showHumidityChart}
		<HumidityLineChart
			on:ready={() => {
				showPressureChart = true;
			}}
		/>
	{/if}
	{#if showPressureChart}
		<PressureLineChart />
	{/if}
</section>

<section class="flex flex-col gap-4">
	<div class="flex flex-col gap-1">
		<h2>Air Quality</h2>
		<p class="text-sm text-gray-300">
			Calibrations shown side-by-side for indoor vs outdoor tuning.
		</p>
	</div>

	<div class="measurement-key">
		<div class="key-item">
			<span class="legend-dot legend-dot--count"></span>
			<div>
				<p class="key-title">Particle count (µm³ / 0.1L)</p>
				<p class="key-desc">Number of particles of each size bucket per 0.1L of air.</p>
			</div>
		</div>
		<div class="key-item">
			<span class="legend-dot legend-dot--indoor"></span>
			<div>
				<p class="key-title">PM (indoor)</p>
				<p class="key-desc">Mass concentration calibrated for indoor environments.</p>
			</div>
		</div>
		<div class="key-item">
			<span class="legend-dot legend-dot--outdoor"></span>
			<div>
				<p class="key-title">PM (outdoor)</p>
				<p class="key-desc">Mass concentration calibrated for outdoor environments.</p>
			</div>
		</div>
	</div>

	<div class="grid gap-4">
		<div class="section-card">
			<div class="section-header">
				<h3>Particle Count</h3>
				<span class="badge badge-count">counts / 0.1L</span>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<AirQualityChart color="text-emerald-300" reading={count_03} title={'0.3 µm³'} />
				<AirQualityChart color="text-emerald-300" reading={count_05} title={'0.5 µm³'} />
				<AirQualityChart color="text-emerald-300" reading={count_10} title={'1.0 µm³'} />
				<AirQualityChart color="text-emerald-300" reading={count_25} title={'2.5 µm³'} />
				<AirQualityChart color="text-emerald-300" reading={count_50} title={'5.0 µm³'} />
				<AirQualityChart color="text-emerald-300" reading={count_100} title={'10.0 µm³'} />
			</div>
		</div>

		<div class="section-card">
			<div class="section-header">
				<h3>PM (Indoor)</h3>
				<span class="badge badge-indoor">indoor calibration</span>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<AirQualityChart color="text-red-400" reading={PM1_0_1} title={'PM1.0'} />
				<AirQualityChart color="text-red-400" reading={PM2_5_1} title={'PM2.5'} />
				<AirQualityChart color="text-red-400" reading={PM10_1} title={'PM10'} />
			</div>
		</div>

		<div class="section-card">
			<div class="section-header">
				<h3>PM (Outdoor)</h3>
				<span class="badge badge-outdoor">outdoor calibration</span>
			</div>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<AirQualityChart color="text-indigo-300" reading={PM1_0_2} title={'PM1.0'} />
				<AirQualityChart color="text-indigo-300" reading={PM2_5_2} title={'PM2.5'} />
				<AirQualityChart color="text-indigo-300" reading={PM10_2} title={'PM10'} />
			</div>
		</div>
	</div>
</section>

<!-- <AirQualityParticlesChart data={airQualityData} /> -->

<style>
	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 9999px;
		display: inline-block;
		box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.03);
	}

	.legend-dot--indoor {
		background: #f87171;
	}

	.legend-dot--outdoor {
		background: #93c5fd;
	}

	.legend-dot--count {
		background: #34d399;
	}

	.measurement-key {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem 1rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.04);
	}

	.key-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: start;
		color: #e5e7eb;
	}

	.key-title {
		font-weight: 600;
		color: #f8fafc;
		margin: 0;
	}

	.key-desc {
		margin: 0.15rem 0 0;
		font-size: 0.875rem;
		color: #cbd5e1;
	}

	.section-card {
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 14px;
		padding: 1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #f8fafc;
	}

	.badge-count {
		background: rgba(52, 211, 153, 0.15);
		border: 1px solid rgba(52, 211, 153, 0.35);
		color: #bbf7d0;
	}

	.badge-indoor {
		background: rgba(248, 113, 113, 0.15);
		border: 1px solid rgba(248, 113, 113, 0.35);
		color: #fecdd3;
	}

	.badge-outdoor {
		background: rgba(147, 197, 253, 0.15);
		border: 1px solid rgba(147, 197, 253, 0.35);
		color: #dbeafe;
	}

	.hero {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		align-items: center;
	}

	.hero__left h1 {
		font-size: clamp(1.8rem, 2.4vw, 2.4rem);
		margin: 0.25rem 0;
	}

	.hero__sub {
		color: #cbd5e1;
		margin: 0;
	}

	.hero__status {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-top: 0.75rem;
		padding-left: 0.35rem;
		font-weight: 600;
		color: #e2e8f0;
		overflow: visible;
	}

	.hero__time {
		color: #94a3b8;
		font-weight: 500;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		flex-shrink: 0;
		border-radius: 9999px;
		background: #22c55e;
		box-shadow:
			0 0 0 4px rgba(34, 197, 94, 0.16),
			0 0 10px rgba(34, 197, 94, 0.45);
		animation: livePulse 2.8s ease-in-out infinite;
	}

	@keyframes livePulse {
		0%,
		100% {
			background: #166534;
			box-shadow:
				0 0 0 4px rgba(34, 197, 94, 0.14),
				0 0 8px rgba(34, 197, 94, 0.35);
		}
		50% {
			background: #22c55e;
			box-shadow:
				0 0 0 4px rgba(34, 197, 94, 0.16),
				0 0 10px rgba(34, 197, 94, 0.45);
		}
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.8rem;
		color: #94a3b8;
		margin: 0;
	}

	.mean-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #e5e7eb;
		font-weight: 600;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.mean-card__timestamp {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 500;
		color: #94a3b8;
	}

	.mean-block {
		background: #000;
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 14px;
		padding: 1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
		margin-top: 1rem;
	}

	.chart-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.chart-block__header h3 {
		margin: 0;
	}

	.chart-block__hint {
		margin: 0.1rem 0 0;
		color: #94a3b8;
		font-size: 0.95rem;
	}
</style>

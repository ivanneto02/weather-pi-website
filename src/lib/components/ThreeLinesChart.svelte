<script lang="ts">
	import ChartAndSelector from './ChartAndSelector.svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { HTP_ENDPOINT } from '$lib/config/endpoints';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	type Row = {
		temperature: number;
		timestamp: string;
		pk: string;
		humidity: number;
		pressure: number;
	};

	let { data = [] }: { data: Row[] } = $props();
	let showHumidity = $state(false);
	let showPressure = $state(false);

	const dataSeries = $derived(
		data
			? data.map((row, i) => ({
					index: i,
					timestamp: +row.timestamp,
					temperature: +row.temperature,
					humidity: +row.humidity,
					pressure: +row.pressure
				}))
			: []
	);

	const xScale = scaleTime();
	const yScale = scaleLinear();
</script>

<ChartAndSelector
	{dataSeries}
	{xScale}
	{yScale}
	measurement="temperature"
	title="Temperature"
	initialWindow="1h"
	endpoint={HTP_ENDPOINT}
	samples={600}
	bottom_axis_label="time"
	left_axis_label="Temperature (C)"
	spline_stroke_color="stroke-purple-700"
	tooltip_label_name="Temperature"
	tooltip_label_units="C"
	tooltip_label_round={2}
	on:ready={() => {
		showHumidity = true;
	}}
/>

{#if showHumidity}
	<ChartAndSelector
		{dataSeries}
		{xScale}
		{yScale}
		measurement="humidity"
		title="Relative Humidity"
		initialWindow="1h"
		endpoint={HTP_ENDPOINT}
		samples={600}
		bottom_axis_label="time"
		left_axis_label="Humidity"
		spline_stroke_color="stroke-red-500"
		tooltip_label_name="Relative Humidity"
		tooltip_label_units="(%)"
		tooltip_label_round={2}
		on:ready={() => {
			showPressure = true;
		}}
	/>
{/if}

{#if showPressure}
	<ChartAndSelector
		{dataSeries}
		{xScale}
		{yScale}
		measurement="pressure"
		title="Pressure"
		initialWindow="1h"
		endpoint={HTP_ENDPOINT}
		samples={600}
		bottom_axis_label="time"
		left_axis_label="Pressure (hPa)"
		spline_stroke_color="stroke-blue-500"
		tooltip_label_name="Pressure"
		tooltip_label_units="hPa"
		tooltip_label_round={2}
	/>
{/if}

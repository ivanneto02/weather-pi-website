<script lang="ts">
	import ChartAndSelector from './ChartAndSelector.svelte';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { HTP_ENDPOINT } from '$lib/config/endpoints';

	const xScale = scaleTime();
	const yScale = scaleLinear();
</script>

<ChartAndSelector
	dataSeries={[]}
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
	on:ready
/>

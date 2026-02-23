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
	on:ready
/>

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
	on:ready
/>

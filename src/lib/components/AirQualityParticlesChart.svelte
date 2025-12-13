<script lang="ts">
	import { Svg, Axis, Spline, Chart, Highlight, Legend } from 'layerchart';
	import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
	import { curveBumpX } from 'd3-shape';
	import ChartAndSelector from './ChartAndSelector.svelte';

	type Row = {
		timestamp: string;
		count_03: number;
		count_05: number;
		count_10: number;
		count_25: number;
		count_50: number;
		count_100: number;
	};

	export let data: Row[] = [];

	$: dataSeries = data
		? data.map((row, i) => ({
				index: i,
				timestamp: +row.timestamp,
				count_03: +row.count_03,
				count_05: +row.count_05,
				count_10: +row.count_10,
				count_25: +row.count_25,
				count_50: +row.count_50,
				count_100: +row.count_100
			}))
		: [];

	const xScale = scaleTime();
	const yScale = scaleLinear();
</script>

<ChartAndSelector title="Particle Count Over Time" let:selectedWindow>
	<div class="h-[25px] p-4 rounded bg-black" data-window={selectedWindow}>
		<Chart
			data={[{ name: '0.30 µm³' }, { name: '0.50 µm³' }, { name: '1.00 µm³' }]}
			c="name"
			cScale={scaleOrdinal()}
			cRange={['var(--color-red-800)', 'var(--color-green-800)', 'var(--color-blue-800)']}
		>
			<Legend class="text-xs" placement="top" variant="swatches" />
		</Chart>
	</div>
	<div class="h-[25px] p-4 rounded bg-black" data-window={selectedWindow}>
		<Chart
			data={[{ name: '2.50 µm³' }, { name: '5.00 µm³' }, { name: '10.0 µm³' }]}
			c="name"
			cScale={scaleOrdinal()}
			cRange={['var(--color-white)', 'var(--color-indigo-800)', 'var(--color-pink-800)']}
		>
			<Legend class="text-xs" placement="top" variant="swatches" />
		</Chart>
	</div>

	<div class="h-[500px] p-4 rounded bg-black" data-window={selectedWindow}>
		<Chart
			data={dataSeries}
			x={(d) => new Date(d.timestamp)}
			y={(d) => d.count_03.toFixed(2)}
			{xScale}
			yDomain={[0, null]}
			{yScale}
			padding={{ left: 60, bottom: 34, top: 16, right: 16 }}
			yNice
		>
			<Svg>
				<Axis
					placement="left"
					tickLabelProps={{ class: 'text-sm text-blue' }}
					grid
					rule
					label="count (number of particles)"
				/>
				<Axis
					labelProps={{ class: 'text-sm text-blue' }}
					placement="bottom"
					rule
					class="text-white stroke-blue-200"
					label="time"
				/>
				<Spline class="stroke-red-800 stroke-2" y={'count_03'} curve={curveBumpX} draw />
				<Spline class="stroke-green-800 stroke-2" y={'count_05'} curve={curveBumpX} draw />
				<Spline class="stroke-blue-800 stroke-2" y={'count_10'} curve={curveBumpX} draw />
				<Spline class="stroke-white stroke-2" y={'count_25'} curve={curveBumpX} draw />
				<Spline class="stroke-indigo-800 stroke-2" y={'count_50'} curve={curveBumpX} draw />
				<Spline class="stroke-pink-800 stroke-2" y={'count_100'} curve={curveBumpX} draw />
				<Highlight points lines />
			</Svg>
		</Chart>
	</div>
</ChartAndSelector>

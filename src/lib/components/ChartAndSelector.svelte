<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import TimeWindowSelector from './TimeWindowSelector.svelte';

	import { Chart, Svg, Axis, Spline, Highlight, Tooltip } from 'layerchart';
	import { format } from 'date-fns';
	import { curveBumpX } from 'd3-shape';

	let {
		dataSeries = [],
		xScale,
		yScale,
		measurement = 'none',
		title = '',
		initialWindow = '1h',
		bottom_axis_label = '',
		left_axis_label = '',
		spline_stroke_color = 'white',
		tooltip_label_name = 'none',
		tooltip_label_units = 'hPa',
		tooltip_label_round = 1,
		samples = 20,
		endpoint = '/api/samples/latest'
	} = $props();

	const dispatch = createEventDispatcher<{ select: string }>();

	let selectedWindow = initialWindow;
	let chartData = dataSeries;

	onMount(() => {
		fetchWindow(selectedWindow);
	});

	$: if (dataSeries && dataSeries !== chartData) {
		chartData = dataSeries;
	}

	async function fetchWindow(windowValue: string) {
		const url = `${endpoint}?window=${windowValue}&samples=${samples}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
			const payload = await response.json();
			chartData = Array.isArray(payload) ? payload : payload?.data ?? stubData(windowValue);
		} catch (error) {
			chartData = stubData(windowValue);
		}
	}

	function handleSelect(event: CustomEvent<string>) {
		selectedWindow = event.detail;
		dispatch('select', selectedWindow);
		fetchWindow(selectedWindow);
	}

	const formatValue = (value: number) => value?.toFixed(tooltip_label_round);

	function stubData(windowValue: string) {
		const now = Date.now();
		const stepMs = 60_000;
		return Array.from({ length: samples }, (_, idx) => {
			const ts = now - (samples - idx) * stepMs;
			const base = 20 + Math.sin(idx / 3) * 5;
			return {
				timestamp: ts,
				temperature: base,
				humidity: 40 + base / 2,
				pressure: 1000 + base / 10,
				count_03: base,
				count_05: base * 0.8,
				count_10: base * 0.6,
				count_25: base * 0.4,
				count_50: base * 0.2,
				count_100: base * 0.1
			};
		});
	}
</script>

<div class="flex flex-col gap-2 pb-6">
	{#if title}
		<h2 class="text-center">{title}</h2>
	{/if}

	<slot {selectedWindow} />

	<div class="h-[250px] p-4 rounded bg-black" data-window={selectedWindow}>
		<Chart
			data={chartData}
			x={(d) => new Date(d.timestamp)}
			y={(d) => (d?.[measurement] ?? 0).toFixed(tooltip_label_round)}
			{xScale}
			{yScale}
			padding={{ left: 60, bottom: 34, top: 16, right: 16 }}
			yNice
			tooltip={{ mode: 'voronoi' }}
		>
			<Svg>
				<Axis
					placement="left"
					tickLabelProps={{ class: 'text-sm text-blue' }}
					grid
					rule
					label={left_axis_label}
				/>
				<Axis
					labelProps={{ class: 'text-sm text-blue' }}
					placement="bottom"
					rule
					class="text-white stroke-blue-200"
					label={bottom_axis_label}
				/>
				<Spline class={`${spline_stroke_color} stroke-2`} curve={curveBumpX} draw />
				<Highlight points lines />
			</Svg>

			<!-- Differs from the docs, using a snippet instead to pass in 
        children and avoid invalid_default_snippet runtime error -->
			<Tooltip.Root>
				{#snippet children(ctx)}
					<Tooltip.Header
						>{format(new Date(ctx?.data.timestamp), 'eee, MMM do, hh:mm:ss')}</Tooltip.Header
					>
					<Tooltip.List>
						<Tooltip.Item
							label={tooltip_label_name}
							value={`${formatValue(ctx?.data?.[measurement])} ${tooltip_label_units}`}
						/>
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		</Chart>
	</div>

	<TimeWindowSelector selectedValue={selectedWindow} on:select={handleSelect} />
</div>

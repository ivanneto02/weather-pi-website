<h1>Building this website</h1>

<br />

<p>
	This website is built with Svelte, tailwind, and inconify. AWS DynamoDB was used for data
	gathering and querying.
</p>

<br />

<h2>Serverless Architecture</h2>

<p>
	AWS DynamoDB was used to store time-series sensor data from the Raspberry Pi. An AWS API Gateway
	was utilized to keep the entire pipeline serverless. Lambda functions were used to format and
	store, as well as query the data from DynamoDB.
</p>

<p>The following AWS resources were used:</p>

<ul>
	<li>AWS DynamoDB</li>
	<li>AWS API Gateway</li>
	<li>AWS Lambda</li>
	<li>AWS IAM</li>
</ul>

<br />

<h2>Svelte Frontend</h2>

<p>
	SvelteKit is extremely efficient in getting production-ready projects in a full-stack environment.
	This website displays the important information from the PMS5003 and BME280 sensors in a sensible
	manner.
</p>

<p>
	Layerchart was used to display the data, 600 samples at a time. Over time, more layerchart
	features will be added, such as over-time data.
</p>

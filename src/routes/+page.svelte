<script>
	import { onMount } from 'svelte';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
</script>

<main>
	<section>
		<div class="container">
			<h1>Excalivault</h1>
			<p>Your Excalidraw vault is ready!</p>
			{#if mounted}
				<p>Extension loaded successfully</p>
			{/if}
		</div>
	</section>
</main>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
		min-height: 200px;
	}
	
	h1 {
		font-size: 24px;
		margin-bottom: 10px;
	}
	
	p {
		color: #666;
		font-size: 14px;
	}
</style>
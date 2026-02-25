<script lang="ts">
    import "../../app.css";
    let count = $state(0);
</script>

<div class="p-4 min-w-80 bg-red-200 rounded-box">
    <h1 class="text-2xl font-bold mb-4">Excalivault</h1>
    <p class="mb-4">Personal vault for storing Excalidraws</p>
    <div class="flex gap-2">
        <button onclick={() => count++}>
            Counde: {count}
        </button>
    </div>
</div>

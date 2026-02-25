<script lang="ts">
  let count = $state(0);
</script>

<div class="p-4 min-w-80 bg-base-200 rounded-box">
  <h1 class="text-2xl font-bold mb-4">Excalivault</h1>
  <p class="mb-4">Personal vault for storing Excalidraws</p>  
  <div class="flex gap-2">
    <button class="btn btn-primary" onclick={() => count++}>
      Count: {count}
    </button>
  </div>
</div>

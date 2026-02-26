<script lang="ts">
  import { captureException } from "$lib/services/sentry";

  function testError() {
    try {
      throw new Error("Sentry Test Error from Options Page");
    } catch (error) {
      captureException(error as Error);
    }
  }
</script>

<div class="bg-base-200 min-h-screen p-6">
  <h1 class="mb-6 text-3xl font-bold">Excalivault Options</h1>
  <p class="text-lg">Settings page placeholder</p>
  <button
    onclick={testError}
    class="bg-error hover:bg-error/80 mt-4 rounded px-4 py-2 text-white"
  >
    Test Sentry Error
  </button>
</div>

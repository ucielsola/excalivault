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

<div class="p-6 bg-base-200 min-h-screen">
  <h1 class="text-3xl font-bold mb-6">Excalivault Options</h1>
  <p class="text-lg">Settings page placeholder</p>
  <button
    onclick={testError}
    class="mt-4 px-4 py-2 bg-error text-white rounded hover:bg-error/80"
  >
    Test Sentry Error
  </button>
</div>

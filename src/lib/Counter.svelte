<script lang="ts">
  import { scan } from "./scanner/action";

  export let count = 0;
  export let step = 1;

  function increment() {
    count += step;
  }

  $: props = { count, step };
</script>

<div
  use:scan={{ props, componentName: "Counter" }}
  class="p-4 border rounded-lg shadow-sm"
>
  <h2 class="text-lg font-semibold mb-2">Counter Component</h2>
  <p class="mb-4">Current count: {count}</p>
  <button
    on:click={increment}
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
  >
    Increment by {step}
  </button>
</div>

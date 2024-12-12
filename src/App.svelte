<script lang="ts">
  import Counter from "./lib/Counter.svelte";
  import { options } from "./lib/scanner";

  let step1 = 1;
  let step2 = 2;

  function updateStep1() {
    step1 = Math.floor(Math.random() * 5) + 1;
  }

  function updateStep2() {
    step2 = Math.floor(Math.random() * 5) + 1;
  }
</script>

<main class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Svelte Rerender Scanner Demo</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    <Counter count={0} step={step1} />
    <Counter count={10} step={step2} />
  </div>

  <div class="flex gap-4">
    <button
      on:click={updateStep1}
      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
    >
      Randomize Counter 1 Step
    </button>
    <button
      on:click={updateStep2}
      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
    >
      Randomize Counter 2 Step
    </button>
  </div>

  <div class="mt-8">
    <h2 class="text-xl font-semibold mb-4">Scanner Options</h2>
    <label class="flex items-center gap-2 mb-2">
      <input type="checkbox" bind:checked={$options.playSound} />
      Play Sound on Rerender
    </label>
    <label class="flex items-center gap-2 mb-2">
      <input type="checkbox" bind:checked={$options.log} />
      Log Rerenders to Console
    </label>
  </div>
</main>

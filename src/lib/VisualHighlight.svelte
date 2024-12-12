<script lang="ts">
  import { onMount } from "svelte";
  import playSound from "./SoundPlayer.svelte";

  let observer: MutationObserver;

  function highlightElement(element: Element) {
    const outline = document.createElement("div");
    outline.style.position = "absolute";
    outline.style.border = "2px solid #ff0000";
    outline.style.borderRadius = "3px";
    outline.style.pointerEvents = "none";
    outline.style.transition = "opacity 500ms ease-out";
    outline.style.zIndex = "10000";

    const rect = element.getBoundingClientRect();
    outline.style.left = rect.left + window.scrollX + "px";
    outline.style.top = rect.top + window.scrollY + "px";
    outline.style.width = rect.width + "px";
    outline.style.height = rect.height + "px";

    document.body.appendChild(outline);

    // Fade out and remove
    setTimeout(() => {
      outline.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(outline);
      }, 500);
    }, 500);

    // Play sound
    playSound();
  }

  onMount(() => {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          const target = mutation.target as Element;
          if (target.nodeType === Node.ELEMENT_NODE) {
            highlightElement(target);
          }
        }
      });
    });

    // Start observing the entire document
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer?.disconnect();
    };
  });
</script>

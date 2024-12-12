import { writable, type Writable, get } from "svelte/store";

export interface RenderInfo {
  componentName: string;
  renderCount: number;
  timestamp: number;
  changes: Array<{
    name: string;
    prevValue: unknown;
    nextValue: unknown;
  }>;
}

export interface ScannerOptions {
  enabled?: boolean;
  playSound?: boolean;
  log?: boolean;
  showToolbar?: boolean;
  renderCountThreshold?: number;
  resetCountTimeout?: number;
  maxRenders?: number;
  alwaysShowLabels?: boolean;
}

const defaultOptions: ScannerOptions = {
  enabled: true,
  playSound: true,
  log: true,
  showToolbar: true,
  renderCountThreshold: 0,
  resetCountTimeout: 5000,
  maxRenders: 20,
  alwaysShowLabels: false,
};

export const options: Writable<ScannerOptions> = writable(defaultOptions);
export const renderData: Writable<Map<string, RenderInfo>> = writable(
  new Map()
);

let audioContext: AudioContext | null = null;

export function playGeigerSound() {
  console.log("Attempting to play sound...");
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audioContext.currentTime + 0.1
    );
    oscillator.stop(audioContext.currentTime + 0.1);
    console.log("Sound played successfully");
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

export function scanComponent(node: HTMLElement, componentName: string) {
  console.log("Scanner initialized for component:", componentName);
  let currentProps = new Map<string, any>();
  let renderCount = 0;
  let overlayElement: HTMLElement | null = null;
  let labelElement: HTMLElement | null = null;

  function updateRender(
    changes: Array<{ name: string; prevValue: unknown; nextValue: unknown }>
  ) {
    console.log("Update detected for component:", componentName, changes);
    renderCount++;

    renderData.update((data) => {
      const info: RenderInfo = {
        componentName,
        renderCount,
        timestamp: Date.now(),
        changes,
      };
      data.set(componentName, info);
      return data;
    });

    const currentOptions = get(options);
    if (currentOptions.playSound) {
      playGeigerSound();
    }
    if (currentOptions.log) {
      console.log(`[Svelte Scan] Component "${componentName}" rendered:`, {
        renderCount,
        changes,
      });
    }

    highlightElement(node, renderCount);
  }

  function highlightElement(element: HTMLElement, count: number) {
    console.log("Highlighting element:", element, "count:", count);

    // Remove existing overlay if any
    if (overlayElement) {
      overlayElement.remove();
    }
    if (labelElement) {
      labelElement.remove();
    }

    // Create new overlay
    overlayElement = document.createElement("div");
    labelElement = document.createElement("div");

    const rect = element.getBoundingClientRect();
    const isHot = count > 10;

    overlayElement.style.cssText = `
      position: fixed;
      border: 2px solid ${isHot ? "#ff0000" : "#00ff00"};
      background-color: ${
        isHot ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)"
      };
      pointer-events: none;
      z-index: 10000;
      transition: opacity 0.3s ease-out;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

    labelElement.style.cssText = `
      position: fixed;
      background-color: ${isHot ? "#ff0000" : "#00ff00"};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      z-index: 10001;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY - 20}px;
    `;

    labelElement.textContent = `${componentName}: ${count}x`;

    document.body.appendChild(overlayElement);
    document.body.appendChild(labelElement);

    // Remove overlay after animation
    setTimeout(() => {
      if (overlayElement) {
        overlayElement.style.opacity = "0";
      }
      if (labelElement) {
        labelElement.style.opacity = "0";
      }
      setTimeout(() => {
        overlayElement?.remove();
        labelElement?.remove();
        overlayElement = null;
        labelElement = null;
      }, 300);
    }, 1000);
  }

  // Initial render
  updateRender([]);

  return {
    update(newProps: Record<string, any>) {
      console.log("Props update for component:", componentName, newProps);
      const changes: Array<{
        name: string;
        prevValue: unknown;
        nextValue: unknown;
      }> = [];

      for (const [key, value] of Object.entries(newProps)) {
        const prevValue = currentProps.get(key);
        if (!Object.is(prevValue, value)) {
          changes.push({
            name: key,
            prevValue,
            nextValue: value,
          });
          currentProps.set(key, value);
        }
      }

      if (changes.length > 0) {
        updateRender(changes);
      }
    },

    destroy() {
      console.log("Component destroyed:", componentName);
      if (overlayElement) {
        overlayElement.remove();
      }
      if (labelElement) {
        labelElement.remove();
      }
      renderData.update((data) => {
        data.delete(componentName);
        return data;
      });
    },
  };
}

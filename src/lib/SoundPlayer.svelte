<script lang="ts">
  let audio: HTMLAudioElement;

  function createBeepSound() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 50);
  }

  export function playSound() {
    createBeepSound();
  }
</script>

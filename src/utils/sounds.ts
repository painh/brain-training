import { Howl } from 'howler';

// Get base path for assets
const basePath = import.meta.env.BASE_URL || '/';

// Drawing/swipe sound - loops while drawing
let drawingSound: Howl | null = null;
let drawingSoundId: number | null = null;

function getDrawingSound(): Howl {
  if (!drawingSound) {
    drawingSound = new Howl({
      src: [`${basePath}sounds/swipe-132084.mp3`],
      volume: 0.3,
      loop: true,
    });
  }
  return drawingSound;
}

export function startDrawingSound() {
  const sound = getDrawingSound();
  if (drawingSoundId !== null) {
    // Already playing
    return;
  }
  drawingSoundId = sound.play();
}

export function stopDrawingSound() {
  if (drawingSound && drawingSoundId !== null) {
    // Fade out over 150ms
    drawingSound.fade(0.3, 0, 150, drawingSoundId);
    const id = drawingSoundId;
    drawingSoundId = null;
    // Stop after fade
    setTimeout(() => {
      drawingSound?.stop(id);
    }, 150);
  }
}

// Correct sound
const correctSound = new Howl({
  src: [`${basePath}sounds/correct-choice-43861.mp3`],
  volume: 0.5,
});

// Wrong sound
const wrongSound = new Howl({
  src: [`${basePath}sounds/wrong-47985.mp3`],
  volume: 0.4,
});

export function playCorrectSound() {
  correctSound.play();
}

export function playWrongSound() {
  wrongSound.play();
}

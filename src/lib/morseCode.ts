// Morse code mappings
export const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '/': '-..-.', '?': '..--..', '.': '.-.-.-',
  ',': '--..--', '=': '-...-', ' ': ' '
};

// Reverse mapping for decoding
export const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_CODE)
  .reduce((acc, [char, code]) => ({ ...acc, [code]: char }), {});

// Calculate timing based on WPM (PARIS standard) with Farnsworth spacing
export const getTimings = (charWpm: number, effectiveWpm?: number) => {
  const actualEffectiveWpm = effectiveWpm && effectiveWpm < charWpm ? effectiveWpm : charWpm;
  
  const dotDuration = 1200 / charWpm; // Character elements at character speed
  
  // Standard gaps at character speed
  const standardCharGap = dotDuration * 3;
  const standardWordGap = dotDuration * 7;
  
  // If Farnsworth spacing (effective < character speed), extend WORD gaps only
  if (actualEffectiveWpm < charWpm) {
    // PARIS standard: 50 dot-units per word
    const charTime = 50 * dotDuration; // Time per word at char speed
    const effectiveTime = (50 * 1200) / actualEffectiveWpm; // Time per word at effective speed
    
    // All extra time goes into word spacing
    const extraWordTime = effectiveTime - charTime;
    
    return {
      dot: dotDuration,
      dash: dotDuration * 3,
      intraCharGap: dotDuration, // Within character stays at char speed
      charGap: standardCharGap, // Between characters stays at char speed
      wordGap: standardWordGap + extraWordTime, // All Farnsworth spacing here
    };
  }
  
  // No Farnsworth spacing - standard timing
  return {
    dot: dotDuration,
    dash: dotDuration * 3,
    intraCharGap: dotDuration,
    charGap: dotDuration * 3,
    wordGap: dotDuration * 7,
  };
};

// Generate morse audio using Web Audio API
export class MorsePlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; // Use a temporary variable for compatibility
    this.audioContext = new AudioContextClass();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0;
  }

  async playMorseCode(text: string, charWpm: number, frequency: number, effectiveWpm?: number, onProgress?: (index: number) => void): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    const timings = getTimings(charWpm, effectiveWpm);
    const upperText = text.toUpperCase();
    let currentTime = this.audioContext.currentTime;
    let charIndex = 0;

    for (let i = 0; i < upperText.length; i++) {
      const char = upperText[i];
      const morseCode = MORSE_CODE[char];

      if (!morseCode) continue;

      if (onProgress) {
        setTimeout(() => onProgress(i), (currentTime - this.audioContext!.currentTime) * 1000);
      }

      if (char === ' ') {
        currentTime += timings.wordGap / 1000;
        charIndex++;
        continue;
      }

      for (let j = 0; j < morseCode.length; j++) {
        const symbol = morseCode[j];
        const duration = symbol === '.' ? timings.dot : timings.dash;

        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        gain.gain.value = 0.3;

        gain.gain.setValueAtTime(0, currentTime); // Start at 0 gain
        gain.gain.linearRampToValueAtTime(0.3, currentTime + 0.01); // Fade in over 10ms

        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration / 1000);

        gain.gain.setValueAtTime(0.3, currentTime + duration / 1000 - 0.01); // Maintain gain until near the end
        gain.gain.linearRampToValueAtTime(0, currentTime + duration / 1000); // Fade out over 10ms

        currentTime += duration / 1000;

        if (j < morseCode.length - 1) {
          currentTime += timings.intraCharGap / 1000;
        }
      }

      currentTime += timings.charGap / 1000;
      charIndex++;
    }

    // Return promise that resolves when playback is complete
    return new Promise(resolve => {
      setTimeout(resolve, (currentTime - this.audioContext!.currentTime) * 1000);
    });
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }
}

// Encode text to morse
export const textToMorse = (text: string): string => {
  return text
    .toUpperCase()
    .split('')
    .map(char => MORSE_CODE[char] || '')
    .join(' ');
};

// Decode morse to text
export const morseToText = (morse: string): string => {
  return morse
    .split(' ')
    .map(code => REVERSE_MORSE[code] || '')
    .join('');
};

// Function to handle user input and provide visual feedback
export function handleMorseInput(
  userInput: string,
  expectedText: string,
  onFeedback: (char: string, isCorrect: boolean) => void
) {
  const upperExpectedText = expectedText.toUpperCase();

  for (let i = 0; i < userInput.length; i++) {
    const userChar = userInput[i].toUpperCase();
    const expectedChar = upperExpectedText[i];

    if (!expectedChar) {
      // Ignore extra input beyond the expected text
      continue;
    }

    const isCorrect = userChar === expectedChar;
    onFeedback(userChar, isCorrect);
  }
}

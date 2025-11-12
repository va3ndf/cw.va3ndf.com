import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Volume2, BookOpen } from 'lucide-react';
import { MorsePlayer, handleMorseInput } from '@/lib/morseCode';
import { generatePracticePhrase, CW_ABBREVIATIONS } from '@/lib/potaGenerator';
import { toast } from 'sonner';

export const MorseTrainer = () => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [charSpeed, setCharSpeed] = useState(20);
  const [effectiveSpeed, setEffectiveSpeed] = useState(15);
  const [frequency, setFrequency] = useState(600);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [showReference, setShowReference] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [charactersCorrect, setCharactersCorrect] = useState(0);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [showLetters, setShowLetters] = useState(false);
  const [charClasses, setCharClasses] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const morsePlayerRef = useRef<MorsePlayer | null>(null);

  useEffect(() => {
    morsePlayerRef.current = new MorsePlayer();
    return () => {
      morsePlayerRef.current?.stop();
    };
  }, []);

  const generateNewPhrase = () => {
    const phrase = generatePracticePhrase();
    setCurrentPhrase(phrase);
    setUserInput('');
    setCurrentCharIndex(-1);
    setAccuracy(100);
    setCharClasses([]); // Reset character classes
    setIsRevealed(false); // Reset reveal state
    // Focus input after generating phrase
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const playMorse = async () => {
    if (!currentPhrase || isPlaying) return;

    setIsPlaying(true);
    setShowLetters(false); // Hide letters
    setUserInput('');
    setCurrentCharIndex(-1);
    setCharClasses(new Array(currentPhrase.length).fill('')); // Reset character classes

    try {
      await morsePlayerRef.current?.playMorseCode(
        currentPhrase,
        charSpeed,
        frequency,
        effectiveSpeed,
        (index) => {
          setCurrentCharIndex(index);

          // Reveal characters progressively
          setCharClasses((prevClasses) => {
            const updatedClasses = [...prevClasses];
            updatedClasses[index] = 'correct'; // Assume correct for now
            return updatedClasses;
          });
        }
      );
    } catch (error) {
      console.error('Error playing morse:', error);
    } finally {
      setIsPlaying(false);
      setShowLetters(true); // Show letters after playback
      setCurrentCharIndex(-1);
      // Focus input after playback
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const stopMorse = () => {
    morsePlayerRef.current?.stop();
    morsePlayerRef.current = new MorsePlayer();
    setIsPlaying(false);
    setShowLetters(true); // Show letters
    setCurrentCharIndex(-1);
  };

  const revealAll = () => {
    // Stop any playing audio
    if (isPlaying) {
      stopMorse();
    }
    setIsRevealed(true);
    // Focus input after revealing
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setUserInput(input);

    const updatedClasses = [...charClasses];

    handleMorseInput(input, currentPhrase, (char, isCorrect) => {
      const index = input.length - 1; // Get the last typed character index
      if (index >= 0 && index < currentPhrase.length) {
        updatedClasses[index] = isCorrect ? 'correct' : 'incorrect';
      }
    });

    setCharClasses(updatedClasses); // Update state with new classes

    // Calculate accuracy in real-time
    if (currentPhrase && input.length > 0) {
      let correct = 0;
      const minLength = Math.min(input.length, currentPhrase.length);

      for (let i = 0; i < minLength; i++) {
        if (input[i] === currentPhrase[i]) {
          correct++;
        }
      }

      const acc = (correct / minLength) * 100;
      setAccuracy(Math.round(acc));

      if (input.length === currentPhrase.length) {
        setCharactersCorrect(correct);
        setTotalCharacters(currentPhrase.length);

        if (acc === 100) {
          toast.success('Perfect copy! 100% accuracy');
        } else if (acc >= 90) {
          toast.success(`Great job! ${Math.round(acc)}% accuracy`);
        } else {
          toast.info(`${Math.round(acc)}% accuracy. Keep practicing!`);
        }
      }
    }
  };

  const getCharClass = (index: number) => {
    if (index >= userInput.length) return '';
    return charClasses[index] || '';
  };

  // Ensure letters are hidden on page load
  useEffect(() => {
    generateNewPhrase();
    setShowLetters(false); // Hide letters initially
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            POTA/SOTA CW Trainer
          </h1>
          <p className="text-muted-foreground">
            Real-world Parks & Summits On The Air Morse Code Practice
          </p>
        </div>

        {/* Stats Bar
        <div className="flex flex-wrap gap-4 justify-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Char: {charSpeed} WPM
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Effective: {effectiveSpeed} WPM
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Tone: {frequency} Hz
          </Badge>
          <Badge
            variant="outline"
            className={`text-lg px-4 py-2 ${accuracy >= 90 ? 'border-success text-success' : accuracy >= 70 ? 'border-warning text-warning' : 'border-error text-error'}`}
          >
            Accuracy: {accuracy}%
          </Badge>
        </div> */}

        {/* Main Practice Area */}
        <Card className="p-6 space-y-6 radio-glow">
          {/* Transmission Display */}
          <div className="bg-dial-bg p-6 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-2">
              {isPlaying ? 'TRANSMITTING' : 'READY'}
              {isPlaying && <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full transmitting" />}
            </div>
            <div className="font-mono text-2xl md:text-3xl tracking-wider min-h-[100px] flex items-center flex-wrap">
              {currentPhrase ? (
                currentPhrase.split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="mr-4">
                    {word.split('').map((char, charIndex) => {
                      const absoluteIndex = currentPhrase.slice(0, currentPhrase.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0)).length + charIndex;
                      const isTyped = absoluteIndex < userInput.length;
                      return (
                        <span
                          key={charIndex}
                          className={`morse-char ${getCharClass(absoluteIndex)}`}
                        >
                          {isRevealed || isTyped ? char : '_'}
                        </span>
                      );
                    })}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _</span>
              )}
            </div>
          </div>

          {/* User Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Copy:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              autoFocus
              className="w-full bg-input border border-border rounded-lg px-4 py-3 font-mono text-xl tracking-wider focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
              placeholder="Type what you hear..."
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Character Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Character Speed: {charSpeed} WPM
              </label>
              <Slider
                value={[charSpeed]}
                onValueChange={([value]) => {
                  setCharSpeed(value);
                  // Ensure effective speed doesn't exceed character speed
                  if (effectiveSpeed > value) {
                    setEffectiveSpeed(value);
                  }
                }}
                min={15}
                max={40}
                step={1}
                disabled={isPlaying}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Speed of dots and dashes</p>
            </div>

            {/* Effective Speed Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Effective Speed: {effectiveSpeed} WPM
              </label>
              <Slider
                value={[effectiveSpeed]}
                onValueChange={([value]) => setEffectiveSpeed(Math.min(value, charSpeed))}
                min={5}
                max={charSpeed}
                step={1}
                disabled={isPlaying}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Overall speed with spacing</p>
            </div>

            {/* Frequency Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Tone: {frequency} Hz
              </label>
              <Slider
                value={[frequency]}
                onValueChange={([value]) => setFrequency(value)}
                min={400}
                max={900}
                step={50}
                disabled={isPlaying}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Pitch of the tone</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={playMorse}
              disabled={isPlaying || !currentPhrase || isRevealed}
              className="flex-1 min-w-[140px]"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Morse
            </Button>
            <Button
              onClick={stopMorse}
              disabled={!isPlaying || isRevealed}
              variant="secondary"
              className="flex-1 min-w-[140px]"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button
              onClick={revealAll}
              disabled={isRevealed || !currentPhrase}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Reveal All
            </Button>
            <Button
              onClick={generateNewPhrase}
              disabled={isPlaying}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Phrase
            </Button>
            <Button
              onClick={() => setShowReference(!showReference)}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              CW Reference
            </Button>
          </div>
        </Card>

        {/* CW Abbreviations Reference */}
        {showReference && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">CW Abbreviations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(CW_ABBREVIATIONS).map(([abbr, meaning]) => (
                <div key={abbr} className="flex items-start gap-2">
                  <Badge variant="secondary" className="font-mono shrink-0">
                    {abbr}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{meaning}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Session Stats */}
        {totalCharacters > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Session Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{charactersCorrect}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-error">{totalCharacters - charactersCorrect}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">{totalCharacters}</div>
                <div className="text-sm text-muted-foreground">Total Chars</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

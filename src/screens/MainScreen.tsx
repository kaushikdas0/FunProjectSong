import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompliment } from '../hooks/useCompliment';
import { useTypewriter } from '../hooks/useTypewriter';
import { downloadCard } from '../lib/downloadCard';
import { ComplimentCard } from '../components/Card/ComplimentCard';
import { Icon } from '../components/Icon/Icon';
import { AnimatedIconBackground } from '../components/AnimatedIconBackground/AnimatedIconBackground';

export default function MainScreen() {
  const [name, setName] = useState('');
  const { state, generate } = useCompliment();
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isGenerating = state.status === 'generating';
  const isStreaming = state.status === 'streaming';
  const isResult = state.status === 'result';
  const isError = state.status === 'error';
  const canGenerate = name.trim().length >= 3 && !isGenerating && !isStreaming;

  const buttonLabel = isGenerating || isStreaming
    ? 'Boosting...'
    : isResult
    ? 'Boost Again'
    : 'Boost Me';

  // Typewriter effect: feed growing compliment during streaming, empty otherwise
  const streamingCompliment = isStreaming ? state.compliment : '';
  const typedText = useTypewriter(streamingCompliment);

  // Determine what text the card shows
  const cardCompliment = isStreaming ? typedText : (isResult ? state.compliment : '');
  const cardName = (isStreaming || isResult) ? state.name : '';

  function handleGenerate() {
    generate(name.trim());
  }

  return (
    <div className="min-h-screen bg-cream-300 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Scattered decorative background icons */}
      <AnimatedIconBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Title */}
        <h1 className="font-caveat text-5xl text-text-primary mb-8 text-center">
          EgoBoost 3000
        </h1>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Who deserves a cosmic boost?"
          maxLength={40}
          className="
            w-full max-w-sm
            rounded-xl px-5 py-4
            bg-cream-50 border-2 border-cream-400
            font-caveat text-2xl text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-coral-400
            mb-4
          "
        />

        {/* Generate / Regenerate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="
            w-full max-w-sm
            flex items-center justify-center gap-2
            bg-coral-400 text-cream-50
            font-caveat text-2xl
            rounded-xl px-5 py-4
            hover:opacity-90 active:opacity-75
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-opacity
            mb-8
          "
        >
          {(isGenerating || isStreaming) && (
            <span className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
          )}
          {buttonLabel}
        </button>

        {/* Card — visible during streaming and result states */}
        {(isStreaming || isResult) && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <ComplimentCard ref={cardRef} name={cardName} compliment={cardCompliment} />
            {isResult && (
              <button
                onClick={() => cardRef.current && downloadCard(cardRef.current)}
                className="flex items-center gap-2 bg-blue-500 text-cream-50 font-caveat text-xl rounded-xl px-6 py-3 hover:opacity-90 active:opacity-75 transition-opacity mt-4"
              >
                <Icon name="download" size={24} />
                Download Card
              </button>
            )}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
            <p className="font-caveat text-2xl text-text-secondary">
              Even the universe needs a coffee break. Try again?
            </p>
            <button
              onClick={handleGenerate}
              className="
                bg-coral-400 text-cream-50
                font-caveat text-xl
                rounded-xl px-6 py-3
                hover:opacity-90 active:opacity-75
                transition-opacity
              "
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Dev-only kitchen sink link */}
      {import.meta.env.DEV && (
        <Link
          to="/kitchen-sink"
          className="absolute bottom-4 right-4 font-caveat text-sm text-text-muted opacity-40 hover:opacity-70 transition-opacity z-10"
        >
          Kitchen Sink
        </Link>
      )}
    </div>
  );
}

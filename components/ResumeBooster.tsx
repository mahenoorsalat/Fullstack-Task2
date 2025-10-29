import React, { useState } from 'react';
import { boostResume } from '../services/geminiService';
import { SparklesIcon } from './icons';

const ResumeBooster: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [boostedText, setBoostedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBoost = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to boost.');
      return;
    }
    setIsLoading(true);
    setError('');
    setBoostedText('');

    try {
      const result = await boostResume(inputText);
      setBoostedText(result);
    } catch (e) {
      setError('An unexpected error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-8 w-8 text-accent mr-3" />
        <h3 className="text-xl font-bold text-neutral">AI Resume Booster</h3>
      </div>
      <p className="text-gray-600 mb-4">
        Paste your resume summary or a job experience description below and let our AI assistant enhance it for you!
      </p>
      
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="e.g., I worked on a team to build a web app using React."
        className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white/50"
        disabled={isLoading}
      />

      <button
        onClick={handleBoost}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center bg-accent hover:bg-accent-focus text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Boosting...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            Boost My Resume
          </>
        )}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {boostedText && (
        <div className="mt-6 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
          <h4 className="font-bold text-neutral mb-2">Suggested Improvement:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{boostedText}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeBooster;
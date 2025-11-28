import React, { useState, useEffect } from 'react';
import { ComplexQuestion } from '../types';
import { generateComplexQuestion } from '../services/mathUtils';
import { AlertCircle, Calculator, ChevronRight, Check } from 'lucide-react';
import { Fraction } from './Fraction';
import Scratchpad from './Scratchpad';

const ComplexQuiz: React.FC = () => {
  const [question, setQuestion] = useState<ComplexQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'REVEALED'>('IDLE');

  useEffect(() => {
    nextQuestion();
  }, []);

  const nextQuestion = () => {
    setQuestion(generateComplexQuestion());
    setSelectedOption(null);
    setQuizState('IDLE');
  };

  const handleOptionClick = (option: number) => {
    if (quizState !== 'IDLE' || !question) return;

    setSelectedOption(option);
    
    // Use a small epsilon for float comparison
    const isCorrect = Math.abs(option - question.correctAnswer) < 0.001;

    if (isCorrect) {
      setQuizState('CORRECT');
      setTimeout(nextQuestion, 1500);
    } else {
      setQuizState('WRONG');
    }
  };

  const handleShowAnswer = () => {
    if (quizState !== 'IDLE') return;
    setQuizState('REVEALED');
  };

  // Helper to render text containing fractions
  const renderExplanation = (text: string) => {
    // Split by fraction pattern (number/number)
    const parts = text.split(/(\d+(?:\.\d+)?\/\d+(?:\.\d+)?)/g);
    return parts.map((part, i) => {
      if (/^[0-9.]+\/[0-9.]+$/.test(part)) {
        return <Fraction key={i} text={part} light={true} className="inline-flex mx-1" />;
      }
      return part;
    });
  };

  if (!question) return <div className="p-8 text-center">Loading Math Engine...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-primary" />
          复杂速算测验
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
        {/* Problem Statement */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap gap-2 mb-4">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${question.type === 'GROWTH' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
               {question.type === 'GROWTH' ? '计算增长量' : '计算减少量'}
             </span>
          </div>
          
          <div className="space-y-4 text-lg md:text-xl font-medium text-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-slate-500 text-sm md:text-base uppercase w-24">现期量</div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-slate-900">{question.currentAmount}</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="text-slate-500 text-sm md:text-base uppercase w-24">
                {question.type === 'GROWTH' ? '增长率' : '减少率'}
              </div>
              <div className="font-mono text-2xl md:text-3xl font-bold text-primary">{question.rateStr}</div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isTarget = option === question.correctAnswer;
            
            let bgClass = "bg-white hover:bg-slate-50";
            let textClass = "text-slate-700";
            let borderClass = "";

            if (quizState === 'CORRECT' && isSelected) {
              bgClass = "bg-green-50";
              textClass = "text-green-700";
              borderClass = "ring-2 ring-inset ring-green-500 z-10";
            } else if (quizState === 'WRONG' && isSelected) {
              bgClass = "bg-red-50";
              textClass = "text-red-700";
              borderClass = "ring-2 ring-inset ring-red-500 z-10";
            } else if ((quizState === 'WRONG' || quizState === 'REVEALED') && isTarget) {
              // Highlight correct answer if wrong or revealed
              bgClass = "bg-green-50";
              textClass = "text-green-700 font-bold";
              borderClass = "ring-2 ring-inset ring-green-500 z-10";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={quizState !== 'IDLE'}
                className={`p-6 text-left transition-all relative group outline-none ${bgClass} ${textClass} ${borderClass}`}
              >
                 <div className="flex items-center justify-between">
                   <span className="font-mono text-xl font-semibold flex items-center">
                      <span className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 text-sm flex items-center justify-center mr-3 group-hover:border-primary group-hover:text-primary transition-colors">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                   </span>
                   {quizState !== 'IDLE' && isTarget && <Check className="w-5 h-5 text-green-600" />}
                 </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interaction Bar */}
      {quizState === 'IDLE' && (
        <div className="flex justify-center">
           <button
             onClick={handleShowAnswer}
             className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
           >
             <AlertCircle className="w-4 h-4 mr-2" />
             直接看答案 (视为做错)
           </button>
        </div>
      )}

      {/* Explanation Card (Conditional) */}
      {(quizState === 'WRONG' || quizState === 'REVEALED') && (
        <div className="bg-slate-800 text-slate-50 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center text-amber-400">
            解析过程
          </h3>
          <div className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed opacity-90">
            {renderExplanation(question.stepByStep)}
          </div>
          <button
             onClick={nextQuestion}
             className="mt-6 w-full bg-white text-slate-900 font-bold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
           >
             下一题 <ChevronRight className="w-5 h-5 ml-1" />
           </button>
        </div>
      )}

      {/* Scratchpad */}
      <Scratchpad className="mt-8" />
    </div>
  );
};

export default ComplexQuiz;
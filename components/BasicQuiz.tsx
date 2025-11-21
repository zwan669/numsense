import React, { useState, useEffect } from 'react';
import { BasicQuestion } from '../types';
import { generateBasicQuestion } from '../services/mathUtils';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Fraction } from './Fraction';

const BasicQuiz: React.FC = () => {
  const [question, setQuestion] = useState<BasicQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Initialize first question
  useEffect(() => {
    nextQuestion();
  }, []);

  const nextQuestion = () => {
    setQuestion(generateBasicQuestion());
    setSelectedOption(null);
    setIsCorrect(null);
    setShowAnswer(false);
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption || showAnswer || !question) return; // Prevent double click or click after reveal

    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(prev => prev + 1);
      // Auto advance after short delay if correct
      setTimeout(nextQuestion, 1000);
    } else {
      setStreak(0);
    }
  };

  const handleGiveUp = () => {
    if (!question || showAnswer || selectedOption) return;
    setShowAnswer(true);
    setIsCorrect(false);
    setStreak(0);
  };

  if (!question) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-xl font-bold text-slate-800">基础转换测验</h2>
        <div className="bg-slate-100 px-4 py-1 rounded-full text-sm font-medium text-slate-600">
          🔥 连对: <span className="text-orange-500 font-bold">{streak}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 text-center bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest mb-4">
            {question.type === 'TO_PERCENT' ? '分数 转 百分数' : '百分数 转 分数'}
          </p>
          <div className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md flex items-center justify-center h-24">
            <Fraction text={question.prompt} light={true} bold={true} />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50">
          {question.options.map((option, idx) => {
            let btnClass = "p-4 rounded-xl text-lg font-bold transition-all duration-200 border-2 flex items-center justify-center min-h-[4rem] ";
            
            if (showAnswer && option === question.correctAnswer) {
               // State: Give Up -> Show Correct
               btnClass += "bg-green-100 border-green-500 text-green-700 shadow-md transform scale-[1.02]";
            } else if (selectedOption) {
              if (option === question.correctAnswer) {
                // State: Selected Correct or Revealed Correct
                btnClass += "bg-green-100 border-green-500 text-green-700 shadow-md transform scale-[1.02]";
              } else if (option === selectedOption) {
                 // State: Selected Wrong
                btnClass += "bg-red-100 border-red-500 text-red-700";
              } else {
                // State: Unselected others
                btnClass += "bg-white border-slate-200 text-slate-400 opacity-50";
              }
            } else if (showAnswer) {
                 // State: Give Up -> Dim others
                 btnClass += "bg-white border-slate-200 text-slate-400 opacity-50";
            } else {
              // State: Idle
              btnClass += "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md active:scale-95 cursor-pointer";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={btnClass}
                disabled={!!selectedOption || showAnswer}
              >
                <Fraction text={option} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Actions */}
      <div className="mt-6 flex flex-col items-center space-y-4 h-24">
        {isCorrect === true && (
           <div className="flex items-center text-green-600 font-bold animate-in slide-in-from-bottom-2">
             <CheckCircle className="w-6 h-6 mr-2" />
             回答正确！准备下一题...
           </div>
        )}
        
        {(isCorrect === false || showAnswer) && (
           <div className="flex flex-col items-center animate-in slide-in-from-bottom-2 w-full">
             <div className="flex items-center text-red-500 font-bold mb-3">
               {showAnswer && !selectedOption ? "查看答案" : <><XCircle className="w-6 h-6 mr-2" /> 回答错误</>}
             </div>
             <button 
              onClick={nextQuestion}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95"
             >
              下一题 <ArrowRight className="w-5 h-5 ml-2" />
             </button>
           </div>
        )}

        {!selectedOption && !showAnswer && (
          <button 
            onClick={handleGiveUp}
            className="text-slate-400 text-sm hover:text-slate-600 underline decoration-slate-300 underline-offset-4"
          >
            不知道? 显示答案
          </button>
        )}
      </div>
    </div>
  );
};

export default BasicQuiz;
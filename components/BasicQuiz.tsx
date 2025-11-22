
import React, { useState, useEffect, useRef } from 'react';
import { BasicQuestion, UserStats } from '../types';
import { generateBasicQuestion } from '../services/mathUtils';
import { ArrowRight, CheckCircle, XCircle, Brain, RotateCcw } from 'lucide-react';
import { Fraction } from './Fraction';

interface BasicQuizProps {
  stats: UserStats;
  onUpdateStats: (key: string, isCorrect: boolean, timeMs: number) => void;
  onResetStats: () => void;
}

const BasicQuiz: React.FC<BasicQuizProps> = ({ stats, onUpdateStats, onResetStats }) => {
  const [question, setQuestion] = useState<BasicQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const [smartMode, setSmartMode] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Initialize first question
  useEffect(() => {
    nextQuestion();
  }, []); 

  // When smart mode is toggled, refresh question to apply logic immediately if desirable
  // or just let it apply on next question. Let's apply on next question to avoid jarring jump.
  
  const nextQuestion = () => {
    setQuestion(generateBasicQuestion(stats, smartMode));
    setSelectedOption(null);
    setIsCorrect(null);
    setShowAnswer(false);
    startTimeRef.current = Date.now();
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption || showAnswer || !question) return;

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;

    setSelectedOption(option);
    const correct = option === question.correctAnswer;
    setIsCorrect(correct);
    
    // Update stats
    onUpdateStats(question.dataReference.fractionStr, correct, duration);

    if (correct) {
      setStreak(prev => prev + 1);
      setTimeout(nextQuestion, 1000);
    } else {
      setStreak(0);
    }
  };

  const handleGiveUp = () => {
    if (!question || showAnswer || selectedOption) return;
    
    // Giving up counts as wrong, with a generic long time penalty or actual time
    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    
    onUpdateStats(question.dataReference.fractionStr, false, duration);
    
    setShowAnswer(true);
    setIsCorrect(false);
    setStreak(0);
  };
  
  const handleReset = () => {
    if (window.confirm("确定要重置所有学习统计数据吗？这将清除您的错题记录和反应时间统计。")) {
      onResetStats();
      setStreak(0);
    }
  };

  if (!question) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
         <div className="flex items-center space-x-4">
           <h2 className="text-xl font-bold text-slate-800">基础转换测验</h2>
           <div className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-600">
            🔥 连对: <span className="text-orange-500 font-bold">{streak}</span>
          </div>
         </div>

         <div className="flex items-center space-x-3">
            <button
              onClick={() => setSmartMode(!smartMode)}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                smartMode 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Brain className="w-3 h-3 mr-1.5" />
              {smartMode ? '智能推荐已开启' : '开启智能推荐'}
            </button>
            
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
              title="重置统计"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12 text-center bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center min-h-[200px] relative">
          {smartMode && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-medium flex items-center">
              <Brain className="w-3 h-3 mr-1" /> 智能加权
            </div>
          )}
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
               btnClass += "bg-green-100 border-green-500 text-green-700 shadow-md transform scale-[1.02]";
            } else if (selectedOption) {
              if (option === question.correctAnswer) {
                btnClass += "bg-green-100 border-green-500 text-green-700 shadow-md transform scale-[1.02]";
              } else if (option === selectedOption) {
                btnClass += "bg-red-100 border-red-500 text-red-700";
              } else {
                btnClass += "bg-white border-slate-200 text-slate-400 opacity-50";
              }
            } else if (showAnswer) {
                 btnClass += "bg-white border-slate-200 text-slate-400 opacity-50";
            } else {
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

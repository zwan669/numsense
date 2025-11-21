import React, { useState, useEffect } from 'react';
import { generateFlashcardItem } from '../services/mathUtils';
import { FlashcardItem } from '../types';
import { RotateCw, ArrowRight, Sparkles } from 'lucide-react';
import { Fraction } from './Fraction';

const FlashcardMode: React.FC = () => {
  const [item, setItem] = useState<FlashcardItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    nextCard();
  }, []);

  const nextCard = () => {
    setIsAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setItem(generateFlashcardItem());
      setIsAnimating(false);
    }, 200);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  if (!item) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-[calc(100vh-8rem)] justify-center">
      
      <div className="text-center mb-6 flex justify-between items-center px-2">
         <h2 className="text-xl font-bold text-slate-800 flex items-center">
           <RotateCw className="w-5 h-5 mr-2 text-primary" />
           记忆翻转卡
         </h2>
         <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
           点击卡片翻转
         </span>
      </div>

      {/* Card Container */}
      <div className="relative w-full aspect-[4/5] max-h-[500px] [perspective:1000px]">
        <div
          onClick={handleCardClick}
          className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] cursor-pointer relative ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          } ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border-2 border-indigo-50 flex flex-col items-center justify-center [backface-visibility:hidden] p-8">
            <span className="text-sm text-indigo-300 font-bold uppercase tracking-wider absolute top-6">问题</span>
            {item.isVariation && (
               <div className="absolute top-6 right-6 text-xs font-bold text-orange-400 flex items-center bg-orange-50 px-2 py-1 rounded-full">
                 <Sparkles className="w-3 h-3 mr-1" /> 变式
               </div>
            )}
            <div className="text-6xl font-black text-slate-800 text-center flex items-center justify-center">
              <Fraction text={item.front} bold={true} />
            </div>
            <div className="absolute bottom-6 text-slate-400 text-sm font-medium animate-pulse">
              点击查看答案
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 text-white">
             <span className="text-sm text-indigo-200 font-bold uppercase tracking-wider absolute top-6">答案</span>
             {item.isVariation && (
               <div className="absolute top-6 right-6 text-xs font-bold text-white/80 flex items-center bg-white/20 px-2 py-1 rounded-full">
                 <Sparkles className="w-3 h-3 mr-1" /> 变式
               </div>
            )}
             <div className="text-6xl font-black text-white text-center drop-shadow-lg flex items-center justify-center">
               <Fraction text={item.back} light={true} bold={true} />
             </div>
             {item.isVariation && (
               <div className="mt-8 text-indigo-100 text-sm bg-white/10 px-3 py-1 rounded-lg">
                 互为倒数 / 变形关系
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextCard();
          }}
          className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95"
        >
          下一个 <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

    </div>
  );
};

export default FlashcardMode;
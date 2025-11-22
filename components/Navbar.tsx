
import React from 'react';
import { AppMode } from '../types';
import { BookOpen, Zap, Calculator, RotateCw, BarChart3 } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.STUDY, label: '学习', icon: BookOpen },
    { mode: AppMode.FLASHCARD, label: '翻转卡', icon: RotateCw },
    { mode: AppMode.BASIC_QUIZ, label: '基础测验', icon: Zap },
    { mode: AppMode.COMPLEX_QUIZ, label: '复杂测验', icon: Calculator },
    { mode: AppMode.ANALYTICS, label: '错题分析', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-16">
           <div className="flex-shrink-0 flex items-center font-bold text-xl text-primary">
             NumSense
           </div>
           <div className="flex space-x-1 md:space-x-4 overflow-x-auto no-scrollbar items-center">
             {navItems.map((item) => {
               const Icon = item.icon;
               const isActive = currentMode === item.mode;
               return (
                 <button
                   key={item.mode}
                   onClick={() => setMode(item.mode)}
                   className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                     ${isActive 
                       ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                     }`}
                 >
                   <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                   {item.label}
                 </button>
               )
             })}
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

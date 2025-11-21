import React from 'react';
import { FRACTION_TABLE } from '../constants';
import { Fraction } from './Fraction';

const StudyMode: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">记忆速查表</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {FRACTION_TABLE.map((item) => (
          <div 
            key={item.n} 
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">分数</span>
              <div className="text-2xl font-bold text-primary h-10 flex items-center">
                <Fraction text={item.fractionStr} />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-4"></div>
            <div className="flex flex-col items-end text-right">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">百分数</span>
              <span className="text-2xl font-bold text-secondary h-10 flex items-center">{item.percentageStr}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
        <h3 className="font-bold text-indigo-900 mb-2">💡 速算技巧提示</h3>
        <ul className="list-disc list-inside space-y-2 text-indigo-800 text-sm leading-relaxed">
          <li>
            <strong>增长量公式：</strong> 当增长率 r ≈ <Fraction text="1/n" /> 时，增长量 = 现期量 / (n + 1)
          </li>
          <li>
            <strong>减少量公式：</strong> 当减少率 r ≈ <Fraction text="1/n" /> 时，减少量 = 现期量 / (n - 1)
          </li>
          <li>
            记住 <Fraction text="1/2" /> 到 <Fraction text="1/20" /> 的对应关系是资料分析高分的基础！
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StudyMode;
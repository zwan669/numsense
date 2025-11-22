
import React from 'react';
import { UserStats } from '../types';
import { FRACTION_TABLE } from '../constants';
import { BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { Fraction } from './Fraction';

interface AnalyticsModeProps {
  stats: UserStats;
}

const AnalyticsMode: React.FC<AnalyticsModeProps> = ({ stats }) => {
  // Process data
  const dataPoints = FRACTION_TABLE.map(item => {
    const stat = stats[item.fractionStr];
    if (!stat || stat.attempts === 0) return null;
    
    return {
      fraction: item.fractionStr,
      percentage: item.percentageStr,
      errorRate: (stat.incorrect / stat.attempts) * 100,
      avgTime: stat.totalTimeMs / stat.attempts,
      attempts: stat.attempts,
      item: item
    };
  }).filter(Boolean) as { 
    fraction: string; 
    percentage: string; 
    errorRate: number; 
    avgTime: number; 
    attempts: number 
  }[];

  // Sort by Error Rate (Desc)
  const highErrors = [...dataPoints].sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  
  // Sort by Time (Desc)
  const slowReactions = [...dataPoints].sort((a, b) => b.avgTime - a.avgTime).slice(0, 10);

  if (dataPoints.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">暂无统计数据</h3>
        <p>请先进行一些基础测验，您的错题和反应时间将会显示在这里。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">学习分析报告</h2>
        <p className="text-slate-500 text-sm mt-1">基于您的测验表现生成的统计数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Error Rate Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-rose-50 flex items-center text-rose-700 font-bold">
             <AlertTriangle className="w-5 h-5 mr-2" />
             高频错题 (Top 10)
          </div>
          <div className="divide-y divide-slate-100">
            {highErrors.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-6 text-sm font-bold text-slate-300">{idx + 1}</div>
                  <div className="flex items-center font-mono font-bold text-slate-700">
                    <Fraction text={item.fraction} className="mr-2" />
                    <span className="text-slate-400 mx-1">↔</span>
                    <span>{item.percentage}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-600">{item.errorRate.toFixed(0)}% 错误</div>
                  <div className="text-xs text-slate-400">共 {item.attempts} 次练习</div>
                </div>
              </div>
            ))}
            {highErrors.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">暂无错题记录</div>}
          </div>
        </div>

        {/* Slow Reaction Time Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-amber-50 flex items-center text-amber-700 font-bold">
             <Clock className="w-5 h-5 mr-2" />
             反应较慢 (Top 10)
          </div>
          <div className="divide-y divide-slate-100">
            {slowReactions.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-6 text-sm font-bold text-slate-300">{idx + 1}</div>
                  <div className="flex items-center font-mono font-bold text-slate-700">
                    <Fraction text={item.fraction} className="mr-2" />
                    <span className="text-slate-400 mx-1">↔</span>
                    <span>{item.percentage}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${item.avgTime > 3000 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {(item.avgTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-xs text-slate-400">平均用时</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMode;


import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudyMode from './components/StudyMode';
import BasicQuiz from './components/BasicQuiz';
import ComplexQuiz from './components/ComplexQuiz';
import FlashcardMode from './components/FlashcardMode';
import AnalyticsMode from './components/AnalyticsMode';
import { AppMode, UserStats } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STUDY);
  const [stats, setStats] = useState<UserStats>({});

  // Load stats from local storage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('numsense_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
  }, []);

  // Save stats helper
  const persistStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem('numsense_stats', JSON.stringify(newStats));
  };

  const handleUpdateStats = (key: string, isCorrect: boolean, timeMs: number) => {
    const currentItem = stats[key] || { attempts: 0, incorrect: 0, totalTimeMs: 0, lastSeen: 0 };
    
    const newStats = {
      ...stats,
      [key]: {
        attempts: currentItem.attempts + 1,
        incorrect: currentItem.incorrect + (isCorrect ? 0 : 1),
        totalTimeMs: currentItem.totalTimeMs + timeMs,
        lastSeen: Date.now()
      }
    };
    
    persistStats(newStats);
  };

  const handleResetStats = () => {
    persistStats({});
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.STUDY:
        return <StudyMode />;
      case AppMode.FLASHCARD:
        return <FlashcardMode />;
      case AppMode.BASIC_QUIZ:
        return (
          <BasicQuiz 
            stats={stats} 
            onUpdateStats={handleUpdateStats} 
            onResetStats={handleResetStats}
          />
        );
      case AppMode.COMPLEX_QUIZ:
        return <ComplexQuiz />;
      case AppMode.ANALYTICS:
        return <AnalyticsMode stats={stats} />;
      default:
        return <StudyMode />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentMode={mode} setMode={setMode} />
      <main className="flex-grow pt-6 pb-12">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} NumSense - 资料分析速算训练</p>
          <p className="mt-1 text-xs">专为公考/行测资料分析设计</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

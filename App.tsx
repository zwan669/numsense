import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudyMode from './components/StudyMode';
import BasicQuiz from './components/BasicQuiz';
import ComplexQuiz from './components/ComplexQuiz';
import FlashcardMode from './components/FlashcardMode';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STUDY);

  const renderContent = () => {
    switch (mode) {
      case AppMode.STUDY:
        return <StudyMode />;
      case AppMode.FLASHCARD:
        return <FlashcardMode />;
      case AppMode.BASIC_QUIZ:
        return <BasicQuiz />;
      case AppMode.COMPLEX_QUIZ:
        return <ComplexQuiz />;
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
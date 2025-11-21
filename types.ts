export interface FractionData {
  n: number; // The denominator (e.g., 2 for 1/2)
  fractionStr: string; // "1/2"
  percentage: number; // 50
  percentageStr: string; // "50%"
  altPercentageStr?: string; // For special cases if needed
}

export enum AppMode {
  STUDY = 'STUDY',
  BASIC_QUIZ = 'BASIC_QUIZ',
  COMPLEX_QUIZ = 'COMPLEX_QUIZ',
  FLASHCARD = 'FLASHCARD',
}

export interface BasicQuestion {
  id: string;
  type: 'TO_PERCENT' | 'TO_FRACTION';
  prompt: string;
  correctAnswer: string;
  options: string[];
  dataReference: FractionData;
}

export interface ComplexQuestion {
  id: string;
  type: 'GROWTH' | 'DECLINE';
  currentAmount: number;
  rate: number; // The percentage value (e.g., 4 for 4%)
  rateStr: string; // "4%"
  n: number; // The corresponding denominator (e.g., 25)
  correctAnswer: number;
  options: number[];
  formulaStr: string; // The simplified formula string
  stepByStep: string; // Explanation
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  isVariation: boolean;
}
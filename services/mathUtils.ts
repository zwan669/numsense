
import { FRACTION_TABLE } from '../constants';
import { BasicQuestion, ComplexQuestion, FlashcardItem, FractionData, UserStats } from '../types';

// Helper to get random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Selects a target based on weights derived from user stats
 */
const getWeightedRandomTarget = (stats: UserStats): FractionData => {
  const weights: number[] = [];
  let totalWeight = 0;

  // Calculate weights
  FRACTION_TABLE.forEach((item) => {
    const stat = stats[item.fractionStr];
    let weight = 1; // Base weight

    if (stat && stat.attempts > 0) {
      const errorRate = stat.incorrect / stat.attempts;
      const avgTime = stat.totalTimeMs / stat.attempts;
      
      // Factor 1: Error Rate (High impact)
      // If error rate is 100%, add 5 to weight. If 0%, add 0.
      weight += errorRate * 5;

      // Factor 2: Reaction Time (Medium impact)
      // Threshold: 3 seconds (3000ms). 
      // If avg time > 3000, scale up. Max cap at +3 weight.
      if (avgTime > 3000) {
        const timeFactor = Math.min((avgTime - 3000) / 1000, 3);
        weight += timeFactor;
      }
    }

    weights.push(weight);
    totalWeight += weight;
  });

  // Select based on weight
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random < 0) {
      return FRACTION_TABLE[i];
    }
  }

  return FRACTION_TABLE[randomInt(0, FRACTION_TABLE.length - 1)];
};

/**
 * Generates a Basic Quiz Question (Fraction <-> Percentage)
 */
export const generateBasicQuestion = (stats?: UserStats, useSmartMode: boolean = false): BasicQuestion => {
  let target: FractionData;

  if (useSmartMode && stats && Object.keys(stats).length > 0) {
    target = getWeightedRandomTarget(stats);
  } else {
    target = FRACTION_TABLE[randomInt(0, FRACTION_TABLE.length - 1)];
  }

  const mode = Math.random() > 0.5 ? 'TO_PERCENT' : 'TO_FRACTION';

  let prompt = '';
  let correctAnswer = '';
  let distractors: string[] = [];

  if (mode === 'TO_PERCENT') {
    prompt = target.fractionStr;
    correctAnswer = target.percentageStr;
    // Generate distractors from other table entries
    const otherEntries = FRACTION_TABLE.filter(f => f.n !== target.n);
    const shuffled = shuffle(otherEntries).slice(0, 3);
    distractors = shuffled.map(s => s.percentageStr);
  } else {
    prompt = target.percentageStr;
    correctAnswer = target.fractionStr;
    const otherEntries = FRACTION_TABLE.filter(f => f.n !== target.n);
    const shuffled = shuffle(otherEntries).slice(0, 3);
    distractors = shuffled.map(s => s.fractionStr);
  }

  const options = shuffle([correctAnswer, ...distractors]);

  return {
    id: Date.now().toString(),
    type: mode,
    prompt,
    correctAnswer,
    options,
    dataReference: target
  };
};

/**
 * Generates a Flashcard Item
 * Includes probability for "Variations" (Deformations) like 16% -> 1/6.3
 */
export const generateFlashcardItem = (): FlashcardItem => {
  const target = FRACTION_TABLE[randomInt(0, FRACTION_TABLE.length - 1)];
  const rand = Math.random();
  
  // 40% Standard: Fraction -> Percent
  // 30% Reverse: Percent -> Fraction
  // 30% Variation: Swap n and p (e.g. 16% -> 1/6.3)
  
  if (rand < 0.4) {
    // Standard: 1/n -> p%
    return {
      id: Date.now().toString(),
      front: target.fractionStr,
      back: target.percentageStr,
      isVariation: false
    };
  } else if (rand < 0.7) {
    // Reverse: p% -> 1/n
    return {
      id: Date.now().toString(),
      front: target.percentageStr,
      back: target.fractionStr,
      isVariation: false
    };
  } else {
    // Variation: n% -> 1/p  OR  1/p -> n%
    const pVal = parseFloat(target.percentageStr.replace('%', ''));
    const nVal = target.n;
    
    // Logic: Back is "1/{p}"
    
    const front = `${nVal}%`;
    const back = `1/${pVal}`;
    
    // Randomly flip front/back for variation too
    if (Math.random() > 0.5) {
      return {
        id: Date.now().toString(),
        front: front,
        back: back,
        isVariation: true
      };
    } else {
      return {
        id: Date.now().toString(),
        front: back,
        back: front,
        isVariation: true
      };
    }
  }
};

/**
 * Generates a Complex Quiz Question (Growth/Decline formula application)
 */
export const generateComplexQuestion = (): ComplexQuestion => {
  const eligible = FRACTION_TABLE.filter(f => Number.isInteger(f.n) && f.n <= 25 && f.n >= 2);
  const target = eligible[randomInt(0, eligible.length - 1)];

  const isGrowth = Math.random() > 0.5;
  const n = target.n;

  const divisor = isGrowth ? n + 1 : n - 1;
  const baseMultiplier = randomInt(100, 999);
  const noise = 1 + (Math.random() * 0.1 - 0.05);
  const currentAmount = parseFloat(((baseMultiplier * divisor) * noise).toFixed(1));

  const rateStr = target.percentageStr;
  const rateVal = target.percentage / 100;

  const formulaDivisor = isGrowth ? n + 1 : n - 1;
  const correctVal = currentAmount / formulaDivisor;

  const wrongDivisor1 = formulaDivisor + 1;
  const wrongDivisor2 = formulaDivisor - 1;
  const wrongDivisor3 = formulaDivisor + 2;

  const opt1 = currentAmount / wrongDivisor1;
  const opt2 = currentAmount / wrongDivisor2;
  const opt3 = currentAmount / wrongDivisor3;

  const formatOpt = (val: number) => parseFloat(val.toFixed(1));

  let optionsRaw = [correctVal, opt1, opt2, opt3].map(formatOpt);
  optionsRaw = Array.from(new Set(optionsRaw));
  while (optionsRaw.length < 4) {
    optionsRaw.push(formatOpt(correctVal * (1 + (Math.random() * 0.2))));
  }

  const options = shuffle(optionsRaw);

  const operator = isGrowth ? '+' : '-';
  const typeStr = isGrowth ? '增长' : '减少';

  const stepByStep = `
1. 识别${typeStr}率: r = ${rateStr}
2. 转化为分数: ${rateStr} ≈ 1/${n} (即 n = ${n})
3. 套用${typeStr}量简算公式:
   ${typeStr}量 = 现期量 / (n ${operator} 1)
4. 代入数值:
   ${currentAmount} / (${n} ${operator} 1)
   = ${currentAmount} / ${formulaDivisor}
   ≈ ${correctVal.toFixed(1)}
5. 对比选项，最接近的是 ${formatOpt(correctVal)}
  `.trim();

  return {
    id: Date.now().toString(),
    type: isGrowth ? 'GROWTH' : 'DECLINE',
    currentAmount,
    rate: target.percentage,
    rateStr,
    n,
    correctAnswer: formatOpt(correctVal),
    options,
    formulaStr: `现期量 / (${n} ${operator} 1)`,
    stepByStep
  };
};

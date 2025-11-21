import { FRACTION_TABLE } from '../constants';
import { BasicQuestion, ComplexQuestion, FlashcardItem, FractionData } from '../types';

// Helper to get random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Generates a Basic Quiz Question (Fraction <-> Percentage)
 */
export const generateBasicQuestion = (): BasicQuestion => {
  const target = FRACTION_TABLE[randomInt(0, FRACTION_TABLE.length - 1)];
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
    // Using the logic that n * p approx 100.
    // If table has (16, 6.3%), then 16 * 6.3 approx 100.
    // So 16% is approx 1/6.3.
    
    // Some entries in table are clean integers, some are rounded.
    // Let's format the denominator nicely.
    const pVal = parseFloat(target.percentageStr.replace('%', ''));
    const nVal = target.n;
    
    // We use the 'n' value as the percentage prompt.
    // e.g. if n=16, prompt is "16%".
    // Then answer should be 1 / (100/16) = 1/6.25.
    // BUT the user specifically requested "1/6.3" for "16%".
    // This matches using the 'p' value from the table as the denominator directly.
    // Let's use that logic: Back is "1/{p}".
    
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
  // Select a base relationship from the table (exclude n=1/33.3 weirdness for complex calculation stability if desired, but keeping for completeness)
  // Filter to reasonable integers for 'n' to make the "formula" concept clear (2-25 range usually)
  const eligible = FRACTION_TABLE.filter(f => Number.isInteger(f.n) && f.n <= 25 && f.n >= 2);
  const target = eligible[randomInt(0, eligible.length - 1)];

  const isGrowth = Math.random() > 0.5;
  const n = target.n;

  // Generate a Current Amount that is roughly divisible to make the "Approximate" answer satisfying,
  // but add some noise so it's not perfectly clean, requiring the estimation.
  // Example: if n=24 (1/25), denominator will be 25 or 23.
  // Let's pick a base number X * denominator.
  const divisor = isGrowth ? n + 1 : n - 1;
  const baseMultiplier = randomInt(100, 999);
  // Add some noise to make it real: +/- 5%
  const noise = 1 + (Math.random() * 0.1 - 0.05);
  const currentAmount = parseFloat(((baseMultiplier * divisor) * noise).toFixed(1));

  const rateStr = target.percentageStr;
  const rateVal = target.percentage / 100;

  // Calculate Exact Answer
  // Growth: A / (1+r)
  // Decline: A / (1-r)
  const exactAnswer = isGrowth
    ? currentAmount / (1 + rateVal)
    : currentAmount / (1 - rateVal);

  // Calculate Formula Answer (The approximation user should use)
  // Growth: A / (n+1) * n ... Wait, formula is A / (1 + 1/n) = A / ((n+1)/n) = A*n / (n+1).
  // Wait, the user prompt said:
  // "公式则可以化简为: (现期量 * 1/n ) / (1 + 1/n), 进一步化简为：现期量/(n+1)"
  // THIS FORMULA IN PROMPT IS FOR "GROWTH AMOUNT" (增长量), NOT "BASE PERIOD DATA" (基期量).
  // Growth Amount = (Current * r) / (1+r).
  // If r = 1/n.
  // Growth Amount = (Current * 1/n) / (1 + 1/n) = (Current/n) / ((n+1)/n) = Current / (n+1).
  // YES. The prompt asks for Growth/Decline AMOUNT.

  const formulaDivisor = isGrowth ? n + 1 : n - 1;
  const correctVal = currentAmount / formulaDivisor;

  // Generate Options around the correct value
  // We want options that might trick someone doing direct multiplication or wrong divisor
  const wrongDivisor1 = formulaDivisor + 1; // Too small
  const wrongDivisor2 = formulaDivisor - 1; // Too big
  const wrongDivisor3 = formulaDivisor + 2; // Way off

  const opt1 = currentAmount / wrongDivisor1;
  const opt2 = currentAmount / wrongDivisor2;
  const opt3 = currentAmount / wrongDivisor3;

  // Ensure options are distinct and formatted
  const formatOpt = (val: number) => parseFloat(val.toFixed(1));

  let optionsRaw = [correctVal, opt1, opt2, opt3].map(formatOpt);
  // Check for duplicates (rare but possible with small numbers) and adjust
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
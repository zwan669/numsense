import { FractionData } from './types';

export const FRACTION_TABLE: FractionData[] = [
  { n: 2, fractionStr: "1/2", percentage: 50, percentageStr: "50%" },
  { n: 3, fractionStr: "1/3", percentage: 33.33, percentageStr: "33.3%" }, // Approx
  { n: 4, fractionStr: "1/4", percentage: 25, percentageStr: "25%" },
  { n: 5, fractionStr: "1/5", percentage: 20, percentageStr: "20%" },
  { n: 6, fractionStr: "1/6", percentage: 16.67, percentageStr: "16.7%" },
  { n: 7, fractionStr: "1/7", percentage: 14.28, percentageStr: "14.3%" },
  { n: 8, fractionStr: "1/8", percentage: 12.5, percentageStr: "12.5%" },
  { n: 9, fractionStr: "1/9", percentage: 11.11, percentageStr: "11.1%" },
  { n: 10, fractionStr: "1/10", percentage: 10, percentageStr: "10%" },
  { n: 11, fractionStr: "1/11", percentage: 9.09, percentageStr: "9.1%" },
  { n: 12, fractionStr: "1/12", percentage: 8.33, percentageStr: "8.3%" },
  { n: 13, fractionStr: "1/13", percentage: 7.69, percentageStr: "7.7%" },
  { n: 14, fractionStr: "1/14", percentage: 7.14, percentageStr: "7.1%" },
  { n: 15, fractionStr: "1/15", percentage: 6.67, percentageStr: "6.7%" }, // usually 6.67% or 6.7%
  { n: 16, fractionStr: "1/16", percentage: 6.25, percentageStr: "6.3%" }, // usually rounded
  { n: 17, fractionStr: "1/17", percentage: 5.88, percentageStr: "5.9%" },
  { n: 18, fractionStr: "1/18", percentage: 5.56, percentageStr: "5.6%" },
  { n: 19, fractionStr: "1/19", percentage: 5.26, percentageStr: "5.3%" },
  { n: 20, fractionStr: "1/20", percentage: 5, percentageStr: "5%" },
  // Inverse specific cases requested by user
  { n: 50, fractionStr: "1/50", percentage: 2, percentageStr: "2%" },
  { n: 25, fractionStr: "1/25", percentage: 4, percentageStr: "4%" },
  { n: 33.3, fractionStr: "1/33.3", percentage: 3, percentageStr: "3%" }, // Special case logic
];

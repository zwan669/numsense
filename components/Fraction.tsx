import React from 'react';

interface FractionProps {
  text: string;
  className?: string;
  light?: boolean; // For white text on dark backgrounds
  bold?: boolean;
}

export const Fraction: React.FC<FractionProps> = ({ text, className = "", light = false, bold = false }) => {
  // Check if string matches fraction pattern (e.g., "1/2", "1/33.3")
  // Allows decimals in numerator or denominator
  const isFraction = /^[0-9.]+\/[0-9.]+$/.test(text);

  if (!isFraction) {
    return <span className={className}>{text}</span>;
  }

  const [numerator, denominator] = text.split('/');

  return (
    <span className={`inline-flex flex-col items-center justify-center align-middle mx-1 ${className}`} style={{ verticalAlign: 'middle' }}>
      <span className={`border-b-[0.08em] ${light ? 'border-white' : 'border-current'} w-full text-center leading-none px-1 pb-[0.1em] mb-[0.1em] ${bold ? 'font-black' : ''}`}>
        {numerator}
      </span>
      <span className={`leading-none w-full text-center ${bold ? 'font-black' : ''}`}>
        {denominator}
      </span>
    </span>
  );
};

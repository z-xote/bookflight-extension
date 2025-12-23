import React from 'react';
import { cn } from '@/lib/utils';

// Shared input styles
const inputStyles = "w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-md text-[13px] font-sans text-gray-800 bg-white transition-all duration-200 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 placeholder:text-gray-400";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input id={id} className={cn(inputStyles, className)} {...props} />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  // Custom chevron SVG encoded for background
  const chevronSvg = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23525252' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e";

  return (
    <div className="flex flex-1 flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select 
        id={id}
        className={cn(
          inputStyles, 
          "appearance-none bg-no-repeat bg-[length:16px] pr-10", 
          className
        )}
        style={{
          backgroundImage: `url("${chevronSvg}")`,
          backgroundPosition: "right 12px center"
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
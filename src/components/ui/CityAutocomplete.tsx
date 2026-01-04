'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { searchAirports, type AirportResult } from '@/lib/airports';

interface CityAutocompleteProps {
  label?: string;
  id: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (airport: AirportResult) => void;
}

export function CityAutocomplete({
  label,
  id,
  placeholder = "City or code",
  value,
  onChange,
  onSelect,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<AirportResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the value prop directly instead of internal state
  const displayValue = value || '';

  // Search when user types
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Pass uppercase to parent for IATA codes
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: inputValue.toUpperCase(), id },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    
    // Search airports
    if (inputValue.length >= 2) {
      const searchResults = searchAirports(inputValue, 8);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [id, onChange]);

  // Handle selecting an airport
  const handleSelect = useCallback((airport: AirportResult) => {
    const syntheticEvent = {
      target: { value: airport.iata, id },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
    
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
    onSelect?.(airport);
    inputRef.current?.focus();
  }, [id, onChange, onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(results[highlightedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [isOpen, results, highlightedIndex, handleSelect]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-item]');
      (items[highlightedIndex] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="flex flex-1 flex-col gap-1 relative">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}
      
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (displayValue.length >= 2) {
            const searchResults = searchAirports(displayValue, 8);
            setResults(searchResults);
            setIsOpen(searchResults.length > 0);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-md text-[13px] font-sans text-gray-800 bg-white transition-all duration-200",
          "focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100",
          "placeholder:text-gray-400 uppercase"
        )}
      />

      {/* Dropdown - 3 visible, scroll for more */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="max-h-[156px] overflow-y-auto">
            {results.map((airport, index) => (
              <button
                key={airport.iata}
                data-item
                type="button"
                onClick={() => handleSelect(airport)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full px-3 py-2.5 text-left flex items-center justify-between transition-colors",
                  "hover:bg-red-50",
                  highlightedIndex === index && "bg-red-50"
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {airport.iata}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {airport.city}, {airport.country}
                  </div>
                </div>
                <span className="text-xl flex-shrink-0 ml-2">{airport.flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
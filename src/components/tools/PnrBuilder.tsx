'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { parseMarkdown } from '@/lib/markdown';
import { BookingContext } from '@/types';

interface PnrBuilderProps {
  formData?: BookingContext; 
}

export function PnrBuilder({ formData }: PnrBuilderProps = {}) {
  // Date state - initialize once
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (formData?.departDate) {
      return new Date(formData.departDate);
    }
    return new Date();
  });

  // Track if we're viewing return journey (cities swapped) - separate state
  const [isReturnView, setIsReturnView] = useState(false);

  // Check if form data was provided
  const hasFormData = Boolean(formData && Object.keys(formData).length > 0);

  // Check if we have departure/return dates from form
  const hasDepartDate = Boolean(formData?.departDate);
  const hasReturnDate = Boolean(formData?.returnDate);

  // Date helpers
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const oneYearFromNow = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const canDecrementDate = useMemo(() => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    prevDate.setHours(0, 0, 0, 0);
    return prevDate >= today;
  }, [currentDate, today]);

  const canIncrementDate = useMemo(() => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate <= oneYearFromNow;
  }, [currentDate, oneYearFromNow]);

  const decrementDate = () => {
    if (!canDecrementDate) return;
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const incrementDate = () => {
    if (!canIncrementDate) return;
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  // Jump to departure date
  const jumpToDepart = () => {
    if (!formData?.departDate || isReturnView === false) return;
    setCurrentDate(new Date(formData.departDate));
    setIsReturnView(false);
  };

  // Jump to return date
  const jumpToReturn = () => {
    if (!formData?.returnDate || isReturnView === true) return;
    setCurrentDate(new Date(formData.returnDate));
    setIsReturnView(true);
  };

  // Format date for command (e.g., "05JAN")
  const formatDateForCommand = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${day}${month}`;
  };

  // Generate client details command with multiple passengers
  const clientCommand = useMemo(() => {
    const phone = formData?.phone || '6799274730';
    const email = formData?.email || 'JOHN@EMAIL.COM';
    const agentId = '6';

    // Use passengers array if available, otherwise use default
    const passengers = formData?.passengers && formData.passengers.length > 0
      ? formData.passengers
      : [
          {
            lastName: 'DOE',
            firstName: 'JOHN',
            title: 'MR',
          }
        ];

    const grouped = passengers.reduce((acc, pax) => {
      const surname = pax.lastName.toUpperCase();
      if (!acc[surname]) {
        acc[surname] = [];
      }
      acc[surname].push(pax);
      return acc;
    }, {} as Record<string, typeof passengers>);

    const nmCommands: string[] = [];
    
    Object.entries(grouped).forEach(([surname, paxList]) => {
      if (paxList.length === 1) {
        const pax = paxList[0];
        nmCommands.push(
          `NM1${surname}/${pax.firstName.toUpperCase()} ${pax.title.toUpperCase()}`
        );
      } else {
        const nameList = paxList.map(p => 
          `${p.firstName.toUpperCase()} ${p.title.toUpperCase()}`
        ).join('/');
        nmCommands.push(`NM${paxList.length}${surname}/${nameList}`);
      }
    });

    const nameSection = nmCommands.join(';');
    return `${nameSection};AP ${phone};APE-${email.toUpperCase()};TKOK;RF${agentId}`;
  }, [formData]);

  // Generate availability command
  const availabilityCommand = useMemo(() => {
    const dateStr = formatDateForCommand(currentDate);
    const origin = (formData?.origin || 'NAN').toUpperCase();
    const destination = (formData?.destination || 'AKL').toUpperCase();

    // Swap cities if viewing return journey
    if (isReturnView) {
      return `AN${dateStr}${destination}${origin}`;
    }
    
    return `AN${dateStr}${origin}${destination}`;
  }, [currentDate, formData, isReturnView]);

  // Markdown rendering
  const clientMarkdown = useMemo(() => {
    return `\`\`\`\n${clientCommand}\n\`\`\``;
  }, [clientCommand]);

  const availabilityMarkdown = useMemo(() => {
    return `\`\`\`\n${availabilityCommand}\n\`\`\``;
  }, [availabilityCommand]);

  const renderedClient = useMemo(() => parseMarkdown(clientMarkdown), [clientMarkdown]);
  const renderedAvailability = useMemo(() => parseMarkdown(availabilityMarkdown), [availabilityMarkdown]);

  // Refs for Amadeus chip injection
  const clientBlockRef = useRef<HTMLDivElement>(null);
  const availabilityBlockRef = useRef<HTMLDivElement>(null);

  // Inject Amadeus chips
  useEffect(() => {
    [clientBlockRef, availabilityBlockRef].forEach((ref) => {
      if (!ref.current) return;

      const pres = ref.current.querySelectorAll('pre');
      pres.forEach((pre) => {
        if (pre.querySelector('.amadeus-chip')) return;

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className =
          'amadeus-chip absolute top-0 right-0 h-5 min-w-[74px] px-2.5 inline-flex items-center justify-center text-center bg-red-600 text-white text-[9px] font-bold tracking-wide uppercase border-none rounded-tl-none rounded-tr-md rounded-br-none rounded-bl-md cursor-pointer select-none transition-all duration-[120ms] ease-in-out hover:bg-red-700 hover:brightness-110 active:bg-red-800 active:brightness-95 z-10';

        chip.textContent = 'Amadeus';

        chip.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const codeEl = pre.querySelector('code');
          const text = (codeEl?.textContent ?? pre.textContent ?? '').trim();

          if (!text) {
            chip.textContent = 'Empty!';
            setTimeout(() => {
              chip.textContent = 'Amadeus';
            }, 900);
            return;
          }

          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
              .writeText(text)
              .then(() => {
                chip.textContent = 'Copied!';
                setTimeout(() => {
                  chip.textContent = 'Amadeus';
                }, 900);
              })
              .catch(() => fallbackCopy(text, chip));
          } else {
            fallbackCopy(text, chip);
          }
        });

        pre.appendChild(chip);
      });
    });
  }, [renderedClient, renderedAvailability]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {!hasFormData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-900">No form data provided</p>
                <p className="text-[11px] text-amber-700 mt-0.5">Using default values for demonstration</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block px-1">
              Client Details
            </label>
            <div
              ref={clientBlockRef}
              className={cn(
                'prose prose-sm max-w-none',
                'prose-pre:my-0 prose-pre:pt-[34px] prose-pre:pb-3.5 prose-pre:px-0 prose-pre:bg-gray-900 prose-pre:rounded-md prose-pre:overflow-visible prose-pre:relative',
                '[&_pre_.code-scroll]:overflow-x-auto [&_pre_.code-scroll]:pl-3.5 [&_pre_.code-scroll]:pr-3',
                '[&_pre_.code-scroll]:scrollbar-thin [&_pre_.code-scroll::-webkit-scrollbar]:h-0',
                '[&_pre_.code-scroll::-webkit-scrollbar-track]:bg-transparent [&_pre_.code-scroll::-webkit-scrollbar-thumb]:bg-transparent',
                '[&_pre_code]:!text-[12px] [&_pre_code]:!leading-relaxed [&_pre_code]:!bg-transparent [&_pre_code]:!text-gray-200 [&_pre_code]:!p-0 [&_pre_code]:!border-none [&_pre_code]:block [&_pre_code]:whitespace-pre [&_pre_code]:w-max'
              )}
            >
              <div dangerouslySetInnerHTML={{ __html: renderedClient }} />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block px-1">
              Availability Command
            </label>
            <div
              ref={availabilityBlockRef}
              className={cn(
                'prose prose-sm max-w-none',
                'prose-pre:my-0 prose-pre:pt-[34px] prose-pre:pb-3.5 prose-pre:px-0 prose-pre:bg-gray-900 prose-pre:rounded-md prose-pre:overflow-visible prose-pre:relative',
                '[&_pre_.code-scroll]:overflow-x-auto [&_pre_.code-scroll]:pl-3.5 [&_pre_.code-scroll]:pr-3',
                '[&_pre_.code-scroll]:scrollbar-thin [&_pre_.code-scroll::-webkit-scrollbar]:h-0',
                '[&_pre_.code-scroll::-webkit-scrollbar-track]:bg-transparent [&_pre_.code-scroll::-webkit-scrollbar-thumb]:bg-transparent',
                '[&_pre_code]:!text-[12px] [&_pre_code]:!leading-relaxed [&_pre_code]:!bg-transparent [&_pre_code]:!text-gray-200 [&_pre_code]:!p-0 [&_pre_code]:!border-none [&_pre_code]:block [&_pre_code]:whitespace-pre [&_pre_code]:w-max'
              )}
            >
              <div dangerouslySetInnerHTML={{ __html: renderedAvailability }} />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              <button
                onClick={jumpToDepart}
                disabled={!hasDepartDate}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  hasDepartDate
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 shadow-sm'
                    : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Depart
              </button>

              <button
                onClick={decrementDate}
                disabled={!canDecrementDate}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  canDecrementDate
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                ◀ Back
              </button>

              <button
                onClick={incrementDate}
                disabled={!canIncrementDate}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  canIncrementDate
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-px'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Next ▶
              </button>

              <button
                onClick={jumpToReturn}
                disabled={!hasReturnDate}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  hasReturnDate
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 shadow-sm'
                    : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function fallbackCopy(text: string, button: HTMLButtonElement) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.setAttribute('readonly', '');

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    button.textContent = successful ? 'Copied!' : 'Failed';
  } catch {
    button.textContent = 'Failed';
  } finally {
    document.body.removeChild(textarea);
    setTimeout(() => {
      button.textContent = 'Amadeus';
    }, 900);
  }
}
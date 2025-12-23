'use client';

import { useEffect, useRef } from 'react';
import { formatTime, escapeHtml } from '@/lib/utils';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import type { Message as MessageType } from '@/types';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const { role, content, timestamp } = message;
  
  const name = role === 'assistant' ? 'Bookflight Guide' : 'You';
  const time = formatTime(timestamp);
  
  const avatar = role === 'assistant' ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
    </svg>
  );
  
  const renderedContent = role === 'assistant' 
    ? parseMarkdown(content) 
    : escapeHtml(content);
  
  useEffect(() => {
    if (role === 'assistant' && bubbleRef.current) {
      const pres = bubbleRef.current.querySelectorAll('pre');
      
      pres.forEach((pre) => {
        if (pre.querySelector('.amadeus-chip')) return;
        
        const chip = document.createElement('button');
        chip.type = 'button';
        
        // ✨ Inline Tailwind classes for the Amadeus button
        chip.className = 'absolute top-0 right-0 h-5 min-w-[74px] px-2.5 inline-flex items-center justify-center text-center bg-red-600 text-white text-[9px] font-bold tracking-wide uppercase border-none rounded-tl-none rounded-tr-md rounded-br-none rounded-bl-md cursor-pointer select-none transition-all duration-[120ms] ease-in-out hover:bg-red-700 hover:brightness-110 active:bg-red-800 active:brightness-95';
        
        chip.textContent = 'Amadeus';
        
        chip.addEventListener('click', async () => {
          const codeEl = pre.querySelector('code');
          const text = (codeEl?.innerText ?? pre.innerText ?? '').trim();
          
          try {
            await navigator.clipboard.writeText(text);
            chip.textContent = 'Copied!';
            setTimeout(() => { chip.textContent = 'Amadeus'; }, 900);
          } catch (err) {
            chip.textContent = 'Failed';
            setTimeout(() => { chip.textContent = 'Amadeus'; }, 900);
          }
        });
        
        pre.appendChild(chip);
      });
    }
  }, [role]);
  
  return (
    <div className="flex gap-2.5 animate-messageIn">
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
        role === 'assistant' ? "bg-gradient-primary text-white" : "bg-gray-200 text-gray-600"
      )}>
        {avatar}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-700">{name}</span>
          <span className="text-[10px] text-gray-400">{time}</span>
        </div>
        <div 
          ref={bubbleRef}
          className={cn(
            "px-3.5 py-3 rounded-md text-[13px] leading-relaxed",
            role === 'assistant' 
              ? "bg-white border border-gray-200 shadow-sm prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2 prose-headings:first:mt-0 prose-h1:text-base prose-h2:text-sm prose-h3:text-[13px] prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0 prose-strong:font-semibold prose-strong:text-gray-900 prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5 prose-li:my-1 prose-pre:my-3 prose-pre:pt-[34px] prose-pre:pb-3.5 prose-pre:px-3.5 prose-pre:bg-gray-900 prose-pre:rounded-md prose-pre:overflow-x-auto prose-pre:relative prose-pre:text-sm [&_pre_code]:!text-[12px] [&_pre_code]:!leading-relaxed prose-blockquote:my-3 prose-blockquote:py-2.5 prose-blockquote:px-3.5 prose-blockquote:bg-gray-100 prose-blockquote:border-l-[3px] prose-blockquote:border-red-500 prose-blockquote:rounded-r-md prose-blockquote:text-gray-700 prose-blockquote:italic prose-hr:my-4 prose-hr:border-none prose-hr:h-px prose-hr:bg-gray-200 prose-table:w-full prose-table:my-3 prose-table:border-collapse prose-table:text-xs prose-th:px-2.5 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-gray-200 prose-th:bg-gray-100 prose-th:font-semibold prose-th:text-gray-800 prose-td:px-2.5 prose-td:py-2 prose-td:text-left prose-td:border prose-td:border-gray-200"
              : "bg-gray-800 text-white"
          )}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    </div>
  );
}
'use client';

import { useEffect, useRef } from 'react';
import { formatTime, escapeHtml } from '@/lib/utils';
import { parseMarkdown } from '@/lib/markdown';
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
        chip.className = 'amadeus-chip';
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
    <div className={`message ${role}`}>
      <div className="message-avatar">{avatar}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-name">{name}</span>
          <span className="message-time">{time}</span>
        </div>
        <div 
          ref={bubbleRef}
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    </div>
  );
}

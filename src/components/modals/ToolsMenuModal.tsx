'use client';

import { BaseModal } from './BaseModal';
import type { ToolConfig } from '@/types';

interface ToolsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolConfig[];
  onSelectTool: (toolId: string) => void;
}

export function ToolsMenuModal({ isOpen, onClose, tools, onSelectTool }: ToolsMenuModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} width="sm">
      {/* Compact Header */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-gray-900">Tools</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">Select a booking tool</p>
      </div>

      {/* Compact Tools List */}
      <div className="flex flex-col gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              onSelectTool(tool.id);
              onClose();
            }}
            className="group w-full text-left px-3 py-2.5 rounded-md border border-gray-200 bg-white transition-all hover:border-red-300 hover:bg-red-50"
          >
            <div className="flex items-center gap-2.5">
              {/* Icon */}
              <div className="text-xl flex-shrink-0">{tool.icon}</div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                    {tool.name}
                  </h3>
                  {/* AI Badge - Minimal */}
                  {tool.hasChatbar && (
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full" title="AI Assisted" />
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-gray-300 group-hover:text-red-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </BaseModal>
  );
}
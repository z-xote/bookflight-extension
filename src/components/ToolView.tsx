'use client';

import { AVAILABLE_TOOLS } from '@/lib/tools';
import { PnrBuilder } from './tools';
import { BookingContext } from '@/types';
// import other tools as you build them:
// import { AvailabilitySearch } from './tools';
// import { PricingCalculator } from './tools';
// import { SeatMapViewer } from './tools';

interface ToolViewProps {
  onBack: () => void;
  toolId: string;
  formData?: BookingContext;  // ← ADD THIS
}

export function ToolView({ onBack, toolId, formData }: ToolViewProps) {
  const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);

  if (!tool) {
    return (
      <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 transition-all hover:bg-red-100 hover:border-red-300"
            title="Back to Chat"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-gray-900">Tool Not Found</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-gray-600">This tool is not available</p>
        </div>
      </div>
    );
  }

  const renderTool = () => {
    switch (toolId) {
      case 'pnr-builder':
        // Pass props if your tool needs them
        return <PnrBuilder formData={formData} />; 

      // case 'availability':
      //   return <AvailabilitySearch />;

      // case 'pricing':
      //   return <PricingCalculator />;

      // case 'seat-map':
      //   return <SeatMapViewer />;

      default:
        // Keep your existing placeholder for not-yet-built tools
        return (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="mb-3 text-4xl">{tool.icon}</div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{tool.name}</p>
              <p className="text-xs text-gray-600">{tool.description}</p>
              <p className="text-xs text-gray-500 mt-3">Component coming soon</p>

              {tool.hasChatbar && (
                <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 bg-red-100 border border-red-200 rounded-full text-[10px] text-red-700 font-medium">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  AI Assisted
                </span>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 flex-1 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2.5">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 transition-all hover:bg-red-100 hover:border-red-300"
          title="Back to Chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-lg">{tool.icon}</div>
        <h2 className="text-sm font-semibold text-gray-900">{tool.name}</h2>
      </div>

      {/* Real Tool Render */}
      {renderTool()}
    </div>
  );
}

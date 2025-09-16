import React from "react";
import ReactMarkdown from "react-markdown";
import { useProductionStore } from "../../stores/productionStore";

export const ProductionNotes: React.FC = () => {
  const { currentProduction, timeline } = useProductionStore();

  if (!currentProduction) {
    return (
      <div className="p-4 text-gray-400 text-center">No production loaded</div>
    );
  }

  const currentMoment = currentProduction.moments[timeline.currentMomentIndex];

  if (!currentMoment) {
    return (
      <div className="p-4 text-gray-400 text-center">No moment selected</div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <h3 className="font-semibold text-gray-200 truncate">
          {currentMoment.title}
        </h3>
        <p className="text-sm text-gray-400">
          Moment {timeline.currentMomentIndex + 1} of{" "}
          {currentProduction.moments.length}
        </p>
      </div>

      {/* Markdown Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-white mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-gray-200 mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-300 mb-2 mt-4">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="text-gray-300 mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-gray-300 mb-4 space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li className="ml-4">{children}</li>,
              strong: ({ children }) => (
                <strong className="text-white font-semibold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-gray-200 italic">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 bg-gray-800 p-4 mb-4 italic">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-800 text-gray-200 p-4 rounded mb-4 overflow-x-auto">
                  {children}
                </pre>
              ),
            }}
          >
            {currentMoment.notes}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

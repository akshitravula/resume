import React from 'react';

interface EditorPreloaderProps {
  message?: string;
  submessage?: string;
}

const EditorPreloader: React.FC<EditorPreloaderProps> = ({ 
  message = "Loading Resume Editor", 
  submessage = "Preparing your workspace..." 
}) => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {/* Main spinning loader */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Loading text with animation */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{message}</h2>
        <p className="text-gray-500 animate-pulse">{submessage}</p>
        
        {/* Progress indicators - animated dots */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div 
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div 
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>

        {/* Optional progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPreloader;
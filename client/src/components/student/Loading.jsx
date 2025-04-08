import React from 'react';
import { Loader2 } from 'lucide-react'; // or use any spinner icon

const Loading = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-600 text-sm">Loading, please wait...</p>
      </div>
    </div>
  );
};

export default Loading;

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // or use any spinner icon
import { useNavigate, useParams } from 'react-router-dom';

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (path) {
      const timer = setTimeout(() => {
        navigate(`/${path}`);
      }, 5000);
      return () => clearTimeout(timer); // Clean up timer on unmount or change in path
    }
  }, [path]); // Added 'path' as a dependency

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

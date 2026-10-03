import React, { useState } from 'react';
import { Camera, Image, AlertCircle } from 'lucide-react';
import { captureFlexiblePhoto, CameraPhotoResult } from '../../services/camera';

interface CameraCaptureButtonProps {
  onPhotoCaptured: (result: CameraPhotoResult) => void;
  label?: string;
  className?: string;
  allowGallery?: boolean;
}

export const CameraCaptureButton: React.FC<CameraCaptureButtonProps> = ({
  onPhotoCaptured,
  label = 'Capture Photo via Camera',
  className = '',
  allowGallery = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await captureFlexiblePhoto(allowGallery);
      onPhotoCaptured(result);
    } catch (err: any) {
      if (
        err?.message !== 'User cancelled photos app' &&
        err?.message !== 'User cancelled image selection'
      ) {
        setError(
          allowGallery
            ? 'Photo selection failed or permission denied.'
            : 'Live camera capture failed or permission denied.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-1">
      <button
        type="button"
        onClick={handleCapture}
        disabled={loading}
        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-sm ${
          className
            ? className
            : allowGallery
            ? 'bg-purple-50/80 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300'
            : 'bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300'
        }`}
      >
        {allowGallery ? (
          <Image className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        ) : (
          <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        )}
        <span className="truncate">{loading ? (allowGallery ? 'Opening...' : 'Opening Camera...') : label}</span>
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800/40">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

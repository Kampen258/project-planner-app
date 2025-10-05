import React, { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';

interface FileUploadComponentProps {
  onFileUpload: (file: File) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileUpload,
  onCancel,
  isUploading = false
}) => {
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File must be under 5MB';
    }

    // Check file type
    const allowedTypes = ['.txt', '.md'];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some(type => fileName.endsWith(type));

    if (!isValidType) {
      return 'Please upload a .txt or .md file';
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError('Please upload a valid .txt or .md file');
      return;
    }

    if (acceptedFiles.length === 0) {
      setError('No file selected');
      return;
    }

    const file = acceptedFiles[0]!;
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    onFileUpload(file!);
  }, [onFileUpload]);

  // Simple file input approach instead of dropzone for now
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && files[0]) {
      onDrop([files[0]], []);
    }
  }, [onDrop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white text-center">Upload Your Project Document</h2>
          <p className="text-white/80 text-center mt-2">Let AI analyze your file and build your project</p>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer border-white/30 hover:border-white/50 hover:bg-white/5 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileInput}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">{/* Make the whole area clickable */}

            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"></div>
                <p className="text-white/80">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div>
                  <p className="text-white text-lg font-medium mb-2">
                    Drop your file here
                  </p>
                  <p className="text-white/70 text-sm mb-4">or click to browse</p>

                  <div className="text-white/60 text-xs space-y-1">
                    <p>Supports: .txt, .md</p>
                    <p>Max size: 5MB</p>
                  </div>
                </div>
              </div>
            )}
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-3">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Cancel Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="text-white/80 hover:text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
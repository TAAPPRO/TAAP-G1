import React, { useRef, useState, useEffect } from 'react';
import { ImageData } from '../types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageChange: (image: ImageData | null) => void;
  currentImage: ImageData | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part
      const base64 = result.split(',')[1];
      onImageChange({
        base64,
        mimeType: file.type,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        Muat Naik Imej Produk (Pilihan)
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Screenshot description produk (Untuk Analisis Visual)
      </p>
      
      <div
        onClick={() => !currentImage && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out cursor-pointer
          ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50/50'}
          ${currentImage ? 'cursor-default border-orange-200' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/*"
          className="hidden"
        />

        {!currentImage ? (
          <div className="flex flex-col items-center justify-center text-center py-2">
            <div className="bg-orange-100 p-3 rounded-full mb-3">
                <Upload className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-700 font-bold">
              Klik untuk muat naik atau seret imej.
            </p>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, atau GIF.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-3 max-h-64 shadow-inner">
               <img 
                 src={`data:${currentImage.mimeType};base64,${currentImage.base64}`} 
                 alt="Preview" 
                 className="object-contain max-h-64 w-full"
               />
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">
                <ImageIcon className="inline w-3 h-3 mr-1 text-gray-400"/>
                {currentImage.fileName}
              </span>
              <button
                type="button"
                onClick={removeImage}
                className="flex items-center px-3 py-1.5 text-xs font-bold rounded-md text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition"
              >
                <X className="w-3 h-3 mr-1" />
                Buang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LazyImage } from '@/components/ui/lazy-image';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  className?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (index: number) => void;
  existingImages?: string[];
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

interface ProcessedImage {
  file: File;
  preview: string;
  isUploading?: boolean;
}

/**
 * ImageUpload component with client-side resizing and preview
 * Handles multiple image uploads with validation and optimization
 */
export function ImageUpload({
  className,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onUpload,
  onRemove,
  existingImages = [],
  disabled = false,
  variant = 'default',
}: ImageUploadProps) {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize image using canvas
  const resizeImage = useCallback((file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Process uploaded files
  const processFiles = useCallback(async (files: FileList) => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    const newImages: ProcessedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not an accepted image type`);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        console.warn(`File ${file.name} is too large (max ${maxFileSize}MB)`);
        continue;
      }

      // Check total file limit
      if (images.length + existingImages.length + newImages.length >= maxFiles) {
        console.warn(`Maximum ${maxFiles} images allowed`);
        break;
      }

      try {
        // Resize image for optimization
        const resizedFile = await resizeImage(file, 1200, 1200, 0.8);
        
        // Create preview
        const preview = URL.createObjectURL(resizedFile);
        
        newImages.push({
          file: resizedFile,
          preview,
          isUploading: false,
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setIsProcessing(false);

    // Upload files if handler provided
    if (onUpload && newImages.length > 0) {
      try {
        // Mark as uploading
        setImages(prev => prev.map((img, index) => 
          index >= prev.length - newImages.length 
            ? { ...img, isUploading: true }
            : img
        ));

        await onUpload(newImages.map(img => img.file));

        // Mark as uploaded
        setImages(prev => prev.map(img => ({ ...img, isUploading: false })));
      } catch (error) {
        console.error('Upload failed:', error);
        // Remove failed uploads
        setImages(prev => prev.slice(0, prev.length - newImages.length));
      }
    }
  }, [disabled, isProcessing, acceptedTypes, maxFileSize, maxFiles, images.length, existingImages.length, resizeImage, onUpload]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Remove image
  const removeImage = useCallback((index: number, isExisting: boolean = false) => {
    if (isExisting) {
      if (onRemove) {
        onRemove(index);
      }
    } else {
      setImages(prev => {
        const newImages = [...prev];
        // Cleanup preview URL
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        return newImages;
      });
    }
  }, [onRemove]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const totalImages = existingImages.length + images.length;
  const canAddMore = totalImages < maxFiles && !disabled;

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 flex-wrap">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative">
              <LazyImage
                src={image}
                alt={`Existing ${index + 1}`}
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded border"
                enableProgressiveLoading={false}
              />
              {onRemove && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => removeImage(index, true)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative">
              <LazyImage
                src={image.preview}
                alt={`Upload ${index + 1}`}
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded border"
                enableProgressiveLoading={false}
              />
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {canAddMore && (
            <Button
              variant="outline"
              size="sm"
              className="w-16 h-16 p-0"
              onClick={openFileDialog}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground">
          {totalImages}/{maxFiles} images • Max {maxFileSize}MB each
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-4" />
            )}
            
            <h3 className="font-medium mb-2">
              {isProcessing ? 'Processing images...' : 'Upload Images'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here, or click to select files
            </p>
            
            <p className="text-xs text-muted-foreground">
              Supports: {acceptedTypes.map(type => type.split('/')[1]).join(', ')} • 
              Max {maxFileSize}MB each • {maxFiles - totalImages} remaining
            </p>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <LazyImage
                src={image}
                alt={`Existing ${index + 1}`}
                width={300}
                height={300}
                className="w-full aspect-square object-cover rounded-lg border"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              {onRemove && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index, true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative group">
              <LazyImage
                src={image.preview}
                alt={`Upload ${index + 1}`}
                width={300}
                height={300}
                className="w-full aspect-square object-cover rounded-lg border"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

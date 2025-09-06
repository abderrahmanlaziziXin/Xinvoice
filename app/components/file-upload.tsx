"use client";

import { useState, useCallback } from "react";
import {
  parseUploadedFile,
  validateFile,
  FileParseResult,
} from "../lib/file-parser";

interface FileUploadProps {
  onFileProcessed: (result: FileParseResult) => void;
  onError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  accept?: string;
}

export function FileUpload({
  onFileProcessed,
  onError,
  className = "",
  multiple = false,
  accept = ".csv,.xlsx,.xls",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setIsProcessing(true);

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Validate file
          const validation = validateFile(file);
          if (!validation.valid) {
            onError?.(validation.error!);
            continue;
          }

          // Parse file
          const result = await parseUploadedFile(file);

          if (result.success) {
            setProcessedFiles((prev) => [...prev, file.name]);
            onFileProcessed(result);
          } else {
            onError?.(result.error || "Failed to process file");
          }
        }
      } catch (error) {
        onError?.(
          `Error processing files: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileProcessed, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 hover:border-gray-400"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-12 h-12 text-gray-400">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Upload Text */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isProcessing
                ? "Processing files..."
                : "Upload CSV or Excel Files"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isProcessing
                ? "Please wait while we process your files"
                : "Drag and drop files here, or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports .csv, .xlsx, .xls files up to 10MB
            </p>
          </div>

          {/* Supported formats */}
          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              CSV
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Excel
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
              Bank Exports
            </span>
          </div>
        </div>
      </div>

      {/* Processed Files List */}
      {processedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Processed Files:
          </h4>
          <div className="space-y-1">
            {processedFiles.map((fileName, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-green-600 dark:text-green-400"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {fileName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * File Preview Component - Shows parsed data
 */
interface FilePreviewProps {
  result: FileParseResult;
  onClose: () => void;
}

export function FilePreview({ result, onClose }: FilePreviewProps) {
  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">
              Error parsing {result.fileName}
            </span>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-red-600 mt-1">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {result.fileName}
            </h3>
            <p className="text-xs text-gray-500">
              {result.fileType.toUpperCase()} • {result.data.length} rows •{" "}
              {result.headers.length} columns
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Headers:</h4>
          <div className="flex flex-wrap gap-1">
            {result.headers.map((header, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Sample Data:
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b">
                  {result.headers.slice(0, 6).map((header, index) => (
                    <th
                      key={index}
                      className="text-left py-1 px-2 font-medium text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                  {result.headers.length > 6 && (
                    <th className="text-left py-1 px-2 text-gray-400">...</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {result.data.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {result.headers.slice(0, 6).map((header, colIndex) => (
                      <td key={colIndex} className="py-1 px-2 text-gray-600">
                        {String(row[header] || "").substring(0, 20)}
                        {String(row[header] || "").length > 20 && "..."}
                      </td>
                    ))}
                    {result.headers.length > 6 && (
                      <td className="py-1 px-2 text-gray-400">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.data.length > 3 && (
            <p className="text-xs text-gray-500 mt-2">
              ... and {result.data.length - 3} more rows
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

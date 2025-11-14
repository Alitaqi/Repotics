// components/layout/PostSkeleton.jsx
import React from "react";

export default function PostSkeleton() {
  return (
    <div className="p-4 bg-white border border-gray-200 shadow-sm animate-pulse rounded-2xl">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="w-32 h-4 mb-2 bg-gray-300 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 space-y-2">
        <div className="w-full h-4 bg-gray-300 rounded" />
        <div className="w-5/6 h-4 bg-gray-300 rounded" />
      </div>

      {/* Image placeholder */}
      <div className="w-full h-48 mt-4 bg-gray-300 rounded" />

      {/* Footer buttons */}
      <div className="flex gap-4 mt-4">
        <div className="w-16 h-6 bg-gray-300 rounded" />
        <div className="w-16 h-6 bg-gray-300 rounded" />
        <div className="w-16 h-6 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

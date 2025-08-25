import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem' 
}) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  />
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1rem" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="1rem" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton width="40%" height="1.5rem" />
      <Skeleton width="20%" height="1rem" />
    </div>
    
    <div className="space-y-3">
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="60%" height="1rem" />
    </div>
    
    <div className="flex justify-end mt-6">
      <Skeleton width="30%" height="2rem" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton width="300px" height="2rem" />
        <Skeleton width="400px" height="1rem" />
      </div>
      <Skeleton width="150px" height="2.5rem" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton width="80px" height="1rem" />
              <Skeleton width="60px" height="2rem" />
            </div>
            <Skeleton width="40px" height="40px" className="rounded-full" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Charts/Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export const MTOListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Filters */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-4">
        <Skeleton width="200px" height="2.5rem" />
        <Skeleton width="150px" height="2.5rem" />
        <Skeleton width="120px" height="2.5rem" />
      </div>
    </div>
    
    {/* Table */}
    <div className="bg-white rounded-lg border border-gray-200">
      <TableSkeleton rows={8} columns={6} />
    </div>
    
    {/* Pagination */}
    <div className="flex items-center justify-between">
      <Skeleton width="200px" height="1rem" />
      <div className="flex gap-2">
        <Skeleton width="40px" height="2rem" />
        <Skeleton width="40px" height="2rem" />
        <Skeleton width="40px" height="2rem" />
      </div>
    </div>
  </div>
);

export const InventorySkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header with search */}
    <div className="flex items-center justify-between">
      <Skeleton width="250px" height="2rem" />
      <div className="flex gap-3">
        <Skeleton width="300px" height="2.5rem" />
        <Skeleton width="100px" height="2.5rem" />
      </div>
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton width="100px" height="1rem" className="mb-2" />
          <Skeleton width="80px" height="1.5rem" />
        </div>
      ))}
    </div>
    
    {/* Inventory Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="30%" height="1rem" />
          </div>
          <div className="space-y-2">
            <Skeleton width="40%" height="0.8rem" />
            <Skeleton width="80%" height="0.8rem" />
            <Skeleton width="60%" height="0.8rem" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className="max-w-xs space-y-2">
          <Skeleton width="120px" height="1rem" />
          <Skeleton width="200px" height="3rem" className="rounded-2xl" />
          <Skeleton width="60px" height="0.8rem" />
        </div>
      </div>
    ))}
  </div>
);

export default {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  MTOListSkeleton,
  InventorySkeleton,
  ChatSkeleton
};
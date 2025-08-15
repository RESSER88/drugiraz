import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'image';
}

const LoadingSkeleton = ({ 
  className, 
  count = 1, 
  height = "h-4",
  variant = 'text'
}: LoadingSkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'h-48 rounded-lg';
      case 'avatar':
        return 'h-10 w-10 rounded-full';
      case 'button':
        return 'h-10 w-24 rounded-md';
      case 'image':
        return 'h-32 w-full rounded-md';
      case 'text':
      default:
        return `${height} rounded`;
    }
  };

  const skeletonClasses = cn(
    'animate-pulse bg-muted',
    getVariantClasses(),
    className
  );

  if (count === 1) {
    return <div className={skeletonClasses} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
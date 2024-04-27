import { cn } from '@/lib/utils';
// Install MynaUI Icons from icons.mynaui.com
import { Spinner } from '@mynaui/icons-react';

interface SpinnerProps {
  size?: string;
  color?: string;
}

interface SizeProps {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

interface FillProps {
  slate: string;
  blue: string;
  red: string;
  green: string;
  white: string;
}

interface StrokeProps {
  slate: string;
  blue: string;
  red: string;
  green: string;
  white: string;
}

const sizesClasses: SizeProps = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
  xxl: 'w-32 h-32',
};

const fillClasses = {
  slate: 'fill-slate-800',
  blue: 'fill-blue-500',
  red: 'fill-red-500',
  green: 'fill-emerald-500',
  white: 'fill-white',
} as FillProps;

const strokeClasses = {
  slate: 'stroke-slate-500',
  blue: 'stroke-blue-500',
  red: 'stroke-red-500',
  green: 'stroke-emerald-500',
  white: 'stroke-white',
} as StrokeProps;

export const SpokeSpinner = ({
  size = 'md',
  color = 'slate',
}: SpinnerProps) => {
  return (
    <div aria-label='Loading...' role='status'>
      <Spinner
        className={cn(
          'animate-spin',
          sizesClasses[size as keyof SizeProps],
          strokeClasses[color as keyof StrokeProps]
        )}
      />
    </div>
  );
};

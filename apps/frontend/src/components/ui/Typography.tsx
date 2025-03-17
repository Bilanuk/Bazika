import { cn } from '@/lib/utils';

export function TypographyP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}>
      {children}
    </p>
  );
}

export function TypographyH1({
  children,
  className,
}: {
  children: string | undefined;
  className?: string;
}) {
  return <h1 className={cn('text-5xl font-bold', className)}>{children}</h1>;
}

export function TypographyH2({
  children,
  className,
}: {
  children: string | undefined;
  className?: string;
}) {
  return <h2 className={cn('text-4xl font-bold', className)}>{children}</h2>;
}

export function TypographyH3({
  children,
  className,
}: {
  children: string | undefined;
  className?: string;
}) {
  return <h3 className={cn('text-3xl font-bold', className)}>{children}</h3>;
}

export function TypographyH4({
  children,
  className,
}: {
  children: string | undefined;
  className?: string;
}) {
  return <h4 className={cn('text-2xl font-bold', className)}>{children}</h4>;
}

export function LogoTypography({
  children,
  className,
}: {
  children: string | undefined;
  className?: string;
}) {
  return <h2 className={cn('text-3xl font-bold', className)}>{children}</h2>;
}

export function TypographySmall({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

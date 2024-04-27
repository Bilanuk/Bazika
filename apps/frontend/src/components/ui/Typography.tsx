export function TypographyP({ children }: { children: string | undefined }) {
  return <p className='leading-7 [&:not(:first-child)]:mt-6'>{children}</p>;
}

export function TypographyH1({ children }: { children: string | undefined }) {
  return <h1 className='text-5xl font-bold'>{children}</h1>;
}

export function TypographyH2({ children }: { children: string | undefined }) {
  return <h2 className='text-4xl font-bold'>{children}</h2>;
}

export function TypographyH3({ children }: { children: string | undefined }) {
  return <h3 className='text-3xl font-bold'>{children}</h3>;
}

export function LogoTypography({ children }: { children: string | undefined }) {
  return <h2 className={'text-3xl font-bold'}>{children}</h2>;
}

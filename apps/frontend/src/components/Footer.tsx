import Link from 'next/link';
import { TypographyP, TypographySmall } from '@/components/ui/Typography';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <TypographySmall className="text-center text-muted-foreground">
          © {new Date().getFullYear()} Bazika. All rights reserved.
        </TypographySmall>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground">
            <TypographySmall className="text-muted-foreground">Terms of Service</TypographySmall>
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            <TypographySmall className="text-muted-foreground">Privacy Policy</TypographySmall>
          </Link>
          <a href="mailto:contact@bazika.xyz" className="hover:text-foreground">
            <TypographySmall className="text-muted-foreground">Contact</TypographySmall>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
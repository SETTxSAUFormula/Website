import type { AnchorHTMLAttributes } from 'react';

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function SiteLink({ href, children, ...props }: SiteLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

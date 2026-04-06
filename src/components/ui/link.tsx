// ./src/components/ui/link.tsx

import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface LinkProps extends ButtonProps {
  href: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, target, rel, children, ...props }) => {
  return (
    <Button {...props} asChild>
      <a href={href} target={target} rel={rel}>
        {children}
      </a>
    </Button>
  );
};

export { Link };

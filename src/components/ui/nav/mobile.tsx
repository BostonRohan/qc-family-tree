import * as React from "react";
import { Menu, ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { nav, type NavItem } from "./nav.config";
import logoImage from "@/assets/logo-fullcolor-white-tag.png";

const MenuItemComponent: React.FC<{ item: NavItem; depth?: number }> = ({
  item,
  depth = 0,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between py-2 text-lg font-medium transition-colors hover:text-primary",
              depth > 0 && "pl-4",
            )}
          >
            {item.title}
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children.map((subItem) => (
            <MenuItemComponent
              key={subItem.title}
              item={subItem}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const hasAnchor = item.href?.includes("#");

  return hasAnchor ? (
    <SheetClose asChild>
      <a
        href={item.href}
        target={item.target ?? "_self"}
        className={cn(
          "block py-2 text-lg font-medium transition-colors hover:text-primary",
          depth > 0 && "pl-4",
        )}
      >
        {item.title}
      </a>
    </SheetClose>
  ) : (
    <a
      href={item.href}
      target={item.target ?? "_self"}
      className={cn(
        "block py-2 text-lg font-medium transition-colors hover:text-primary",
        depth > 0 && "pl-4",
        item.href === "/" && "text-primary",
      )}
    >
      {item.title}
    </a>
  );
};

export default function HamburgerMenu({
  wrapperClassName = "",
}: {
  wrapperClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  const closedWrapperClassName = cn(
    wrapperClassName,
    "!max-w-full mx-0 text-left flex items-center px-4 max-w-2xl",
  );

  return (
    <div
      className={`${
        !open
          ? closedWrapperClassName
          : "h-[44px] invisible fixed inset-x-0 top-4 p-1"
      } justify-start p-1 !w-[90%] max-w-2xl mx-auto px-4`}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", open && "hidden")}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <a
          href="/"
          className={cn(
            "md:hidden flex h-10 items-center ml-auto transition-opacity duration-200",
            open && "hidden",
          )}
          aria-label="QC Family Tree home"
          data-mobile-nav-logo
        >
          <img
            src={logoImage.src}
            alt="QC Family Tree"
            width={logoImage.width}
            height={logoImage.height}
            className="h-full w-auto object-contain"
          />
        </a>
        <SheetContent side="left" className="w-full" hideCloseButton>
          <div className="flex items-center justify-between px-4 pt-6">
            <a
              href="/"
              className="flex h-10 items-center"
              aria-label="QC Family Tree home"
            >
              <img
                src={logoImage.src}
                alt="QC Family Tree"
                width={logoImage.width}
                height={logoImage.height}
                className="h-full w-auto object-contain"
              />
            </a>
            <SheetClose className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>
          <div className="flex flex-col space-y-4 pt-4 px-4">
            {nav.map((item) => (
              <MenuItemComponent key={item.title} item={item} />
            ))}
          </div>
          <div className="flex justify-between w-full items-center flex-wrap gap-1 pt-10 px-4">
            <p className="opacity-80 whitespace-nowrap">
              Copyright © {currentYear} QC Family Tree
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

import * as React from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import SocialIcons from "../../SocialIcons";
import { nav, type NavItem } from "./nav.config";

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

  return (
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

  return (
    <div
      className={`${!open ? wrapperClassName : "h-[44px] invisible fixed inset-x-0 top-4 p-1"} justify-start p-1 !w-[90%]`}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${open ? "hidden" : ""}`}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full">
          <div className="flex flex-col space-y-4 pt-8 px-4">
            {nav.map((item) => (
              <MenuItemComponent key={item.title} item={item} />
            ))}
          </div>
          <div className="flex justify-between w-full items-center flex-wrap gap-1 pt-10 px-4">
            <SocialIcons
              wrapperClassName="flex gap-2"
              iconClassName="w-6 h-6 hover:fill-accent"
            />
            <p className="opacity-80 whitespace-nowrap">
              Copyright © 2025 QC Family Tree
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

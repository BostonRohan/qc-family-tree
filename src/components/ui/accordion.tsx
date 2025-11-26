import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/70 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-70 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

interface CustomAccordionProps {
  items: Array<{
    title: string;
    content: React.ReactNode;
  }>;
}

function CustomAccordion({ items }: CustomAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function RhizomeFAQ() {
  const faqs = [
    {
      title: "What does it mean to be a Rhizome member?",
      content:
        "Members meet regularly to share art, learn from one another, and build a supportive network that fosters both personal and collective growth.",
    },
    {
      title: "How much does it cost to join?",
      content: "The 2026 annual Rhizome Membership fee is $40.",
    },
    {
      title: "Who can join the coalition?",
      content:
        "Any artist or cultural worker aligned with our mission and values—committed to fairness, justice, and community impact—is welcome to apply.",
    },
    {
      title: "What is expected of members?",
      content:
        "Members are encouraged to attend meetings, participate in coalition projects, and contribute to our shared learning and creative environment.",
    },
    {
      title: "Who can I contact if I have more questions?",
      content: (
        <p>
          You can reach the team at{" "}
          <a href="mailto:HereForGood@qcfamilytree.org" className="underline">
            HereForGood@qcfamilytree.org
          </a>
        </p>
      ),
    },
  ];

  return <CustomAccordion items={faqs}></CustomAccordion>;
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  CustomAccordion,
  RhizomeFAQ,
};

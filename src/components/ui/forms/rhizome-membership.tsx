"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  full_name: z
    .string({
      error: "Full name is required.",
    })
    .min(2, { error: "Full name must be at least 2 characters long." })
    .max(100, { error: "Full name must be under 100 characters." })
    .nonoptional(),

  email: z
    .email({ error: "Please enter a valid email address." })
    .max(200, { error: "Email must be under 200 characters." })
    .nonoptional(),

  pronouns: z
    .string()
    .min(2, { error: "Pronouns must be at least 2 characters long." })
    .max(100)
    .optional(),

  artist_name: z
    .string()
    .min(2, { error: "Artist name must be at least 2 characters long." })
    .max(100)
    .optional(),

  instagram_handle: z
    .string()
    .min(2, { error: "Please enter a valid handle." })
    .max(100)
    .optional(),

  phone_number: z
    .string()
    .min(10, { error: "Phone number must be at least 10 digits." })
    .max(20, { error: "Phone number must be under 20 characters." })
    .nonoptional(),

  additional_comments: z
    .string()
    .min(2, { error: "Comment must be at least 2 characters." })
    .max(500)
    .optional(),
});

export function RhizomeMembershipForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
    },
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  async function nextStep() {
    const fieldsByStep: Record<number, (keyof z.infer<typeof formSchema>)[]> = {
      1: ["full_name", "email", "pronouns"],
      2: ["artist_name", "instagram_handle", "phone_number"],
      3: ["additional_comments"],
    };

    const currentFields = fieldsByStep[step];
    const isValid = await form.trigger(currentFields, { shouldFocus: true });

    if (isValid) {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <>
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="he/him, she/her, they/them"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            <FormField
              control={form.control}
              name="artist_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Stage name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="@handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 3 && (
          <FormField
            control={form.control}
            name="additional_comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What are you most excited for this upcoming year, in terms of
                  Rhizome membership?
                </FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[100px] border rounded-md p-2"
                    placeholder="Anything you'd like to share?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {step === 4 && (
          <p className="text-sm font-bold">
            If you’re not able to pay right now, you can still submit your
            application. We’ll review it and reach out to you about next steps.
          </p>
        )}

        {/* Step Navigation */}
        <div className="flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Step {step} of {totalSteps}
        </p>
      </form>
    </Form>
  );
}

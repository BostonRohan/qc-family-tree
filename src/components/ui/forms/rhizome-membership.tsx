"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "../input-group";

const schema = z.object({
  full_name: z
    .string({
      error: "Full name is required.",
    })
    .min(2, { error: "Full name must be at least 2 characters long." })
    .max(100, { error: "Full name must be under 100 characters." }),

  email: z
    .email({ error: "Please enter a valid email address." })
    .max(200, { error: "Email must be under 200 characters." }),

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
    .string({
      error: "Phone number is required.",
    })
    .min(10, { error: "Phone number must be at least 10 digits." })
    .max(20, { error: "Phone number must be under 20 characters." }),

  additional_comments: z
    .string()
    .min(2, { error: "Comment must be at least 2 characters." })
    .max(500)
    .optional(),
});

export function RhizomeMembershipForm() {
  const { register, handleSubmit, control, trigger } = useForm({
    resolver: zodResolver(schema),
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values);
  }

  async function nextStep() {
    const fieldsByStep: Record<number, (keyof z.infer<typeof schema>)[]> = {
      1: ["full_name", "email", "pronouns"],
      2: ["artist_name", "instagram_handle", "phone_number"],
      3: ["additional_comments"],
    };

    const currentFields = fieldsByStep[step];
    const isValid = await trigger(currentFields, { shouldFocus: true });

    if (isValid) {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log(data);
      })}
      className="space-y-6"
    >
      {step === 1 && (
        <FieldGroup>
          <Controller
            name="full_name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Full Name<span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="John Doe"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Email<span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="email"
                  {...field}
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="pronouns"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Pronouns</FieldLabel>
                <Input
                  {...field}
                  placeholder="he/him, she/her, they/them"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      )}

      {step === 2 && (
        <FieldGroup>
          <Controller
            name="artist_name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Artist Name</FieldLabel>
                <Input
                  {...field}
                  placeholder="Stage name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="instagram_handle"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Instagram</FieldLabel>
                <Input
                  {...field}
                  placeholder="@handle"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="phone_number"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Phone Number <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="tel"
                  {...field}
                  placeholder="(555) 123-4567"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      )}

      {step === 3 && (
        <FieldGroup>
          <Controller
            name="additional_comments"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  What are you most excited for this upcoming year, in terms of
                  Rhizome membership?
                </FieldLabel>

                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    rows={6}
                    placeholder="Anything you'd like to share?"
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
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
  );
}

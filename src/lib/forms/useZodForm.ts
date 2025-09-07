import React from 'react';
import { z } from 'zod';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useZodForm<T extends z.ZodTypeAny>(schema: T, initial: z.infer<T>) {
  type Shape = z.infer<T>;
  const [values, setValues] = React.useState<Shape>(initial);
  const [errors, setErrors] = React.useState<FormErrors<Shape>>({});
  const [submitting, setSubmitting] = React.useState(false);

  function set<K extends keyof Shape>(key: K, val: Shape[K]) {
    setValues(prev => ({ ...prev, [key]: val }));
  }

  function onChange<K extends keyof Shape>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const v = (e.target as HTMLInputElement).value as unknown as Shape[K];
      set(key, v);
    };
  }

  function validate(): boolean {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: FormErrors<Shape> = {};
      for (const issue of parsed.error.issues) {
        const pathKey = issue.path[0] as keyof Shape;
        if (pathKey != null && next[pathKey] == null) {
          next[pathKey] = issue.message;
        }
      }
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(cb: (data: Shape) => Promise<void> | void) {
    setSubmitting(true);
    try {
      if (validate()) {
        await cb(values);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    values, set, onChange,
    errors, validate, handleSubmit,
    submitting,
    reset: () => { setValues(initial); setErrors({}); }
  };
}
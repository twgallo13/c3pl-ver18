type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'muted' | 'ghost' | 'link' | 'destructive';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'btn-base inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring';
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'btn-primary bg-[var(--btn-bg-primary)] text-[var(--btn-fg-primary)] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2',
    muted:
      'btn-muted bg-[var(--btn-bg-muted)] text-[var(--btn-fg-muted)] hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2',
    ghost:
      'btn-ghost bg-transparent text-[var(--btn-fg-primary)] hover:bg-black/5 dark:hover:bg-white/5',
    link:
      'btn-link bg-transparent underline underline-offset-2 text-[var(--btn-fg-primary)] hover:opacity-80',
    destructive:
      'btn-destructive bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 dark:bg-red-700 dark:hover:bg-red-800',
  };
  return (
    <button
      data-variant={variant}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

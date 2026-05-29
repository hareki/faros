import { cva } from 'class-variance-authority';

export const linkVariants = cva(`
  transition-colors
  hover:text-primary
`, {
  variants: {
    variant: {
      default: 'underline underline-offset-3',
      action: 'font-semibold text-foreground no-underline',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

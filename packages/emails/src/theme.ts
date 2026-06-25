import { type ComponentProps } from 'react';

import { type Tailwind, pixelBasedPreset } from 'react-email';

// Email-safe mirror of the app design system. Email clients can't read the app's
// CSS custom properties (src/styles/theme.css) or its local SVN-Rubik font, so the
// semantic tokens below are hardcoded to the Catppuccin Latte (light) palette and the
// font is the Vietnamese-capable Google Roboto. The shape intentionally mirrors the
// app's semantic names so the wrapper components can reuse the same class vocabulary
// (text-foreground, bg-primary, rounded-4xl, …) as src/components/ui.

// --- Catppuccin Latte (light) — subset used, from src/styles/catppuccin.css ---
export const latte = {
  base: '#fff',
  text: '#4c4f69',
  subtext0: '#6c6f85',
  surface0: '#dbdee5',
  surface1: '#d0d3db',
  overlay1: '#afb1bd',
  blue: '#1e66f5',
  red: '#d20f39',
} as const;

// --- Semantic tokens — mirrors the :root mapping in src/styles/theme.css (light) ---
export const tokens = {
  background: latte.base,
  foreground: latte.text,
  card: latte.base,
  cardForeground: latte.text,
  popover: latte.base,
  popoverForeground: latte.text,
  primary: latte.blue,
  primaryForeground: latte.base,
  secondary: latte.surface0,
  secondaryForeground: latte.text,
  muted: latte.surface0,
  mutedForeground: latte.subtext0,
  accent: latte.surface0,
  accentForeground: latte.text,
  destructive: latte.red,
  border: latte.surface1,
  input: latte.surface0,
  ring: latte.overlay1,
} as const;

// --- Radius — app scale (--radius: 0.625rem) converted to px. pixelBasedPreset
// requires no rem. rounded-4xl (26px) matches src/components/ui/Button/variants.ts. ---
export const radius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '14px',
  '2xl': '18px',
  '3xl': '22px',
  '4xl': '26px',
} as const;

export const fontFamily = 'Roboto, Helvetica, Arial, sans-serif';

type TailwindConfig = NonNullable<ComponentProps<typeof Tailwind>['config']>;

// The single <Tailwind config> shared by every email — re-declares the app's semantic
// color names + radius scale so wrapper components can mimic src/components/ui classes.
export const tailwindConfig: TailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        background: tokens.background,
        foreground: tokens.foreground,
        card: tokens.card,
        'card-foreground': tokens.cardForeground,
        popover: tokens.popover,
        'popover-foreground': tokens.popoverForeground,
        primary: tokens.primary,
        'primary-foreground': tokens.primaryForeground,
        secondary: tokens.secondary,
        'secondary-foreground': tokens.secondaryForeground,
        muted: tokens.muted,
        'muted-foreground': tokens.mutedForeground,
        accent: tokens.accent,
        'accent-foreground': tokens.accentForeground,
        destructive: tokens.destructive,
        border: tokens.border,
        input: tokens.input,
        ring: tokens.ring,
      },
      borderRadius: { ...radius },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
};

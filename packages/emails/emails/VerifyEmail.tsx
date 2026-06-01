import { CtaLayout, type CtaLayoutProps } from '../src/layouts/CtaLayout';

export type VerifyEmailProps = CtaLayoutProps;

// Presentational only — all copy arrives as already-translated props from the
// app-side sender. Styled with the mimicked app design system in ../components.
export default function VerifyEmail(props: VerifyEmailProps) {
  return <CtaLayout {...props} />;
}

VerifyEmail.PreviewProps = {
  previewText: 'Verify your email to finish setting up your Faros account',
  heading: 'Verify your email',
  body: 'Thanks for signing up for Faros. Click the button below to verify your email address',
  cta: 'Verify email',
  fallback: 'or copy and paste this URL into your browser:',
  footer: "If you didn't request this email, you can safely ignore it.",
  url: 'https://faros.app/api/auth/verify-email?token=preview-token',
} satisfies VerifyEmailProps;

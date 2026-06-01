import { CtaLayout, type CtaLayoutProps } from '../src/layouts/CtaLayout';

export type ResetPasswordEmailProps = CtaLayoutProps;

// Presentational only — all copy arrives as already-translated props from the
// app-side sender. Styled with the mimicked app design system in ../components.
export default function ResetPasswordEmail(props: ResetPasswordEmailProps) {
  return <CtaLayout {...props} />;
}

ResetPasswordEmail.PreviewProps = {
  previewText: 'Reset the password for your Faros account',
  heading: 'Reset your password',
  body: 'We received a request to reset your Faros password. Click the button below to choose a new one.',
  cta: 'Reset password',
  fallback: 'or copy and paste this URL into your browser:',
  footer:
    "This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.",
  url: 'https://faros.app/reset-password?token=preview-token',
} satisfies ResetPasswordEmailProps;

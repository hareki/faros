import { CtaLayout, type CtaLayoutProps } from '../src/layouts/CtaLayout';

export type ExistingAccountEmailProps = CtaLayoutProps;

// Presentational only — all copy arrives as already-translated props from the
// app-side sender. Styled with the mimicked app design system in ../components.
export default function ExistingAccountEmail(props: ExistingAccountEmailProps) {
  return <CtaLayout {...props} />;
}

ExistingAccountEmail.PreviewProps = {
  previewText: 'Someone tried to sign up with your Faros email',
  heading: 'You already have an account',
  body: 'Someone just tried to create a Faros account with this email. If that was you, simply sign in. If not, you can safely ignore this email.',
  cta: 'Go to sign in',
  fallback: 'or copy and paste this URL into your browser:',
  footer: "If you didn't request this email, you can safely ignore it.",
  url: 'https://faros.app/sign-in',
} satisfies ExistingAccountEmailProps;

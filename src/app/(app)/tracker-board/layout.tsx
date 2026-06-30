import { Fragment, type ReactNode } from 'react';

// Parallel `@modal` slot hosts the intercepted detail Dialog over the board (soft-nav). On a
// hard load the slot resolves to default.tsx (null) and `[applicationId]/page.tsx` renders the
// full page instead. See ADR-0008.
export default function TrackerBoardLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <Fragment>
      {children}
      {modal}
    </Fragment>
  );
}

import { type SVGProps, type ReactNode } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
type IconComp = (props: IconProps) => ReactNode;

export function createIcon(Comp: IconComp): IconComp {
  function Icon({ className, ...props }: IconProps) {
    return (
      <Comp
        className={`
          tabler-icon
          ${className}
        `}
        {...props}
      />
    );
  }

  return Icon;
}

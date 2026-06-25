'use client';

import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from '@teispace/next-themes';

import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/src/components/ui/DropdownMenu';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type ThemeSwitcherProps = {
  messages: ClientMessages['layout']['theme'];
};

export function ThemeSwitcher({ messages }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'system', label: messages.system, icon: IconDeviceDesktop },
    { value: 'light', label: messages.light, icon: IconSun },
    { value: 'dark', label: messages.dark, icon: IconMoon },
  ];

  const ActiveIcon = options.find((option) => option.value === theme)?.icon ?? IconDeviceDesktop;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ActiveIcon />
        {messages.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
          }}
        >
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

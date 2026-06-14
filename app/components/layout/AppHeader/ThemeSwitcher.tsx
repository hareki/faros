'use client';

import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from '@teispace/next-themes';

import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { Button } from '../../ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../../ui/DropdownMenu';

type ThemeButtonProps = {
  messages: ClientMessages['layout']['theme'];
};

export function ThemeSwitcher({ messages }: ThemeButtonProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'system', label: messages.system, icon: IconDeviceDesktop },
    { value: 'light', label: messages.light, icon: IconSun },
    { value: 'dark', label: messages.dark, icon: IconMoon },
  ];

  const ActiveIcon = options.find((option) => option.value === theme)?.icon ?? IconDeviceDesktop;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size='icon' variant='outline' aria-label={messages.label}>
            <ActiveIcon />
          </Button>
        }
      />
      <DropdownMenuContent align='end'>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
          }}
        >
          <DropdownMenuLabel>{messages.label}</DropdownMenuLabel>
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

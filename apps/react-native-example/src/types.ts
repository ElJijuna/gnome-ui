export const COMPONENT_NAMES = [
  'Button',
  'Text',
  'Link',
  'TextField',
  'Switch',
  'Checkbox',
  'RadioButton',
  'Separator',
  'Card',
  'BoxedList',
  'ActionRow',
  'HeaderBar',
  'Tabs',
  'ViewSwitcher',
  'Sidebar',
  'SearchBar',
  'PathBar',
  'Spinner',
  'ProgressBar',
  'Skeleton',
  'Toast',
  'Banner',
  'Dialog',
  'Tooltip',
  'Icon',
  'AnimatedIcon',
  'Dropdown',
] as const;

export type ComponentName = (typeof COMPONENT_NAMES)[number];

export type Screen = 'home' | ComponentName;

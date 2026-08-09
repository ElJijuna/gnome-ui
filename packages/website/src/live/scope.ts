import * as ChartsExports from '@gnome-ui/charts';
import * as IconsExports from '@gnome-ui/icons';
import * as LayoutExports from '@gnome-ui/layout';
import * as ReactExports from '@gnome-ui/react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Combined scope for react-live previews of react/layout/charts component
 * examples. `React` itself is injected by react-live automatically; this
 * only needs to cover the hooks example snippets call bare (not
 * `React.useState(...)`). Deliberately excludes `@gnome-ui/hooks` — hooks
 * aren't live-rendered (see the website README), and a couple of its
 * exports (`useColorScheme`, `useBreakpoint`) share a name with an
 * unrelated `@gnome-ui/react` hook of the same name; keeping hooks out
 * avoids that collision entirely rather than relying on spread order.
 */
export const liveScope: Record<string, unknown> = {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ...IconsExports,
  ...ChartsExports,
  ...LayoutExports,
  ...ReactExports,
};

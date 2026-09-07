import { ViewConceal, ViewReveal } from '@gnome-ui/icons';
import { forwardRef, type ReactNode, useState } from 'react';
import type { TextInput } from 'react-native';

import { EntryRow, type EntryRowProps } from '@/components/EntryRow';
import { IconButton } from '@/components/IconButton';

export interface PasswordEntryRowProps extends Omit<EntryRowProps, 'secureTextEntry' | 'trailing'> {
  /** Additional trailing widgets placed before the reveal button. */
  trailing?: ReactNode;
}

/**
 * Password entry row with a built-in reveal/conceal toggle, mirroring
 * `AdwPasswordEntryRow` and `@gnome-ui/react`'s own `PasswordEntryRow`. It's
 * an `EntryRow` that masks its input and always carries a trailing button to
 * show or hide what's been typed. Use inside a `BoxedList` for password
 * settings fields — and don't add your own reveal button through `trailing`,
 * which is for anything that should sit *before* this one.
 *
 * `type={revealed ? 'text' : 'password'}` becomes RN's own
 * `secureTextEntry`, and `autoComplete="current-password"` ports as-is —
 * RN's `autoComplete` accepts the same value and is what lets password
 * managers and the platform keyboard offer a saved credential. Pass
 * `"new-password"` on registration or change-password forms.
 *
 * The reveal control is the already-shipped `IconButton` rather than a
 * hand-rolled pressable, which costs one visual detail: `IconButton` is
 * circular (it's `Button` at `shape="circular"`), where the web's
 * `.revealButton` is a 32 dp square with a 6 dp radius. A circular flat icon
 * button is the idiomatic touch control and keeps this row consistent with
 * every other icon action in the package, so it's the better trade than
 * introducing a fifth flat-pressable implementation. The CSS's resting
 * `opacity: 0.55` is dropped too: it exists so the button can brighten on
 * hover, and with no hover on a touch device a permanently dimmed control is
 * just harder to see — the same reasoning that collapses `:hover` everywhere
 * else here.
 *
 * The web needs `e.stopPropagation()` so pressing the button doesn't also
 * trigger the row's focus-the-input click. RN's responder system routes a
 * touch to the innermost pressable, so there's nothing to stop.
 *
 * @example
 * <BoxedList>
 *   <PasswordEntryRow title="Password" value={password} onValueChange={setPassword} />
 * </BoxedList>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PasswordEntryRow.html
 */
export const PasswordEntryRow = forwardRef<TextInput, PasswordEntryRowProps>(
  function PasswordEntryRow(
    { trailing, disabled = false, autoComplete = 'current-password', ...props },
    ref,
  ) {
    const [revealed, setRevealed] = useState(false);

    return (
      <EntryRow
        ref={ref}
        {...props}
        autoComplete={autoComplete}
        secureTextEntry={!revealed}
        disabled={disabled}
        trailing={
          <>
            {trailing}
            <IconButton
              icon={revealed ? ViewConceal : ViewReveal}
              label={revealed ? 'Conceal password' : 'Reveal password'}
              variant="flat"
              disabled={disabled}
              accessibilityState={{ selected: revealed, disabled }}
              onPress={() => setRevealed((current) => !current)}
            />
          </>
        }
      />
    );
  },
);

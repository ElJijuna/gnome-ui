import type { ReactNode } from 'react';

import {
  type AlertDialogResponse,
  type DialogProps,
  Dialog,
} from '../Dialog';

export interface AlertDialogProps
  extends Omit<
    DialogProps,
    'buttons' | 'children' | 'role' | 'responses' | 'title' | 'onResponse'
  > {
  /** Dialog heading. */
  title: ReactNode;
  /** Short explanatory message. */
  message?: ReactNode;
  /** Response buttons returned through `onResponse`. */
  responses: AlertDialogResponse[];
  /** Called with the selected response id. */
  onResponse: (id: string) => void;
  /** Optional rich content rendered below the message. */
  children?: ReactNode;
}

/**
 * Semantic confirmation/warning dialog following the Adwaita `AdwAlertDialog`
 * pattern.
 */
export const AlertDialog = ({
  title,
  message,
  responses,
  onResponse,
  children,
  ...props
}: AlertDialogProps) => {
  return (
    <Dialog
      {...props}
      role="alertdialog"
      title={title}
      responses={responses}
      onResponse={onResponse}
    >
      {message}
      {children}
    </Dialog>
  );
};

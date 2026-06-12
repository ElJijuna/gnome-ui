import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Toast } from '../Toast';

import { ToastOverlay } from './ToastOverlay';

describe('ToastOverlay', () => {
  it('renders content and local notifications stack', () => {
    render(
      <ToastOverlay toasts={<Toast title="Saved" duration={0} />}>
        <main>Document</main>
      </ToastOverlay>,
    );

    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('does not render the stack when there are no toasts', () => {
    render(<ToastOverlay>Document</ToastOverlay>);

    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();
  });
});

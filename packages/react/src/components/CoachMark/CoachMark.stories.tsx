import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { HeaderBar } from '@/components/HeaderBar';

import { CoachMark } from './CoachMark';
import { CoachMarkTour } from './CoachMarkTour';
import readme from './README.md?raw';

const meta: Meta<typeof CoachMark> = {
  title: 'Components/CoachMark',
  component: CoachMark,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: readme,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CoachMark>;

// ─── Single mark ──────────────────────────────────────────────────────────────

export const Basic: Story = {
  render: function BasicStory() {
    const target = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);

    return (
      <div style={{ padding: 48, minHeight: 320 }}>
        <p style={{ marginBottom: 24 }}>
          {!open && (
            <Button variant="flat" onClick={() => setOpen(true)}>
              Replay coach mark
            </Button>
          )}
        </p>

        <Button ref={target} variant="suggested">
          Sync now
        </Button>

        <CoachMark
          open={open}
          targetRef={target}
          title="Sync your files"
          description="Press this any time to push changes to every signed-in device."
          primaryAction={{ label: 'Got it', onClick: () => setOpen(false) }}
          onDismiss={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ─── Without spotlight ────────────────────────────────────────────────────────

export const NoSpotlight: Story = {
  render: function NoSpotlightStory() {
    const target = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);

    return (
      <div style={{ padding: 48, minHeight: 260 }}>
        <Button ref={target}>Filters</Button>
        <CoachMark
          open={open}
          targetRef={target}
          spotlight={false}
          placement="right"
          title="Narrow the list"
          description="Filters stack — combine as many as you like."
          primaryAction={{ label: 'Dismiss', onClick: () => setOpen(false) }}
          onDismiss={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ─── Guided tour ──────────────────────────────────────────────────────────────

export const Tour: StoryObj<typeof CoachMarkTour> = {
  render: function TourStory() {
    const searchRef = useRef<HTMLButtonElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLButtonElement>(null);
    const [running, setRunning] = useState(true);

    return (
      <div style={{ minHeight: 360 }}>
        <HeaderBar
          title="Gallery"
          end={
            <>
              <Button ref={searchRef} variant="flat">
                Search
              </Button>
              <Button ref={addRef} variant="flat">
                Add
              </Button>
              <Button ref={menuRef} variant="flat">
                Menu
              </Button>
            </>
          }
        />

        <div style={{ padding: 48 }}>
          {!running && (
            <Button variant="suggested" onClick={() => setRunning(true)}>
              Start tour
            </Button>
          )}
        </div>

        <CoachMarkTour
          open={running}
          steps={[
            {
              targetRef: searchRef,
              title: 'Find anything',
              description: 'Search across your whole gallery from here.',
            },
            {
              targetRef: addRef,
              title: 'Add items',
              description: 'Import photos or create a new album.',
            },
            {
              targetRef: menuRef,
              title: 'Everything else',
              description: 'Settings, sharing, and help live in this menu.',
              placement: 'left',
            },
          ]}
          onFinish={() => setRunning(false)}
          onSkip={() => setRunning(false)}
        />
      </div>
    );
  },
};

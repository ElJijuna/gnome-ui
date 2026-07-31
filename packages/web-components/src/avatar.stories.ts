import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './avatar';

const PHOTO_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<rect width="64" height="64" fill="#9141ac"/>' +
      '<circle cx="32" cy="24" r="12" fill="#fff" fill-opacity="0.85"/>' +
      '<ellipse cx="32" cy="58" rx="20" ry="16" fill="#fff" fill-opacity="0.85"/>' +
      '</svg>',
  );

interface AvatarArgs {
  color:
    | ''
    | 'blue'
    | 'brown'
    | 'green'
    | 'orange'
    | 'purple'
    | 'red'
    | 'slate'
    | 'teal'
    | 'yellow';
  name: string;
  showImage: boolean;
  size: 'lg' | 'md' | 'sm' | 'xl';
}

function renderAvatar(args: AvatarArgs) {
  const story = document.createElement('main');
  story.className = 'wc-story';

  const demo = document.createElement('div');
  demo.className = 'wc-story__demo';
  demo.style.flexDirection = 'row';
  demo.style.alignItems = 'center';
  demo.style.gap = 'var(--gnome-space-3, 18px)';

  const avatar = document.createElement('gnome-avatar');
  avatar.name = args.name;
  avatar.size = args.size;

  if (args.color) {
    avatar.color = args.color;
  }

  if (args.showImage) {
    const image = document.createElement('img');
    image.dataset.slot = 'avatar-image';
    image.src = PHOTO_DATA_URI;
    avatar.append(image);
  }

  demo.append(avatar);
  story.append(demo);

  return story;
}

const meta = {
  title: 'Web Components/Avatar',
  component: 'gnome-avatar',
  tags: ['autodocs'],
  render: renderAvatar,
  args: {
    color: '',
    name: 'Ada Lovelace',
    showImage: false,
    size: 'md',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['', 'blue', 'green', 'yellow', 'orange', 'red', 'purple', 'brown', 'teal', 'slate'],
      description: 'Overrides the name-derived color. Empty string uses the automatic hash.',
    },
    name: {
      control: 'text',
      description: 'Used to derive initials and (unless color is set) a deterministic color.',
    },
    showImage: {
      control: 'boolean',
      description: 'Composes a real <img data-slot="avatar-image">.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Circular avatar with an image or a name-derived initials fallback. The image is a real native <img>; its own error event drives the fallback.',
      },
    },
  },
} satisfies Meta<AvatarArgs>;

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Initials: Story = {};

export const Image: Story = {
  args: {
    showImage: true,
  },
};

export const BrokenImage: Story = {
  name: 'Broken image (falls back to initials)',
  args: {
    name: 'Grace Hopper',
    showImage: true,
  },
  render: (args) => {
    const story = renderAvatar(args);
    const image = story.querySelector<HTMLImageElement>('[data-slot="avatar-image"]');

    if (image) {
      image.src = '/this-image-does-not-exist.png';
    }

    return story;
  },
};

export const Large: Story = {
  args: {
    name: 'Grace Hopper',
    size: 'xl',
  },
};

export const NoName: Story = {
  name: 'No name or image',
  args: {
    name: '',
  },
};

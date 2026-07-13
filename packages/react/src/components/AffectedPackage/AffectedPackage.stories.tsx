import type { Meta, StoryObj } from '@storybook/react-vite';

import { AffectedPackage } from './AffectedPackage';

const meta: Meta<typeof AffectedPackage> = {
  title: 'Components/AffectedPackage',
  component: AffectedPackage,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof AffectedPackage>;

export const NpmPackage: Story = {
  args: {
    ecosystem: 'npm',
    name: 'lodash',
    version: '4.17.20',
    fixedVersion: '4.17.21',
  },
};

export const DebianPackage: Story = {
  args: {
    ecosystem: 'deb',
    name: 'openssl',
    version: '3.0.11-1',
    fixedVersion: '3.0.11-1+deb12u2',
    purl: 'pkg:deb/debian/openssl@3.0.11-1',
  },
};

export const ContainerLayerDigest: Story = {
  args: {
    ecosystem: 'oci',
    name: 'ghcr.io/example/api',
    version: 'sha-7f3d9c1',
    digest: 'sha256:9f86d081884c7d659a2feaa0c55ad015',
  },
};

import { Text } from '@gnome-ui/react';
import { Component, type ReactNode } from 'react';
import { LiveError, LivePreview, LiveProvider } from 'react-live';

import { useTranslation } from '@/i18n/I18nContext';

import { liveScope } from './scope';

/**
 * Strips import lines (the scope covers everything they'd bring in), then
 * wraps the snippet in a Fragment when it's nothing but sibling JSX lines —
 * e.g. two prose-example `<p>...</p>` lines in a row, which is valid inside
 * a README but not as a standalone expression (multiple JSX roots need a
 * common parent). Left alone when the snippet has leading statements (like
 * `const [value, setValue] = useState(...)`) ahead of a single JSX root,
 * which react-live already handles.
 */
function prepareLiveCode(code: string): string {
  const lines = code.split('\n').filter((line) => !/^\s*import\s/.test(line));
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);
  const isJsxOnly = nonEmptyLines.length > 1 && nonEmptyLines.every((line) => line.startsWith('<'));
  const trimmed = lines.join('\n').trim();

  return isJsxOnly ? `<>\n${trimmed}\n</>` : trimmed;
}

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
}

/**
 * Second line of defense around `LiveProvider` — react-live already catches
 * compile/runtime errors in the transformed snippet internally (surfaced via
 * `LiveError`), but this guards against anything that slips past that (e.g.
 * an example using a hook outside a component context) crashing the whole
 * page instead of just this one preview.
 */
class PreviewBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export interface LiveExampleProps {
  code: string;
}

/** Evaluates a README code example live, with `@gnome-ui/*` exports in scope. */
export const LiveExample = ({ code }: LiveExampleProps) => {
  const { t } = useTranslation();
  const fallback = (
    <Text variant="body" color="dim">
      {t('component.previewError')}
    </Text>
  );

  return (
    <PreviewBoundary fallback={fallback}>
      <LiveProvider code={prepareLiveCode(code)} scope={liveScope}>
        <LiveError style={{ color: 'var(--gnome-error-color, #e01b24)', display: 'block' }} />
        <LivePreview />
      </LiveProvider>
    </PreviewBoundary>
  );
};

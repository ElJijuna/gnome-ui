import {
  EmojiActivities,
  EmojiBody,
  EmojiFlags,
  EmojiFood,
  EmojiNature,
  EmojiObjects,
  EmojiPeople,
  EmojiRecent,
  EmojiSymbols,
  EmojiTravel,
  type IconDefinition,
  Search,
} from '@gnome-ui/icons';
import { type HTMLAttributes, type ReactElement, useRef, useState } from 'react';

import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Popover, type PopoverPlacement } from '../Popover';

import { CATEGORY_LABELS, CATEGORY_ORDER, type EmojiCategory, EMOJI_DATA } from './emojiData';
import styles from './EmojiPicker.module.css';

const CATEGORY_ICONS: Record<EmojiCategory, IconDefinition> = {
  people: EmojiPeople,
  body: EmojiBody,
  nature: EmojiNature,
  food: EmojiFood,
  activities: EmojiActivities,
  travel: EmojiTravel,
  objects: EmojiObjects,
  symbols: EmojiSymbols,
  flags: EmojiFlags,
};

export interface EmojiPickerProps {
  /** Called with the emoji character when the user picks one. */
  onSelect: (emoji: string) => void;
  /** The trigger element that opens the picker. */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  /**
   * Preferred popover placement relative to the trigger.
   * @default 'bottom'
   */
  placement?: PopoverPlacement;
  /**
   * Maximum number of recently used emoji shown in the "Recently used" section.
   * @default 12
   */
  maxRecent?: number;
}

/**
 * Searchable emoji grid in a `Popover`. Mirrors `GtkEmojiChooser`: a search
 * field filters the flat emoji list, otherwise emoji are grouped by category
 * with a jump-to-category tab bar at the bottom (matching the real Adwaita
 * widget's clickable category strip).
 *
 * Recently used emoji are tracked in memory for the current session only —
 * they are not persisted across page reloads.
 */
export const EmojiPicker = ({
  onSelect,
  children,
  placement = 'bottom',
  maxRecent = 12,
}: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const sectionRefs = useRef<Partial<Record<EmojiCategory, HTMLElement | null>>>({});
  const recentSectionRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
    }
  };

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setRecent((prev) => [emoji, ...prev.filter((e) => e !== emoji)].slice(0, maxRecent));
    setOpen(false);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? EMOJI_DATA.filter((e) => e.name.includes(normalizedQuery))
    : null;

  const scrollToCategory = (cat: EmojiCategory) => {
    sectionRefs.current[cat]?.scrollIntoView({ block: 'start' });
  };

  const pickerContent = (
    <div className={styles.picker}>
      <div className={styles.searchRow}>
        <Icon icon={Search} size="sm" aria-hidden className={styles.searchIcon} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emoji…"
          aria-label="Search emoji"
          className={styles.searchInput}
          autoFocus
        />
      </div>

      <div className={styles.grid}>
        {filtered ? (
          filtered.length > 0 ? (
            <div className={styles.row}>
              {filtered.map((e) => (
                <button
                  key={e.char}
                  type="button"
                  className={styles.emoji}
                  aria-label={e.name}
                  onClick={() => handleSelect(e.char)}
                >
                  {e.char}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No results</p>
          )
        ) : (
          <>
            {recent.length > 0 && (
              <section ref={recentSectionRef}>
                <h3 className={styles.sectionHeading}>Recently used</h3>
                <div className={styles.row}>
                  {recent.map((char, i) => (
                    <button
                      key={`${char}-${i}`}
                      type="button"
                      className={styles.emoji}
                      aria-label={char}
                      onClick={() => handleSelect(char)}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {CATEGORY_ORDER.map((cat) => (
              <section
                key={cat}
                ref={(node) => {
                  sectionRefs.current[cat] = node;
                }}
              >
                <h3 className={styles.sectionHeading}>{CATEGORY_LABELS[cat]}</h3>
                <div className={styles.row}>
                  {EMOJI_DATA.filter((e) => e.category === cat).map((e) => (
                    <button
                      key={e.char}
                      type="button"
                      className={styles.emoji}
                      aria-label={e.name}
                      onClick={() => handleSelect(e.char)}
                    >
                      {e.char}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>

      {!filtered && (
        <div className={styles.tabs} aria-label="Emoji categories">
          {recent.length > 0 && (
            <IconButton
              icon={EmojiRecent}
              label="Recently used"
              tooltip="Recently used"
              size="sm"
              variant="flat"
              onClick={() => recentSectionRef.current?.scrollIntoView({ block: 'start' })}
            />
          )}
          {CATEGORY_ORDER.map((cat) => (
            <IconButton
              key={cat}
              icon={CATEGORY_ICONS[cat]}
              label={CATEGORY_LABELS[cat]}
              tooltip={CATEGORY_LABELS[cat]}
              size="sm"
              variant="flat"
              onClick={() => scrollToCategory(cat)}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      placement={placement}
      open={open}
      onOpenChange={handleOpenChange}
      content={pickerContent}
    >
      {children}
    </Popover>
  );
};

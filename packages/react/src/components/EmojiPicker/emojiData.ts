export type EmojiCategory =
  | 'people'
  | 'body'
  | 'nature'
  | 'food'
  | 'activities'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface EmojiEntry {
  /** The emoji character itself. */
  char: string;
  /** Descriptive name — used for search matching and as the accessible label. */
  name: string;
  category: EmojiCategory;
}

/**
 * Curated set of common emoji grouped by category, mirroring
 * `GtkEmojiChooser`'s category tabs. Not an exhaustive Unicode CLDR
 * dataset — just enough per category for a representative picker.
 */
export const EMOJI_DATA: EmojiEntry[] = [
  // ─── Smileys & People ─────────────────────────────────────────────────────
  { char: '😀', name: 'grinning face', category: 'people' },
  { char: '😂', name: 'face with tears of joy', category: 'people' },
  { char: '😊', name: 'smiling face with smiling eyes', category: 'people' },
  { char: '😍', name: 'heart eyes', category: 'people' },
  { char: '🤔', name: 'thinking face', category: 'people' },
  { char: '😢', name: 'crying face', category: 'people' },
  { char: '😎', name: 'smiling face with sunglasses', category: 'people' },
  { char: '😴', name: 'sleeping face', category: 'people' },
  { char: '🥳', name: 'partying face', category: 'people' },
  { char: '😡', name: 'angry face', category: 'people' },
  { char: '🙂', name: 'slightly smiling face', category: 'people' },
  { char: '😅', name: 'grinning face with sweat', category: 'people' },

  // ─── Body ─────────────────────────────────────────────────────────────────
  { char: '👍', name: 'thumbs up', category: 'body' },
  { char: '👎', name: 'thumbs down', category: 'body' },
  { char: '👋', name: 'waving hand', category: 'body' },
  { char: '👏', name: 'clapping hands', category: 'body' },
  { char: '🙏', name: 'folded hands', category: 'body' },
  { char: '💪', name: 'flexed biceps', category: 'body' },
  { char: '✌️', name: 'victory hand', category: 'body' },
  { char: '🤝', name: 'handshake', category: 'body' },
  { char: '👀', name: 'eyes', category: 'body' },
  { char: '🧠', name: 'brain', category: 'body' },

  // ─── Nature ───────────────────────────────────────────────────────────────
  { char: '🐶', name: 'dog face', category: 'nature' },
  { char: '🐱', name: 'cat face', category: 'nature' },
  { char: '🦊', name: 'fox', category: 'nature' },
  { char: '🐻', name: 'bear', category: 'nature' },
  { char: '🐼', name: 'panda', category: 'nature' },
  { char: '🐸', name: 'frog', category: 'nature' },
  { char: '🌸', name: 'cherry blossom', category: 'nature' },
  { char: '🌵', name: 'cactus', category: 'nature' },
  { char: '🌈', name: 'rainbow', category: 'nature' },
  { char: '☀️', name: 'sun', category: 'nature' },
  { char: '🌙', name: 'crescent moon', category: 'nature' },
  { char: '⭐', name: 'star', category: 'nature' },

  // ─── Food & Drink ─────────────────────────────────────────────────────────
  { char: '🍎', name: 'red apple', category: 'food' },
  { char: '🍕', name: 'pizza', category: 'food' },
  { char: '🍔', name: 'hamburger', category: 'food' },
  { char: '🍟', name: 'french fries', category: 'food' },
  { char: '🍣', name: 'sushi', category: 'food' },
  { char: '🍩', name: 'doughnut', category: 'food' },
  { char: '🍦', name: 'soft ice cream', category: 'food' },
  { char: '☕', name: 'hot beverage', category: 'food' },
  { char: '🍺', name: 'beer mug', category: 'food' },
  { char: '🍰', name: 'shortcake', category: 'food' },

  // ─── Activities ───────────────────────────────────────────────────────────
  { char: '⚽', name: 'soccer ball', category: 'activities' },
  { char: '🏀', name: 'basketball', category: 'activities' },
  { char: '🎮', name: 'video game', category: 'activities' },
  { char: '🎸', name: 'guitar', category: 'activities' },
  { char: '🎨', name: 'artist palette', category: 'activities' },
  { char: '🎉', name: 'party popper', category: 'activities' },
  { char: '🏆', name: 'trophy', category: 'activities' },
  { char: '🎯', name: 'direct hit target', category: 'activities' },

  // ─── Travel & Places ──────────────────────────────────────────────────────
  { char: '✈️', name: 'airplane', category: 'travel' },
  { char: '🚗', name: 'automobile car', category: 'travel' },
  { char: '🚀', name: 'rocket', category: 'travel' },
  { char: '🚲', name: 'bicycle', category: 'travel' },
  { char: '🏝️', name: 'desert island', category: 'travel' },
  { char: '🗽', name: 'statue of liberty', category: 'travel' },
  { char: '🗻', name: 'mount fuji mountain', category: 'travel' },
  { char: '🏠', name: 'house home', category: 'travel' },

  // ─── Objects ──────────────────────────────────────────────────────────────
  { char: '💡', name: 'light bulb idea', category: 'objects' },
  { char: '💻', name: 'laptop computer', category: 'objects' },
  { char: '📱', name: 'mobile phone', category: 'objects' },
  { char: '📚', name: 'books', category: 'objects' },
  { char: '✉️', name: 'envelope mail', category: 'objects' },
  { char: '🔑', name: 'key', category: 'objects' },
  { char: '🔒', name: 'locked padlock', category: 'objects' },
  { char: '🎁', name: 'wrapped gift', category: 'objects' },
  { char: '⏰', name: 'alarm clock', category: 'objects' },

  // ─── Symbols ──────────────────────────────────────────────────────────────
  { char: '❤️', name: 'red heart love', category: 'symbols' },
  { char: '✅', name: 'check mark button', category: 'symbols' },
  { char: '❌', name: 'cross mark', category: 'symbols' },
  { char: '⚠️', name: 'warning sign', category: 'symbols' },
  { char: '❓', name: 'question mark', category: 'symbols' },
  { char: '💯', name: 'hundred points', category: 'symbols' },
  { char: '🔥', name: 'fire flame', category: 'symbols' },
  { char: '✨', name: 'sparkles', category: 'symbols' },
  { char: '♻️', name: 'recycling symbol', category: 'symbols' },

  // ─── Flags ────────────────────────────────────────────────────────────────
  { char: '🏳️', name: 'white flag', category: 'flags' },
  { char: '🏁', name: 'checkered flag', category: 'flags' },
  { char: '🏴‍☠️', name: 'pirate flag', category: 'flags' },
  { char: '🌍', name: 'globe showing europe africa', category: 'flags' },
];

export const CATEGORY_LABELS: Record<EmojiCategory, string> = {
  people: 'Smileys & People',
  body: 'Body',
  nature: 'Nature',
  food: 'Food & Drink',
  activities: 'Activities',
  travel: 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

export const CATEGORY_ORDER: EmojiCategory[] = [
  'people',
  'body',
  'nature',
  'food',
  'activities',
  'travel',
  'objects',
  'symbols',
  'flags',
];

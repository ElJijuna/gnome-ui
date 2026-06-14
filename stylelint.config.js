import superConfig from 'super-configs/stylelint';

export default {
  ...superConfig,
  rules: {
    ...superConfig.rules,
    // CSS Modules pseudo-classes
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],
    // Vendor prefix duplicates (backdrop-filter, appearance, etc.) are intentional
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-syntaxes'] },
    ],
    // --_gap / --_span convention for private custom properties
    'custom-property-pattern': /^_?[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    // Component state selectors (.item:hover first, then .item:disabled) are intentional
    'no-descending-specificity': null,
    // Intentional cascade overrides split across two same-name blocks are valid CSS
    'no-duplicate-selectors': null,
  },
};

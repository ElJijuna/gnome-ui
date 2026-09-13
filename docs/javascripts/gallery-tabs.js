/*
 * Platform-switcher tabs for the Component Gallery page. Loaded via
 * `extra_javascript` (not an inline <script> in the markdown) on purpose:
 * Material's `navigation.instant` feature swaps only the body's content
 * region on internal navigation, and a <script> tag arriving as part of
 * that swapped-in HTML never executes (browsers don't run scripts inserted
 * via innerHTML) — so an inline script would silently stop working the
 * moment a user reached this page via instant navigation instead of a
 * hard load. A script loaded through `extra_javascript` instead lives in
 * the persistent page shell and runs exactly once per real page load,
 * so the delegated listener below keeps working across every later
 * instant-nav swap for the lifetime of the browsing session.
 */
document.addEventListener('click', function (event) {
  var tab = event.target.closest('.gnome-platform-tab');
  if (!tab) {
    return;
  }

  var { group } = tab.dataset;
  var { target } = tab.dataset;

  document
    .querySelectorAll('.gnome-platform-tab[data-group="' + group + '"]')
    .forEach(function (t) {
      t.classList.toggle('is-active', t === tab);
    });

  document
    .querySelectorAll('.gnome-platform-panel[data-group="' + group + '"]')
    .forEach(function (panel) {
      panel.hidden = panel.dataset.platform !== target;
    });
});

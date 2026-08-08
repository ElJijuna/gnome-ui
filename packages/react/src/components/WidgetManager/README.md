Card that manages a controlled collection of "widgets" picked from a
`catalog`, each rendering its own content via `render()`. The header's edit
button toggles a dashed "add widget" trigger that opens a catalog picker —
`Modal`, `BottomSheet`, or `Drawer`, chosen with `pickerSurface`. Adding and
removing is staged inside the picker and only applied through `onChange`
when the user confirms; canceling discards the staging. Widgets can only be
removed through the picker, not inline in the card.

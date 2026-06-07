Color palette picker following the Adwaita `GtkColorButton` + swatch pattern.

Renders a row of circular `ColorSwatch` items backed by a `radiogroup`.
Arrow keys move focus and selection. Optionally adds a "Custom…" button
backed by a hidden native `<input type="color">`.

The default palette matches the 9 Adwaita named colors (also used by `Avatar`).

```tsx
import { ColorPicker, GNOME_PALETTE } from "@gnome-ui/react";

const [color, setColor] = useState("#3584e4");

<ColorPicker value={color} onChange={setColor} />
<ColorPicker value={color} onChange={setColor} allowCustom />
```

### Keyboard
| Key | Action |
|-----|--------|
| `Arrow Right / Down` | Next swatch |
| `Arrow Left / Up` | Previous swatch |
| `Space / Enter` | Select focused swatch |

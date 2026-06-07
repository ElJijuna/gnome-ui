Displays a countdown timer showing the remaining time until a specified end date.

### Guidelines
- Use `format="time"` to display countdown in HH:MM:SS format.
- Use `format="date"` to display the target end date.
- Provide an `action` callback that executes when the countdown reaches zero.
- Choose the `variant` that matches the urgency: `accent` → neutral, `success` → positive, `warning` → caution, `destructive` → urgent.
- The component automatically switches to destructive styling when time runs out.

# Design System Specification: The Sentinel Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: "Precision Transparency"**

This design system moves beyond the "standard dashboard" by treating the interface as a high-precision instrument. We are not just building a lock manager; we are building a digital concierge. The system breaks away from traditional "boxed" layouts in favor of an **Editorial Tech** approach. By leveraging intentional asymmetry, oversized display typography, and tonal depth, we create an environment that feels as secure as a vault but as intuitive as a well-designed physical object. 

The goal is to eliminate visual noise. We prioritize "Breathing Room" over "Grid Density," allowing the user to focus on the status of their security without distraction.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep tech-neutrals, using the primary blue (#0F62FE) not as a decorative element, but as a "Signal Color" for active states and critical security confirmation.

### Surface Hierarchy & The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. They create visual friction and make a UI feel "templated." 
- **Tonal Sectioning:** Define boundaries through background shifts. Place a `surface-container-low` component against a `surface` background to create natural separation.
- **The Nesting Principle:** Treat the UI as layers of physical materials.
    - **Base:** `surface` (#101319)
    - **Sectioning:** `surface-container` (#1D2026)
    - **Interactive Elements:** `surface-container-high` (#272A31) or `highest` (#32353C)
- **Signature Textures:** Use a subtle linear gradient on primary CTAs—transitioning from `primary-container` (#0F62FE) to `primary` (#B4C5FF) at a 135-degree angle—to give buttons a tactile, "machined" feel.
- **Glassmorphism:** For floating modals or navigation overlays, use `surface` with 70% opacity and a 20px backdrop-blur. This keeps the user anchored in their current context.

---

## 3. Typography: The Editorial Edge
We use a dual-font system to balance high-tech precision with human readability. **Manrope** provides the geometric, modern structure for headlines, while **Inter** offers maximum legibility for data-heavy labels.

*   **Display (Manrope):** Use `display-lg` for status headlines (e.g., "SYSTEM ARMED"). These should be set with -0.02em letter spacing to feel "locked in."
*   **Headline (Manrope):** Use `headline-sm` for card titles. Avoid bold weights; use "Medium" to maintain a sophisticated, light touch.
*   **Body (Manrope):** `body-md` is the workhorse. High line-heights (1.6) are mandatory to ensure the dashboard feels premium and unhurried.
*   **Labels (Inter):** All micro-data (battery percentages, timestamps) uses `label-md`. Inter's tall x-height ensures these remain readable even at small scales.

---

## 4. Elevation & Depth
In this system, depth is a functional tool used to communicate "Security Layers."

- **The Layering Principle:** Instead of shadows, use "Tonal Lift." A card is "raised" by moving from `surface-container-low` to `surface-container-high`.
- **Ambient Shadows:** When an element must float (like a lock-control FAB), use a shadow tinted with `primary` at 6% opacity. 
    - *Formula:* `0px 24px 48px rgba(15, 98, 254, 0.08)`
- **The Ghost Border:** If high-contrast accessibility is required, use `outline-variant` at 15% opacity. This creates a "suggestion" of a border without breaking the fluid aesthetic. 
- **Interactive Depth:** On hover, a card should not get a larger shadow; instead, it should transition its background color one step up the surface scale (e.g., from `surface-container` to `surface-container-high`).

---

## 5. Components

### The "Status" Button (Primary)
- **Geometry:** `xl` (0.75rem) corner radius.
- **Color:** Gradient from `primary-container` to `primary`. 
- **Interaction:** On press, the button "sinks" (slight scale down to 0.98) and the gradient intensifies.

### The Lock-State Card
- **Styling:** Forbid dividers. Use 24px of internal padding (`3rem` equivalent) to separate the lock name from its activity log. 
- **Header:** Use `title-lg` for the Lock Name.
- **Visual Signal:** A 4px vertical "accent bar" of `tertiary` (#FFB59D) on the far left of the card indicates a "Warning" state (e.g., Low Battery) without needing an icon.

### Modern Input Fields
- **Container:** No bottom line. Use a `surface-container-highest` fill with an `sm` (0.125rem) radius.
- **Typography:** Placeholder text should use `on-surface-variant` at 50% opacity.
- **Focus State:** A 2px "Ghost Border" using the `primary` color.

### Smart Chips
- **Aesthetic:** Use `full` (9999px) roundedness.
- **State:** Unselected chips should be `surface-container-high` with no border. Selected chips use `primary-container` with `on-primary-container` text.

### Security Tooltips
- **Glass Effect:** Use `surface-bright` at 80% opacity with a `lg` (0.5rem) radius and a subtle `outline` border at 10% opacity.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetric Margins:** Give the right side of the dashboard more "air" than the left to create a sense of movement.
*   **Scale the Typography:** Don't be afraid to make a "UNLOCKED" status `display-lg`. Large type is a design element in itself.
*   **Use Tonal Transitions:** Transition background colors over 300ms for a "breathing" effect when the system status changes.

### Don't:
*   **Don't use Dividers:** Never use a line to separate two items in a list. Use a 12px or 16px gap instead.
*   **Don't use Pure Black:** Even in dark mode, the "darkest" color is `surface` (#101319). Pure #000000 kills the "Glassmorphism" effect.
*   **Don't Over-Iconize:** Only use icons where they provide immediate cognitive value (e.g., a Lock icon). For everything else, let the high-end typography speak.
*   **Don't use High-Contrast Borders:** Avoid `outline` at 100% opacity; it makes the high-tech interface feel like a legacy form-filling app.
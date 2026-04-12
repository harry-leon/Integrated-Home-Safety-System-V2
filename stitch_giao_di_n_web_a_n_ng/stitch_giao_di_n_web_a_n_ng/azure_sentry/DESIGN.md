```markdown
# Design System Document: The Sentinel Ethos

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Digital Vault."** We are moving beyond the generic "SaaS dashboard" aesthetic to create an environment that feels architecturally secure yet digitally fluid. 

The system rejects the "flat web" trend in favor of **Tonal Brutalism**. By utilizing high-contrast typography scales and intentional asymmetry, we create a layout that feels editorial and authoritative. We break the grid by allowing certain "Hero" sensor cards to overlap section boundaries, suggesting a dynamic, real-time pulse of data. The goal is to make the user feel like they are not just looking at a screen, but commanding a sophisticated physical infrastructure.

---

## 2. Colors: Tonal Architecture
Our palette uses deep, professional blues and achromatic grays to establish trust. We prioritize background-driven separation over structural lines.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts. For instance, a side-rail navigation using `surface-container-low` should sit against a `surface` main content area. This creates a "molded" look rather than a "sketched" look.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#131313 in Dark Mode).
- **Secondary Sectioning:** `surface-container-low` (#1c1b1b).
- **Interactive Cards:** `surface-container-highest` (#353534).
- **High-Focus Nested Elements:** `surface-bright` (#393939) within a card.

### The "Glass & Gradient" Rule
To elevate the "high-tech" brand personality, use Glassmorphism for floating notifications and modal overlays. Use the `primary` token (#b4c5ff) with a 10% opacity and a 20px backdrop-blur. 

### Signature Textures
Main CTAs (like "Unlock All") must use a subtle linear gradient from `primary` (#b4c5ff) to `primary_container` (#0f62fe) at a 135-degree angle. This provides a "jewel-like" depth that signifies high-value interaction.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance technical precision with modern sophistication.

*   **Display & Headlines (Manrope):** Chosen for its geometric stability. Use `display-lg` (3.5rem) for critical status summaries (e.g., "SECURE"). The wider apertures of Manrope convey a sense of openness and reliability.
*   **Body & Labels (Inter):** Chosen for its extreme legibility in multi-language contexts (English/Vietnamese). The tall x-height of Inter ensures that technical sensor data remains readable at `body-sm` (0.75rem).

**Hierarchy Principle:** Use extreme scale differences. A `headline-lg` title should be immediately followed by a `label-md` in `on_surface_variant` (#c3c6d8) to create a sophisticated, high-end editorial rhythm.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "soft" for a security-focused system. We achieve depth through **Ambient Luminescence**.

*   **Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "recessed" effect, suggesting the data is safely embedded within the system.
*   **Ambient Shadows:** For floating elements, use a shadow with a 40px blur, 0% offset, and 6% opacity of the `on_surface` color. This mimics a natural light spill rather than a floating "sticker."
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` (#424656) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use for sidebar navigation in Light Mode to allow the "secure" brand blues to bleed through the interface, keeping the experience light but grounded.

---

## 5. Components: Precision Primitives

### Cards & Lists
*   **Constraint:** No divider lines. Separate list items using a 12px vertical gap or a subtle shift to `surface_container_high` on hover.
*   **Sensor Cards:** Use `headline-sm` for values. Backgrounds should be `surface-container-highest`.

### Status Badges (The "Vibrant Indicator")
*   **Secure/Online:** Use `tertiary_container` (#008140) background with `on_tertiary_container` (#d6ffd9) text.
*   **Alert/Offline:** Use `error_container` (#93000a) background with `on_error_container` (#ffdad6) text.
*   **Shape:** Use `rounded-full` (9999px) for badges to contrast against the `rounded-md` (0.375rem) cards.

### Toggle Switches & Inputs
*   **Toggles:** The "On" state must use the `primary` token. The track should use `surface_container_highest` to maintain the "molded" look.
*   **Input Fields:** Use `surface_container_low` for the field body. The label should be `label-md` positioned 8px above the field, never inside as a placeholder, to maintain high-end clarity.

### Data Tables (Audit Logs)
*   Rows should use alternating backgrounds of `surface` and `surface_container_low` instead of borders.
*   Headers must be `label-sm` in all-caps with 0.05em letter spacing for a technical, "monitored" feel.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use Vietnamese diacritics correctly—Inter supports these beautifully. Ensure line-height for Vietnamese is 1.4x to prevent accent clipping.
*   **Do** allow for "Breathing Room." High-end design is defined by what you leave out. Use the `xl` (0.75rem) or higher spacing between unrelated data groups.
*   **Do** use `tertiary` (#71dc8e) for "Secure" states to provide a more sophisticated green than standard hex values.

### Don’t
*   **Don’t** use pure black (#000000) or pure white (#FFFFFF). Always use the `surface` and `on_surface` tokens to maintain the "Tonal Layering" effect.
*   **Don’t** use standard "drop shadows" on cards. If it doesn't feel like it's part of the physical architecture of the screen, rethink the layering.
*   **Don’t** crowd the sidebar. The sidebar should be a minimalist "Command Center" using `label-md` for navigation items to keep the focus on the main dashboard data.

---

## 7. Interaction Note
Every interaction should feel **weighted**. When a user toggles a lock, the transition should be a 300ms "Ease-in-out" with a slight scale-down (0.98) on the card to simulate a physical button being pressed. This reinforces the "Secure and Reliable" brand personality.```
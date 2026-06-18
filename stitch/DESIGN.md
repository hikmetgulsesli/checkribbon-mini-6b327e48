---
name: CheckRibbon Mini
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  container-padding: 16px
  gutter: 8px
---

## Brand & Style
The design system is engineered for utility, precision, and high-density information management. The brand personality is deterministic and reliable, favoring functional efficiency over decorative flair. 

The aesthetic follows a **Refined Industrial Minimalism**—a style that prioritizes content clarity through structured alignment and a "no-nonsense" interface. The UI should evoke a sense of calm control, reducing cognitive load for users performing repetitive or complex data-entry tasks. High whitespace is avoided in favor of organized density, ensuring that more information is visible at a glance without feeling cluttered.

## Colors
This design system utilizes a "Professional Utility" palette. The primary color is a focused **Emerald Green** (#0D9488), used sparingly for progress indicators, primary actions, and success states to signal productivity.

The foundation is built on a range of cool, slate neutrals. Backgrounds utilize off-whites (#F8FAFC) to reduce glare, while text and iconography leverage deep slates (#0F172A) for maximum contrast. Validation states follow standard utility conventions: Emerald for success, Amber for warnings, and Rose for errors, all optimized for legibility against the neutral background.

## Typography
The typography system uses **Inter** for its exceptional legibility at small sizes and neutral tone. A tight type scale is employed to maintain information density. 

- **Data Tables/Inputs:** Use `body-sm` as the workhorse size. 
- **Metadata:** `label-xs` is used for non-editable descriptors and table headers.
- **Monospaced Data:** For ID strings, counts, or technical values, `mono-data` (JetBrains Mono) is used to ensure character alignment and distinction.
- **Line Heights:** Set intentionally tight (1.3x to 1.5x) to allow for more rows of information to be visible on screen.

## Layout & Spacing
The layout follows a **Strict Fluid Grid** model based on a 4px baseline unit. The design system prioritizes horizontal space to accommodate tabular data and multi-column forms.

- **Density:** Components use `sm` (8px) or `xs` (4px) internal padding to maintain a compact footprint.
- **Breakpoints:** The system is optimized for desktop utility; mobile views reflow into single-column stacks with consistent `container-padding`.
- **Alignment:** Every element must align to the 4px grid. Lists and tables should stretch to fill containers (fluid), ensuring no wasted horizontal space.

## Elevation & Depth
In keeping with the minimalist utility focus, this design system avoids heavy shadows. Depth is communicated through **Tonal Layering** and **Low-contrast Outlines**.

- **Level 0 (Base):** The main background color.
- **Level 1 (Surfaces):** Cards and containers use a white background with a 1px border (#E2E8F0).
- **Level 2 (Interaction):** Hover states on list items or buttons use a subtle background tint (#F1F5F9) rather than a shadow.
- **Focus States:** Active inputs or primary buttons use a 2px outer glow in the primary emerald color with 20% opacity to highlight focus without shifting layout.

## Shapes
Shapes are disciplined and "Soft-Square." UI elements use a consistent **4px (0.25rem)** corner radius. 

This subtle rounding prevents the interface from feeling aggressive or "brutalist," maintaining a professional and approachable calm while ensuring that the high-density layout remains structured and easy to scan. Larger containers like modals may use `rounded-lg` (8px), but standard utility components (buttons, inputs, tags) never exceed the base 4px radius.

## Components
- **Buttons:** Compact height (32px for default, 28px for small). Primary buttons use a solid emerald fill; ghost buttons use a subtle border for secondary actions.
- **Inputs:** 32px height. Labels are placed above the field in `label-md`. Borders are 1px slate-200, turning primary-emerald on focus.
- **Progress Meters:** Thin (4px height) bars. Use a "Track and Fill" metaphor. The fill is Emerald for active/complete and Slate-200 for the empty track.
- **Lists & Tables:** Rows have a 32px minimum height. Zebra-striping is used for tables exceeding 10 rows. Row hover states are mandatory for row-level actions.
- **Chips/Status:** Small, pill-shaped tags using `label-xs`. Backgrounds are low-saturation tints of the status color (e.g., light green background with dark green text).
- **Data Grids:** Headers are sticky, using `label-xs` with a subtle bottom border.
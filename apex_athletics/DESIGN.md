---
name: Apex Athletics
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#964900'
  on-secondary: '#ffffff'
  secondary-container: '#ff851b'
  on-secondary-container: '#612d00'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cca830'
  on-tertiary-container: '#4f3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#ffdcc7'
  secondary-fixed-dim: '#ffb787'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 80px
---

## Brand & Style
The design system embodies a premium, high-performance athletic aesthetic tailored for an elite volleyball club. It balances the grit of professional sports with the sophistication of a luxury lifestyle brand. The visual narrative is driven by **Corporate Modernism** infused with **High-Contrast Boldness**, utilizing expansive whitespace to allow high-action photography to serve as the primary emotional anchor. The UI should feel authoritative, energetic, and meticulously organized, evoking a sense of aspiration and discipline in the user.

## Colors
The palette is rooted in a foundation of Deep Navy and Crisp White to establish institutional trust and clarity. 

- **Primary (Deep Navy):** Used for core branding, navigation backgrounds, and primary headings. It provides the "heavy" anchor for the system.
- **Secondary (Vibrant Orange):** Reserved for high-energy touchpoints, primary calls-to-action (CTAs), and active states. It represents the "pulse" of the game.
- **Tertiary (Gold):** Used sparingly for "Elite" or "Premium" status indicators, championships, and subtle decorative accents to elevate the brand.
- **Neutral:** A range of cool grays (from #F8F9FA to #334155) maintains a clean environment, ensuring data tables and schedules remain highly legible.

## Typography
The typography strategy creates a hierarchy of "Power vs. Precision." **Montserrat** is used for all headlines and display text, set with tight letter-spacing and heavy weights to mimic the impact of a stadium scoreboard. **Inter** handles all functional and body text, providing a neutral, highly legible contrast that ensures complex data (like match stats or player rosters) remains accessible. All labels and overlines should use the `label-bold` token with uppercase styling to reinforce the athletic tone.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 8px spacing scale governs all internal component dimensions. 

Generous section padding (`section-gap`) is essential to prevent the UI from feeling cluttered, reflecting the open space of a volleyball court. Dashboard views should prioritize a "Fixed Sidebar" layout with a "Fluid Content" area to handle dense data tables efficiently. On mobile, use a "Bottom Sheet" pattern for filtering and quick actions to maintain thumb-reachability.

## Elevation & Depth
Depth is achieved through **Tonal Layering** supplemented by **Ambient Shadows**. 

- **Level 0 (Base):** Crisp White (#FFFFFF) or Neutral Light (#F8F9FA).
- **Level 1 (Cards/Tables):** White background with a 1px border (#E2E8F0) and a subtle 4px blur shadow at 5% opacity.
- **Level 2 (Modals/Overlays):** White background with a deep 24px blur shadow at 10% opacity. 
- **Interactive Depth:** Elements like membership cards should utilize a subtle vertical lift (Y-axis shift) on hover rather than a color change alone, creating a tactile "clicky" feel.

## Shapes
This design system uses **Soft** geometry (`roundedness: 1`). While the brand is aggressive and athletic, the slightly softened corners (4px - 12px) provide a modern, "App-like" feel that differentiates the club from traditional, blocky sports broadcast graphics. Buttons use a specific `rounded-lg` (8px) value, while large container cards use `rounded-xl` (12px).

## Components
- **Buttons:** Primary buttons are Solid Navy with White text. Secondary buttons are Outline Navy. Accent/CTA buttons use Vibrant Orange with a slight shadow to pop against Navy backgrounds.
- **Membership Cards:** Use a vertical layout with the price in `headline-lg`. The "Gold" color token is reserved for the "Elite/Pro" tier card border or a "Recommended" badge.
- **Data Tables:** High-density, borderless design. Headers use `label-bold` with a light gray background. Row hover states should use a subtle Tonal Light gray.
- **Modals:** Centered with a semi-transparent Navy backdrop blur (Glassmorphism effect). Content should be framed with generous 40px internal padding.
- **Chips/Status:** Use for "Match Result" (Win/Loss) or "Category." These should be pill-shaped with low-opacity color fills (e.g., 10% Orange fill for "Live" status).
- **Interactive Stat Cards:** Small, square-format cards for individual player metrics (Aces, Blocks, Kills) using a large Montserrat weight for the number and a small Inter caption for the metric name.
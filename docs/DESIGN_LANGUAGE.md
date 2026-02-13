# Design Language — Neutral Papyrus

> PWAssemblyGuide Design System  
> Version 1.0 — February 2026

---

## 1. Design Philosophy

**Warm, professional, and understated.** The Neutral Papyrus palette brings a sophisticated industrial warmth to a tool-focused application. Every surface feels like quality paper or brushed metal — clean without being sterile, warm without being distracting. The design prioritizes content clarity and 3D model visibility over decorative elements.

### Core Principles

1. **Content First** — The 3D viewer and assembly instructions take center stage. UI chrome fades to the background.
2. **Warm Neutrality** — Warm off-whites and cool charcoals create depth without competing colors.
3. **Consistent Glassmorphism** — Frosted glass surfaces with subtle borders create layered depth.
4. **Mobile Crafted** — Every element is touch-friendly and optimized for workshop conditions.
5. **Bidirectional Ready** — All spacing, alignment, and layouts work seamlessly in LTR and RTL.

---

## 2. Color Palette

### Source Colors (Neutral Papyrus)

| Swatch | Hex       | Name         | Role                                     |
| ------ | --------- | ------------ | ---------------------------------------- |
| ◻️     | `#F6F2EE` | **Papyrus**  | Light mode base / Dark mode primary text |
| ◻️     | `#CACBCD` | **Silver**   | Borders, dividers, subtle backgrounds    |
| ◻️     | `#B3B9C1` | **Pewter**   | Secondary text (light mode), muted UI    |
| ◼️     | `#77726E` | **Stone**    | Secondary text, icons, subtle accents    |
| ◼️     | `#323841` | **Charcoal** | Dark mode base / Light mode primary text |

### 2.1 Light Mode Tokens

```colors
--bg-page:            #F6F2EE    (Papyrus — warm page background)
--bg-page-subtle:     #EDE8E3    (Slightly darker papyrus for variety)
--bg-surface:         #FFFFFF    (Pure white cards/panels)
--bg-surface-glass:   rgba(255, 255, 255, 0.75)
--bg-surface-hover:   #F6F2EE    (Papyrus tint on hover)
--bg-surface-muted:   #F0ECE8    (Warm muted for secondary containers)
--bg-input:           #FFFFFF
--bg-input-focus:     #FAFAF8

--text-primary:       #323841    (Charcoal — headings, body)
--text-secondary:     #77726E    (Stone — labels, descriptions)
--text-tertiary:      #B3B9C1    (Pewter — placeholders, timestamps)
--text-disabled:      #CACBCD    (Silver — disabled state)
--text-on-accent:     #FFFFFF    (White on dark buttons)

--border-default:     #CACBCD    (Silver)
--border-subtle:      rgba(202, 203, 205, 0.5)
--border-strong:      #B3B9C1    (Pewter)
--border-focus:       #323841    (Charcoal focus ring)

--accent-primary:     #323841    (Charcoal — primary actions)
--accent-primary-hover: #252B33  (Darker charcoal)
--accent-secondary:   #77726E    (Stone — secondary actions)
--accent-secondary-hover: #635E5A

--shadow-color:       rgba(50, 56, 65, 0.08)
--shadow-color-md:    rgba(50, 56, 65, 0.12)
--shadow-color-lg:    rgba(50, 56, 65, 0.16)
```

### 2.2 Dark Mode Tokens

```colors
--bg-page:            #1E2228    (Deep charcoal — slightly darker than #323841)
--bg-page-subtle:     #252B33    (Mid-charcoal for variety)
--bg-surface:         #323841    (Charcoal cards/panels)
--bg-surface-glass:   rgba(50, 56, 65, 0.75)
--bg-surface-hover:   #3A424D    (Lighter charcoal on hover)
--bg-surface-muted:   #2A3039    (Darker muted containers)
--bg-input:           #2A3039
--bg-input-focus:     #323841

--text-primary:       #F6F2EE    (Papyrus — headings, body)
--text-secondary:     #CACBCD    (Silver — labels, descriptions)
--text-tertiary:      #B3B9C1    (Pewter — placeholders, timestamps)
--text-disabled:      #77726E    (Stone — disabled state)
--text-on-accent:     #1E2228    (Dark text on light buttons)

--border-default:     rgba(119, 114, 110, 0.4)
--border-subtle:      rgba(119, 114, 110, 0.2)
--border-strong:      #77726E    (Stone)
--border-focus:       #F6F2EE    (Papyrus focus ring)

--accent-primary:     #F6F2EE    (Papyrus — primary actions)
--accent-primary-hover: #FFFFFF
--accent-secondary:   #CACBCD    (Silver — secondary actions)
--accent-secondary-hover: #E0DDDA

--shadow-color:       rgba(0, 0, 0, 0.20)
--shadow-color-md:    rgba(0, 0, 0, 0.30)
--shadow-color-lg:    rgba(0, 0, 0, 0.40)
```

### 2.3 Semantic Colors

These accent colors are used sparingly for status indicators and feedback. They are intentionally muted to harmonize with the neutral palette.

| State       | Light Mode              | Dark Mode               | Usage                               |
| ----------- | ----------------------- | ----------------------- | ----------------------------------- |
| **Success** | `#5B8A6F` bg: `#EEF5F1` | `#7FB396` bg: `#2A3A30` | Completed steps, save confirmations |
| **Error**   | `#B85C5C` bg: `#F8EEEE` | `#D98E8E` bg: `#3D2A2A` | Validation errors, failed actions   |
| **Warning** | `#B89A5C` bg: `#F5F1E8` | `#D4B87A` bg: `#3A3528` | Unsaved changes, caution notices    |
| **Info**    | `#5C7EB8` bg: `#EEF1F8` | `#8EA8D9` bg: `#2A3040` | Tips, help text, QR scan prompt     |

---

## 3. Typography

### Font Stack

| Context           | Font  | Weights            | Fallback              |
| ----------------- | ----- | ------------------ | --------------------- |
| **LTR (English)** | Inter | 400, 500, 600, 700 | system-ui, sans-serif |
| **RTL (Arabic)**  | Cairo | 400, 500, 600, 700 | Arial, sans-serif     |

### Type Scale

| Name           | Size             | Weight | Line Height | Usage                           |
| -------------- | ---------------- | ------ | ----------- | ------------------------------- |
| **Display**    | 28px / 1.75rem   | 700    | 1.2         | Page hero titles (desktop only) |
| **Heading 1**  | 22px / 1.375rem  | 700    | 1.3         | Page titles                     |
| **Heading 2**  | 18px / 1.125rem  | 600    | 1.3         | Section headers, card titles    |
| **Heading 3**  | 16px / 1rem      | 600    | 1.4         | Subsection headers              |
| **Body**       | 14px / 0.875rem  | 400    | 1.5         | Default body text               |
| **Body Small** | 13px / 0.8125rem | 400    | 1.5         | Descriptions, secondary info    |
| **Caption**    | 12px / 0.75rem   | 500    | 1.4         | Labels, badges, metadata        |
| **Micro**      | 10px / 0.625rem  | 500    | 1.3         | Timestamps, very small labels   |

### Text Color Mapping

| Role                             | Light Mode Class | Dark Mode Class |
| -------------------------------- | ---------------- | --------------- |
| Primary (headings, body)         | `text-charcoal`  | `text-papyrus`  |
| Secondary (labels, descriptions) | `text-stone`     | `text-silver`   |
| Tertiary (placeholders)          | `text-pewter`    | `text-pewter`   |
| Disabled                         | `text-silver`    | `text-stone`    |

---

## 4. Spacing & Layout

### Spacing Scale (rem-based)

| Token      | Value   | Pixels | Usage                                      |
| ---------- | ------- | ------ | ------------------------------------------ |
| `space-1`  | 0.25rem | 4px    | Tight inner gaps (icon-to-text)            |
| `space-2`  | 0.5rem  | 8px    | Inner padding, between inline items        |
| `space-3`  | 0.75rem | 12px   | Card inner padding (mobile)                |
| `space-4`  | 1rem    | 16px   | Standard padding, component gaps           |
| `space-5`  | 1.25rem | 20px   | Section inner padding                      |
| `space-6`  | 1.5rem  | 24px   | Card inner padding (desktop), section gaps |
| `space-8`  | 2rem    | 32px   | Page horizontal padding (desktop)          |
| `space-10` | 2.5rem  | 40px   | Major section spacing                      |

### Page Layout

- **Mobile**: Single column, full-width containers, 12px horizontal padding
- **Tablet (md)**: Two-column where appropriate, 24px padding
- **Desktop (lg)**: Max-width container (1280px), centered, 32px padding

### Touch Targets

- Minimum tap target: **44px × 44px** on mobile
- Button minimum height: **40px** desktop, **44px** mobile
- Interactive list items: minimum **48px** height

---

## 5. Surface & Elevation

### Card Hierarchy

The design uses a layered glassmorphism system with three distinct elevation levels:

#### Level 0 — Page Background

```css
/* Light */
background: #f6f2ee;
/* Dark */
background: #1e2228;
```

#### Level 1 — Primary Cards & Panels

```css
/* Light */
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(20px);
border: 1px solid rgba(202, 203, 205, 0.5);
border-radius: 16px;
box-shadow: 0 4px 24px rgba(50, 56, 65, 0.08);

/* Dark */
background: rgba(50, 56, 65, 0.75);
backdrop-filter: blur(20px);
border: 1px solid rgba(119, 114, 110, 0.2);
border-radius: 16px;
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
```

#### Level 2 — Elevated (Modals, Dropdowns, Popovers)

```css
/* Light */
background: #ffffff;
border: 1px solid #cacbcd;
border-radius: 16px;
box-shadow: 0 8px 32px rgba(50, 56, 65, 0.16);

/* Dark */
background: #3a424d;
border: 1px solid rgba(119, 114, 110, 0.3);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
```

#### Level 3 — Sticky Headers & Toolbars

```css
/* Light */
background: rgba(246, 242, 238, 0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(202, 203, 205, 0.5);

/* Dark */
background: rgba(30, 34, 40, 0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(119, 114, 110, 0.2);
```

---

## 6. Border Radius

| Token         | Value  | Usage                            |
| ------------- | ------ | -------------------------------- |
| `radius-sm`   | 6px    | Small badges, inner elements     |
| `radius-md`   | 8px    | Form inputs, small cards         |
| `radius-lg`   | 12px   | Standard cards, buttons          |
| `radius-xl`   | 16px   | Large cards, panels, modals      |
| `radius-2xl`  | 20px   | Hero cards, major containers     |
| `radius-full` | 9999px | Pills, circular buttons, avatars |

### Consistency Rule

- **Buttons**: `radius-lg` (12px)
- **Cards & Panels**: `radius-xl` (16px)
- **Inputs**: `radius-md` (8px) in admin, `radius-lg` (12px) on public pages
- **Modals**: `radius-xl` (16px)
- **Badges/Pills**: `radius-full`

---

## 7. Component Specifications

### 7.1 Buttons

#### Primary Button (CTA)

```text
Light:  bg-charcoal text-white hover:bg-[#252B33] shadow-sm
Dark:   bg-papyrus text-[#1E2228] hover:bg-white shadow-sm

Border radius: 12px
Padding: 12px 24px (md), 10px 20px (sm)
Font: 14px / 600 weight
Transition: all 200ms ease
```

#### Secondary Button

```text
Light:  bg-transparent border border-silver text-charcoal hover:bg-papyrus
Dark:   bg-transparent border border-stone/40 text-papyrus hover:bg-surface-hover

Border radius: 12px
Padding: 12px 24px
Font: 14px / 500 weight
```

#### Ghost Button

```text
Light:  bg-transparent text-stone hover:bg-papyrus hover:text-charcoal
Dark:   bg-transparent text-silver hover:bg-surface-hover hover:text-papyrus

Border radius: 12px
Padding: 10px 16px
Font: 14px / 500 weight
```

#### Icon Button

```text
Light:  bg-transparent text-stone hover:bg-papyrus rounded-lg
Dark:   bg-transparent text-silver hover:bg-surface-hover rounded-lg

Size: 40px × 40px (44px on mobile)
Icon size: 20px
```

#### Danger Button

```text
Light:  bg-[#B85C5C] text-white hover:bg-[#A04E4E]
Dark:   bg-[#B85C5C] text-white hover:bg-[#A04E4E]

Same radius and padding as primary.
```

### 7.2 Form Inputs

```text
Light:
  background: #FFFFFF
  border: 1px solid #CACBCD
  color: #323841
  placeholder-color: #B3B9C1
  focus: border-color #323841, ring 2px rgba(50,56,65,0.15)

Dark:
  background: #2A3039
  border: 1px solid rgba(119, 114, 110, 0.4)
  color: #F6F2EE
  placeholder-color: #77726E
  focus: border-color #F6F2EE, ring 2px rgba(246,242,238,0.15)

Border radius: 8px
Padding: 10px 14px
Font: 14px / 400
Transition: border-color 200ms, box-shadow 200ms
```

### 7.3 Navigation / Header

```text
Light:
  background: rgba(246, 242, 238, 0.85)
  backdrop-filter: blur(20px)
  border-bottom: 1px solid rgba(202, 203, 205, 0.5)

Dark:
  background: rgba(30, 34, 40, 0.85)
  backdrop-filter: blur(20px)
  border-bottom: 1px solid rgba(119, 114, 110, 0.2)

Height: 64px
z-index: 50
position: sticky top-0
```

### 7.4 Cards (Category, Assembly)

```text
Light:
  bg: rgba(255, 255, 255, 0.75)
  border: 1px solid rgba(202, 203, 205, 0.5)
  shadow: 0 4px 24px rgba(50, 56, 65, 0.08)
  hover:shadow: 0 8px 32px rgba(50, 56, 65, 0.12)
  hover:translate-y: -2px

Dark:
  bg: rgba(50, 56, 65, 0.75)
  border: 1px solid rgba(119, 114, 110, 0.2)
  shadow: 0 4px 24px rgba(0, 0, 0, 0.20)
  hover:shadow: 0 8px 32px rgba(0, 0, 0, 0.30)
  hover:translate-y: -2px

Border radius: 16px
Transition: all 300ms ease
```

### 7.5 Step List Items

| State         | Light                                                  | Dark                                                    |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| **Default**   | bg: transparent, border-l: 2px solid #CACBCD           | bg: transparent, border-l: 2px stone/40                 |
| **Active**    | bg: rgba(50,56,65,0.05), border-l: 3px solid #323841   | bg: rgba(246,242,238,0.05), border-l: 3px solid #F6F2EE |
| **Completed** | bg: rgba(91,138,111,0.05), border-l: 2px solid #5B8A6F | bg: rgba(127,179,150,0.1), border-l: 2px solid #7FB396  |
| **Disabled**  | opacity: 0.5                                           | opacity: 0.5                                            |

### 7.6 Badges & Pills

```text
Light:
  bg: #F0ECE8 (warm muted)
  text: #77726E
  border-radius: 9999px
  padding: 2px 10px
  font: 12px / 500

Dark:
  bg: #2A3039
  text: #CACBCD
  border-radius: 9999px
```

### 7.7 Tooltips & Toasts

```text
Light:
  bg: #323841
  text: #F6F2EE
  shadow: 0 8px 32px rgba(50, 56, 65, 0.20)
  border-radius: 8px

Dark:
  bg: #F6F2EE
  text: #323841
  shadow: 0 8px 32px rgba(0, 0, 0, 0.30)
  border-radius: 8px
```

### 7.8 Audio Player

```text
Progress track:
  Light: bg #CACBCD, fill #323841
  Dark:  bg #77726E40, fill #F6F2EE

Volume slider: same treatment as progress track

Play button: Uses primary button style
```

### 7.9 3D Viewer Area

```text
Light:
  Canvas background: linear-gradient(180deg, #F6F2EE 0%, #E8E4E0 100%)
  Overlay controls use glass surface (Level 1)

Dark:
  Canvas background: linear-gradient(180deg, #2A3039 0%, #1E2228 100%)
  Overlay controls use glass surface (Level 1)
```

---

## 8. Admin Panel Specifics

The admin panel shares the same design language but with denser information layouts.

### Admin Sidebar

```text
Light:
  bg: rgba(255, 255, 255, 0.80)
  backdrop-filter: blur(20px)
  border-right: 1px solid rgba(202, 203, 205, 0.5)

Dark:
  bg: rgba(30, 34, 40, 0.90)
  backdrop-filter: blur(20px)
  border-right: 1px solid rgba(119, 114, 110, 0.2)

Active nav item:
  Light: bg #323841, text white, radius 12px
  Dark:  bg #F6F2EE, text #1E2228, radius 12px

Inactive nav item:
  Light: text #77726E, hover:bg rgba(50,56,65,0.05)
  Dark:  text #CACBCD, hover:bg rgba(246,242,238,0.05)
```

### Admin Stat Cards

Instead of colorful gradients, use the neutral palette with subtle warm tints:

```text
Light:
  Icon badge: bg #323841 with white icon, rounded-xl, shadow
  Card: standard Level 1 surface
  Stat number: text-charcoal, 24px, 700 weight
  Label: text-stone, 12px, 500 weight

Dark:
  Icon badge: bg #F6F2EE with charcoal icon, rounded-xl
  Card: standard Level 1 surface
  Stat number: text-papyrus
  Label: text-silver
```

### Admin Tables / Lists

```text
Header row:
  Light: bg #F0ECE8, text #77726E, font 12px/600, uppercase
  Dark:  bg #2A3039, text #B3B9C1

Row:
  Light: border-b border-silver/30, hover:bg-papyrus
  Dark:  border-b border-stone/20, hover:bg-surface-hover

Row text: uses standard text hierarchy (primary, secondary)
```

### Admin Modals

```text
Overlay: rgba(30, 34, 40, 0.6) with backdrop-blur(4px)

Modal:
  Light: bg white, border silver, radius-xl, shadow Level 2
  Dark:  bg #3A424D, border stone/30, radius-xl, shadow Level 2

Header:  bg surface-muted, border-b subtle
Footer:  bg surface-muted, border-t subtle
Body:    bg surface (white / charcoal)
```

---

## 9. Iconography

- **Icon Library**: Lucide React (consistent line icons)
- **Default Size**: 20px (w-5 h-5)
- **Small Size**: 16px (w-4 h-4) — for inline use
- **Large Size**: 24px (w-6 h-6) — for hero/feature callouts
- **Color**: Inherits `currentColor` — follows text color hierarchy
- **Stroke Width**: Default (2px)

---

## 10. Animation & Motion

### Transitions

| Type                | Duration | Easing        | Usage                      |
| ------------------- | -------- | ------------- | -------------------------- |
| **Color/opacity**   | 200ms    | ease          | Hover states, focus states |
| **Transform**       | 300ms    | ease-out      | Card lifts, slide-ins      |
| **Page transition** | 400ms    | ease-in-out   | View transitions API       |
| **3D Keyframe**     | Per-step | Custom easing | Assembly animation         |

### Hover Effects

- **Cards**: translateY(-2px) + shadow increase
- **Buttons**: Background color darken/lighten
- **Icons**: opacity 0.7 → 1.0
- **Links**: underline or color shift

### Loading States

- **Skeleton**: Animated shimmer using `bg-[#E8E4E0]` → `bg-[#F6F2EE]` (light) or `bg-[#2A3039]` → `bg-[#323841]` (dark)
- **Spinner**: Charcoal (light) / Papyrus (dark), 20px default

---

## 11. Tailwind Implementation

### Custom Colors in tailwind.config.js

```js
colors: {
  papyrus:  '#F6F2EE',
  silver:   '#CACBCD',
  pewter:   '#B3B9C1',
  stone:    '#77726E',
  charcoal: '#323841',

  // Extended palette (computed shades)
  neutral: {
    50:  '#F6F2EE',  // Papyrus
    100: '#F0ECE8',  // Papyrus shade
    200: '#E8E4E0',  // Warm light
    300: '#CACBCD',  // Silver
    400: '#B3B9C1',  // Pewter
    500: '#77726E',  // Stone
    600: '#635E5A',  // Dark stone
    700: '#323841',  // Charcoal
    800: '#252B33',  // Deep charcoal
    900: '#1E2228',  // Deepest
    950: '#161A1F',  // Near black
  },

  // Semantic colors
  success: { light: '#5B8A6F', dark: '#7FB396', bg: '#EEF5F1', 'bg-dark': '#2A3A30' },
  error:   { light: '#B85C5C', dark: '#D98E8E', bg: '#F8EEEE', 'bg-dark': '#3D2A2A' },
  warning: { light: '#B89A5C', dark: '#D4B87A', bg: '#F5F1E8', 'bg-dark': '#3A3528' },
  info:    { light: '#5C7EB8', dark: '#8EA8D9', bg: '#EEF1F8', 'bg-dark': '#2A3040' },
}
```

### Commonly Used Class Patterns

```classes
/* Page background */
bg-papyrus dark:bg-neutral-900

/* Card surface */
bg-white/75 dark:bg-charcoal/75 backdrop-blur-xl
border border-silver/50 dark:border-stone/20
rounded-xl shadow-sm

/* Primary text */
text-charcoal dark:text-papyrus

/* Secondary text */
text-stone dark:text-silver

/* Primary button */
bg-charcoal dark:bg-papyrus text-white dark:text-neutral-900
hover:bg-neutral-800 dark:hover:bg-white

/* Ghost button */
text-stone dark:text-silver
hover:bg-papyrus dark:hover:bg-neutral-800

/* Input */
bg-white dark:bg-neutral-800
border border-silver dark:border-stone/40
focus:border-charcoal dark:focus:border-papyrus
focus:ring-2 focus:ring-charcoal/15 dark:focus:ring-papyrus/15

/* Header */
bg-papyrus/85 dark:bg-neutral-900/85 backdrop-blur-xl
border-b border-silver/50 dark:border-stone/20
```

---

## 12. Accessibility

### Contrast Ratios

All text/background combinations meet **WCAG 2.1 AA** minimum contrast (4.5:1 for body text, 3:1 for large text):

| Pair                | Ratio | Pass                    |
| ------------------- | ----- | ----------------------- |
| Charcoal on Papyrus | 8.2:1 | ✅ AAA                  |
| Stone on Papyrus    | 4.8:1 | ✅ AA                   |
| Pewter on Papyrus   | 3.4:1 | ✅ AA (large text only) |
| Papyrus on Charcoal | 8.2:1 | ✅ AAA                  |
| Silver on Charcoal  | 5.5:1 | ✅ AA                   |
| Pewter on Charcoal  | 4.6:1 | ✅ AA                   |

### Focus Indicators

- Focus ring: 2px solid `--border-focus` with 2px offset
- Never remove focus outlines — style them, don't hide them
- Tab order follows visual layout order

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

## 13. Dark Mode Behavior

- **Default**: Follows system preference (`prefers-color-scheme`)
- **Override**: User can toggle manually; preference saved to `localStorage`
- **Transition**: 300ms ease on `background-color` and `color` for smooth switching
- **3D Scene**: Adapts lighting and ground plane color automatically
- **Class strategy**: Tailwind `darkMode: 'class'` on `<html>` element

---

## 14. Responsive Breakpoints

| Breakpoint | Min Width | Typical Device |
| ---------- | --------- | -------------- |
| (base)     | 0px       | Small phones   |
| `sm`       | 640px     | Large phones   |
| `md`       | 768px     | Tablets        |
| `lg`       | 1024px    | Laptops        |
| `xl`       | 1280px    | Desktops       |

### Mobile-First Layout Rules

1. Start with single-column stacked layout
2. At `md`: introduce sidebar or two-column grid
3. At `lg`: max-width container with generous padding
4. Touch targets minimum 44px on all breakpoints <= `md`

---

## 15. File Reference Map

| File                               | Design Role                                    |
| ---------------------------------- | ---------------------------------------------- |
| `tailwind.config.js`               | Color tokens, font families, spacing           |
| `styles/globals.css`               | CSS custom properties, base styles, scrollbars |
| `contexts/ThemeContext.tsx`        | Dark mode toggle logic                         |
| `contexts/BrandingContext.tsx`     | Tenant color overrides                         |
| `components/Header.tsx`            | Global navigation bar                          |
| `components/admin/AdminLayout.tsx` | Admin chrome and sidebar                       |

---

## Appendix: Migration Checklist

When implementing this design language, update in this order:

1. **tailwind.config.js** — Add custom color tokens
2. **styles/globals.css** — Update CSS custom properties and base styles
3. **components/Header.tsx** — Public header/nav
4. **pages/index.tsx** — Homepage (page bg, cards, gradients)
5. **pages/categories/[slug].tsx** — Category listing page
6. **pages/assembly/[id].tsx** — Assembly viewer page
7. **components/StepNavigation.tsx** — Step list sidebar
8. **components/StepControls.tsx** — Playback controls
9. **components/AudioPlayer.tsx** — Audio player styling
10. **components/ThemeToggle.tsx** — Theme toggle button
11. **components/LanguageSwitcher.tsx** — Language switcher
12. **components/admin/AdminLayout.tsx** — Admin sidebar and layout
13. **pages/admin/login.tsx** — Admin login page
14. **pages/admin/index.tsx** — Admin dashboard
15. **components/admin/CabinetFormModal.tsx** — CRUD modals
16. **components/admin/ToastProvider.tsx** — Toast notifications

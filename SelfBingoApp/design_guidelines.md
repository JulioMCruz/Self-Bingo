# World Bingo - Design Guidelines

## Design Approach
**Reference-Based + Brand System Hybrid**: Drawing from Celo's bold, high-contrast branding guidelines combined with mobile gaming patterns from Duolingo and Kahoot for engagement mechanics.

## Core Design Principles
1. **Raw & Bold**: Hard-edged geometry, clashing colors, architectural typography
2. **Mobile-First Gaming**: Thumb-friendly tap targets, immediate feedback, game-like progression
3. **Trust Through Clarity**: Transparent prize pool, real-time stats, clear verification states

---

## Color Palette (Celo Brand)

**Primary Colors**
- Yellow: `#FCFF52` - CTAs, bingo squares on tap, prize pool highlights
- Forest Green: `#4E632A` - Card backgrounds, verified state
- Purple: `#1A0329` - App header, high-impact sections

**Base Colors**
- Lt Tan: `#FBF6F1` - Main canvas
- Dk Tan: `#E6E3D5` - Bingo card background
- Brown: `#635949` - Secondary text
- Black: `#000000` - Primary text
- White: `#FFFFFF` - Inverse text

**Functional**
- Success: `#329F3B` - Verified squares
- Error: `#E70532` - Failed verification
- Inactive: `#9B9B9B` - Locked squares

**Accent Pops (Sparingly)**
- Orange: `#F29E5F` - Urgent notifications
- Pink: `#F2A9E7` - Winner celebrations
- Lime: `#B2EBA1` - Live activity pulses

---

## Typography

**Font Stack**
- Headlines: GT Alpina (250 weight, thin, architectural)
- Body/UI: Inter (250 weight for text, 750 for labels/buttons)

**Scale**
- H1: 48px / 250 weight / -0.01em (Prize Pool, Winner Announcement)
- H2: 36px / 250 weight / -0.01em (Dashboard Stats)
- H3: 24px / 250 weight / -0.01em (Section Headers)
- Body L: 18px / 250 weight (Bingo Questions)
- Body M: 16px / 250 weight (Instructions, Descriptions)
- Labels: 12px / 750 weight / 0em caps (Participant Count, Status Tags)

---

## Layout System

**Spacing Units (Tailwind)**
- Use: `2, 4, 6, 8, 12, 16` units consistently
- Card padding: `p-6`
- Section gaps: `gap-8`
- Screen margins: `px-4` mobile

**Grid System**
- Bingo Card: 5x5 perfect squares, `gap-2`
- Dashboard Stats: 2-column grid on mobile
- Full-width color blocks for sections

---

## Component Library

### Navigation
**Top Bar** (Purple #1A0329 background)
- Full-width sticky header
- White text logo "World Bingo" (Inter 750, 18px)
- Participant pulse indicator (Lime accent with count)
- Square corners, `h-14`

### Dashboard Screen
**Hero Stats Block** (Yellow #FCFF52 background)
- Oversized GT Alpina numbers: Prize Pool in CELO
- Black text, architectural layout
- Live participant counter with pulse animation

**Country Leaderboard Cards** (Dk Tan background)
- 2-column grid on mobile
- Black outlined rectangles
- Country flag + participant count
- Inter 750 labels

### Payment Screen
**Entry Fee Card** (Lt Tan background with Purple outline)
- Centered layout, `max-w-sm`
- Price display: GT Alpina 48px, "1 CELO"
- Yellow CTA button (full width, `h-14`)
- Hard black text on yellow, no rounded corners
- Wallet address preview (truncated, Brown text)

### Bingo Card Screen
**5x5 Grid** (Dk Tan background card)
- Perfect square cells with `aspect-square`
- Each cell: White background default, `border-2` black
- Question text: Inter 14px, tight leading
- Tap states:
  - Default: White bg
  - Selected: Yellow bg (#FCFF52)
  - Verifying: Purple bg with loading
  - Verified: Forest Green bg (#4E632A)
  - Failed: Error red bg
- Hard color inversions, no transitions

**Verification Modal** (Purple overlay)
- Self Protocol QR code centered
- White background card with black outline
- Instructions: Inter 16px white text
- "Tap to verify" label (Inter 750 caps)

### Winner Screen
**Celebration Block** (Pink #F2A9E7 background)
- Full viewport height
- GT Alpina 72px "BINGO!" headline
- Prize amount split display
- Confetti-like geometric shapes (optional)
- "New Game Starting" countdown (Inter 750)

---

## Interaction Patterns

**Button States**
- Default: Yellow bg, black text, square
- Active/Tap: Invert to black bg, yellow text (hard flip, no transition)
- Disabled: Inactive gray (#9B9B9B)

**Bingo Square Tap Flow**
1. User taps square → Yellow highlight
2. QR modal appears → Purple overlay
3. Self verification → Purple background pulse
4. Success → Hard flip to Forest Green
5. Failure → Error red with shake

**Live Updates**
- Participant count: Lime pulse every 3 seconds
- Prize pool: Yellow flash on update
- No smooth animations, use instant state changes

---

## Images

**Landing Dashboard**: Background pattern of geometric shapes in Dk Tan on Lt Tan canvas (subtle, not distracting)

**Payment Screen**: No hero image - focus on clarity and trust with clean layout

**Bingo Card**: No decorative images - the bold color blocks ARE the visual interest

**Winner Screen**: Optional geometric celebration pattern in background (think bauhaus posters, not confetti)

---

## Mobile Optimization

**Thumb Zones**
- All CTAs in bottom 60% of screen
- Minimum tap target: `h-14` (56px)
- Bingo squares: Minimum `80px` × `80px`

**Viewport**
- Dashboard: Natural scroll, sections `py-8`
- Bingo Card: Fits in viewport with minimal scroll
- No forced 100vh constraints

**Performance**
- Hard state changes over animations
- Instant color flips
- Minimal motion for accessibility

---

## Accessibility

- High contrast ratios maintained (Yellow/Black, Purple/White)
- No color-only indicators (use icons + text)
- Labels for verification states
- Error messages with clear copy

---

## Key Differentiators

This isn't a soft, playful bingo game - it's **industrial-strength verification meets bold crypto gaming**. Think brutalist poster meets blockchain transparency. Every element is architectural, every color clash is intentional, every interaction is instant and definitive.
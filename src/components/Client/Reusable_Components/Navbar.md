# Navbar — design notes & implementation context

Working notes for `Navbar.tsx` / `Navbar.css`. This documents *why* the current
implementation looks the way it does, so future edits don't accidentally
reintroduce bugs that were already found and fixed. Not user-facing docs.

## Overview

The navbar was redesigned from a plain hamburger-menu bar into a floating
"pill" nav with a dark/light theme, a hero-embedded → docked scroll animation,
a gradient sliding active-tab indicator, and floating bubble decorations —
while keeping all existing functionality (routing, login/logout, cart,
hamburger toggle mechanics) intact.

Rendered via `createPortal` into `document.body`.

## Theme toggle

```ts
const NAV_LIGHT_THEME = false; // true = light pill, false = dark pill
```

Single source of truth for the skin. Drives:
- `data-theme="light"|"dark"` on the header element (CSS variants keyed off this attribute)
- Which logo asset loads (`Roadshow_AdinnLogo.svg` vs `Roadshow_AdinnLogo_WithoutBg.svg`)

## Scroll-driven dock animation (3 stages)

```ts
const DOCK_THRESHOLD_1 = 100; // px scrolled
const DOCK_THRESHOLD_2 = 280; // px scrolled
```

Stage progression as the user scrolls down:
- **Stage 0** (top of page): `width: 60–70vw` (capped 1180px on wide screens), `height: 82px`, `border-radius: 26px`
- **Stage 1** (past 100px): `width: 58–66vw` (capped 1140px), `height: 82px`, `border-radius: 30px`
- **Stage 2** (past 280px): `width: 50–60vw` (capped 980px), `height: 64px`, `border-radius: 30px`

Width is intentionally **monotonically decreasing** stage 0 → 1 → 2 at every
viewport width. A past regression (see Known bugs & fixes) briefly made stage 2
wider than stage 1 on narrow-desktop widths (<1440px) — if stage widths are
ever retuned, keep `stage2.width < stage1.width < stage0.width` true for both
the narrow-desktop branch (`vw < 1440`) and the wide-desktop branch.

Implementation: **not** a continuous GSAP `scrub` tween. It's three
`ScrollTrigger.create({ onEnter, onLeaveBack })` one-shot triggers that fire a
`gsap.to()` only when a threshold is crossed (see Known bugs & fixes —
"shaking" jank). Current tween timing:

```ts
gsap.to(header, { ...state, duration: 1.1, ease: "power2.inOut", overwrite: "auto" });
```

(`power2.inOut`, 1.1s — slower/gentler than the original `power3.out`/0.5s, per
explicit request to make the transition read as a glide rather than a snap.)

The mobile breakpoint (`< 768px`) skips this effect entirely and uses static
CSS instead — no GSAP dock behavior below 768px.

## Centering

The header is centered with `left:0; right:0; margin-inline:auto` — **not**
`left:50%; transform:translate(-50%,0)`. This is deliberate: it has no
transform/percentage math, so it can't be knocked off-center by any `perspective`
or `transform` set elsewhere in the ancestor chain, and it can't conflict with
GSAP setting `transform` on the same element. See Known bugs & fixes below —
this was arrived at after two other centering approaches broke.

`.RS_HeaderStage` (the fixed-position portal root) must **not** have its own
`perspective` — that creates a new containing block for `position:fixed`
descendants and silently breaks the centering math. `perspective` for the
tab-item mount-entrance 3D flip lives scoped to `.RS_TabBar` instead.

## Active-tab indicator

A Framer Motion `motion.span` with `layoutId="RS_TabPill"` (`transition:
{ type: "spring", stiffness: 480, damping: 34 }`) slides between nav items as
the active route changes. Shape: `border-radius: 10px; transform: skewX(-16deg)`
— a rounded "slanted rectangle," not a sharp-cornered parallelogram.

The same slanted shape is shared between **hover** and **active** states via
one pseudo-element (`.RS_TabItem::before`) so hovering never falls back to a
plain rounded pill.

Gradient: red → near-black (`var(--rs-nav-red)` #e3000f → `var(--rs-nav-black)`
#1c1c1c, diagonal), glassy border/blur. These two variables (declared on
`.RS_NewHeader`, sampled from the Adinn logo's own red/black) are **only**
used by the nav-link elements — `.RS_TabPill` and the inactive-tab border
below. `--rs-pink`/`--rs-purple` still exist alongside them and still drive
everything else that was pink/purple (the header's outer rotating glow, the
profile avatar gradient, the bubbles, the cart badge) — those were
deliberately left alone when the nav links switched palette, so don't fold
the two variable pairs back into one without checking that's actually wanted.

## Route-scoped inactive-tab gradient border

`Navbar.tsx` computes `isInnerPage` from `usePathname()` and stamps
`data-innerpage="true"` on the header when it's true:

```ts
const FLAT_BORDER_PREFIXES = ["/roadshow/Contact"];
const isInnerPage = pathname !== "/" && !FLAT_BORDER_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
```

This is a **denylist**, not an allowlist (it was an explicit 4-route
allowlist earlier in this file's history — that changed at some point outside
this conversation; take the denylist as current). Practically: every route
gets the gradient border treatment below **except** the homepage (`/`) and
Contact Us (`/roadshow/Contact`).

On those `isInnerPage` routes, inactive tabs get a red→black→red gradient
border (both corners red, a clearly-visible black band across the middle)
instead of the default flat one, via the padding-box/border-box
double-background trick:

```css
.RS_NewHeader[data-innerpage="true"] .RS_TabItem:not(.RS_TabItem--active):not(:hover):not(:focus-visible)::before {
    border: 1px solid transparent !important;
    background:
        rgba(255, 255, 255, .04) padding-box,
        linear-gradient(120deg,
            var(--rs-nav-red) 0%,
            var(--rs-nav-black) 35%,
            var(--rs-nav-black) 65%,
            var(--rs-nav-red) 100%) border-box !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
```

This is the **fifth** attempt at this specific feature — see Known bugs &
fixes #7/#8/#9/#10 for the earlier ones. The actual root cause, confirmed via
DevTools (not just source-reading), turned out to be **#10**: a browser
paint/compositing bug, not a CSS cascade bug at all — see below. `!important`
(added while chasing what looked like a cascade issue) turned out to be
unnecessary for that specific problem but is harmless and left in place;
it's safe because the selector already excludes `:hover`/`:focus-visible`,
so it can never apply during those states regardless.

## Bubbles

`.RS_Bubble--1/2/3` render as children of whichever `.RS_TabItem` is currently
active, so the floating pink dot decorations travel with the active tab
instead of being fixed to one position.

## Responsive breakpoints

- `< 768px` — mobile, pure CSS, no GSAP dock effect, labels hidden (icon-only)
- `768–1023px`
- `1024–1280px`
- `1281–1439px`
- `≥ 1440px` — header width capped at 1180px (stage 0) rather than scaling with viewport

Each band has its own shell padding / tab gap / font-size tuning in
`Navbar.css`. When adjusting one band, don't touch the others without being
asked — a past fix for the 1024px profile-icon overflow was scoped strictly to
the 768–1023px and 1024–1439px queries for exactly this reason.

## Known bugs & fixes (don't reintroduce these)

1. **Scroll "shaking" jank** — root cause: a continuous `ScrollTrigger` `scrub`
   animating `width`/`height`/`top` every scroll frame, compounding with
   ScrollSmoother's own per-frame smoothing (see `GlobalSmoothScroll.tsx`).
   Fixed by switching to discrete `onEnter`/`onLeaveBack` one-shot tweens fired
   only at threshold crossings, not on every scroll pixel.

2. **Header not centered / drifting left** — two false fixes were tried
   (removing `xPercent`/`rotateX`, moving `perspective` off `.RS_HeaderStage`)
   before finding the real fix: switching centering from
   `left:50%; transform:translate(-50%,0)` to
   `left:0; right:0; margin-inline:auto` (see Centering above). `perspective`
   on an ancestor creates a containing block for `position:fixed` descendants
   just like `transform` does — that was the actual root cause.

3. **Light-theme active-tab gradient washed out** — a CSS specificity bug:
   `.RS_NewHeader[data-theme="light"] .RS_TabItem::before` (attribute-selector
   scoped, higher specificity) was beating the unscoped active-gradient rule.
   Superseded by the Framer Motion `.RS_TabPill` element, which is a plain
   class with no such conflict — don't reintroduce an attribute-scoped
   override of tab shape/gradient.

4. **`gsap.context()` cleanup gotcha** — a function *returned* from inside
   `gsap.context(fn)` is **not** treated as a cleanup hook the way a React
   `useEffect` return is. A `resize` listener's teardown must be registered in
   the effect's own `return () => {...}` (alongside `ctx.revert()`), not
   returned from the `gsap.context` callback itself.

5. **Stage-width monotonicity regression** — widening stage 2 to fix a corner
   overflow (see #6) accidentally made stage 2 wider than stage 0/1 on
   narrow-desktop widths, causing shrink-then-grow-then-grow-more instead of a
   steady shrink on scroll. Fixed by keeping stage widths strictly decreasing
   (see Scroll-driven dock animation above) and solving the overflow via shell
   padding instead of extra width.

6. **Profile icon overflowing the pill's rounded corner at stage 2** — at
   `height:64px, border-radius:30px`, `2×radius` (60px) is nearly the full
   height, leaving almost no straight vertical edge, so content near the shell
   edge visually clips past the curve. Fixed by increasing
   `.RS_NewHeaderShell` padding specifically within the 768–1023px and
   1024–1439px breakpoints — scoped narrowly so `≥1440px` and mobile were
   untouched.

7. **Inactive-tab hover fill silently doing nothing, twice** — two separate
   bugs, same root cause (a CSS specificity tie broken by source order):
   - The hover-fill rule (`.RS_TabItem:hover::before`) and the "keep inactive
     tabs glass" rule (`.RS_TabItem:not(.RS_TabItem--active)::before`) have
     identical specificity (0,2,1). The glass rule sits later in the file, so
     it always won the tie — hover's background/border never actually
     rendered, regardless of what color it was set to. Fixed by adding
     `:not(:hover):not(:focus-visible)` to the glass rule, so it drops out of
     the cascade entirely while hovering instead of tying and winning.
   - Separately, a route-scoped attempt to give inactive tabs a gradient
     *border* on inner pages (see Route-scoped styling above) set
     `border-color: transparent` on `::before` unconditionally (not
     hover-scoped) and relied on a masked `::after` ring to supply the
     visible border instead. Whether or not the mask actually rendered, the
     net effect read as "no border at all" on the affected pages — reverted
     entirely rather than patched further.
   
   Lesson for next time: a border/fill change scoped to "not active" needs
   to also stay out of the way of "hover" and "focus-visible" unless it's
   deliberately meant to override them — check for this exact specificity-tie
   trap before adding another rule that touches `.RS_TabItem::before`.

8. **Fixing #7 broke the light theme** — adding `:not(:hover):not(:focus-visible)`
   to the dark-theme "keep inactive tabs glass" rule raised its specificity
   from (0,2,1) to (0,4,1) — which is *higher* than
   `.RS_NewHeader[data-theme="light"] .RS_TabItem::before`'s (0,3,1). That
   rule is unscoped by theme, so once its specificity passed the light
   theme's, it started winning on light theme too — silently forcing the
   dark theme's white-ish border/background back onto light-theme inactive
   tabs, which (white border on white pill) again read as "no border."
   Fixed by scoping it to `.RS_NewHeader:not([data-theme="light"])` so it
   only ever competes with the dark-theme path. General lesson: raising one
   rule's specificity to fix a conflict with rule A can create a *new*
   conflict with unrelated rule B if B happens to sit just below the old
   specificity and just above the new one — recheck every rule touching the
   same property after a specificity change, not just the one you meant to
   fix.

9. **Gradient border rendering at rest despite matching selector/specificity
   analysis** — after fixing #7/#8, the inner-page gradient-border rule's
   selector was verified to (a) actually be `data-innerpage="true"` on this
   route (checked the *compiled* JS, not just the source, to rule out a stale
   build) and (b) win its cascade tie against the dark-glass rule on paper
   (same specificity, declared later in the file). Despite that, the
   gradient did not render at rest — while hover on the same pseudo-element,
   using a completely different, simpler rule, rendered correctly the whole
   time, ruling out a general rendering problem with `.RS_TabItem::before`.
   The exact mechanism was never conclusively identified. Rather than keep
   guessing, the resting-state rule's `border`/`background`/`backdrop-filter`
   were made `!important` — safe specifically because the selector already
   carries `:not(:hover):not(:focus-visible)`, so it structurally cannot
   apply during those states regardless of `!important`. If a future change
   to this rule stops working again, don't assume `!important` is now
   "protecting" it from everything — re-verify the selector is actually
   matching first (compiled JS, not source) before touching colors again.

10. **The actual root cause behind #9: a stale-paint/compositing bug, not a
    cascade bug** — confirmed via DevTools: the Styles panel showed this
    exact rule as the winning, non-struck-through declaration (correct
    background, correct transparent border) even while the page visually
    showed no border at all. Resizing the browser window (forcing a
    layout/repaint) made the border immediately appear with no code change.
    That combination — computed style is correct, but the paint doesn't
    reflect it until something forces a repaint — is a browser compositing
    bug, not a CSS problem. It's triggered by `data-innerpage` living on the
    ANCESTOR `<header>` and changing via client-side route navigation (no
    full page reload): the browser doesn't always recomposite a
    descendant's cached paint layer when a style it depends on
    (`[data-innerpage="true"]` on an ancestor) changes without a full
    reload, especially for a `::before` this visually complex (multi-layer
    `background-clip` gradient border, previously combined with
    `backdrop-filter`). Fixed by forcing this specific `::before` onto its
    own GPU compositing layer with `translateZ(0)` (folded into the same
    `transform` as the shape's skew, since `transform` isn't additive across
    rules) — a standard, well-known workaround for exactly this class of
    "computed correctly, painted late/never" bug. If a similarly
    invisible-until-forced-repaint bug shows up elsewhere on an element
    whose style depends on an ancestor's route-driven attribute, suspect
    this same mechanism before re-litigating the CSS cascade.

## Out of scope / do not touch here

- The parallel 3D hero-banner work (`HomeBanner/Hero.tsx`, `HeroScene.tsx`,
  `public/models/*.glb`) is a separate, independent feature in progress. It's
  unrelated to the navbar and shouldn't be touched incidentally while editing
  this component.

/* Shared motion vocabulary for the public site.

   Every duration, easing, distance and stagger used by the marketing pages
   lives here so the whole site moves with one personality. Tune a value here
   rather than in a component — that is the point of the file.

   Calibrated "premium & subtle": short travel, soft ease-out, nothing that
   draws attention to itself. Motion should read as the page settling, not as
   an effect playing. */

/* easeOutQuint-ish. Fast start, long gentle settle — the single most important
   value here: a linear or `ease` curve is what makes reveals feel cheap. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* A little overshoot, for things that should feel physical (badges, counters).
   Used sparingly. */
export const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.8,
} as const;

/* Travel distance in px. Deliberately small — anything past ~40px stops
   reading as "settling into place" and starts reading as "flying in". */
export const DISTANCE = {
  sm: 12,
  base: 24,
  lg: 32,
} as const;

export const STAGGER = {
  tight: 0.05,
  base: 0.08,
  loose: 0.12,
} as const;

/* `amount: 0.2` fires once a fifth of the element is showing, so a tall
   section animates as you reach it rather than only when fully on screen.
   `once` keeps it from replaying on every scroll-past, which gets irritating
   fast on a long page. */
export const VIEWPORT = {
  once: true,
  amount: 0.2,
} as const;

export type RevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "none";

/* Note the sign: "up" means the element travels upward INTO place, so it
   starts below its resting position. */
export const offsetFor = (
  direction: RevealDirection,
  distance: number
): { x: number; y: number } => {
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
};

/* Variants meant to be spread onto an element that ALREADY exists in the
   markup (`<motion.div className="TheirClass" variants={fadeIn()} />`) rather
   than wrapping it. Wrapping changes the DOM shape and quietly breaks flex
   gaps, grid placement and `:first-child` rules in the existing stylesheets. */
export const fadeIn = (
  direction: RevealDirection = "up",
  distance: number = DISTANCE.base,
  duration: number = DURATION.base
) => {
  const offset = offsetFor(direction, distance);

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: EASE_OUT },
    },
  };
};

/* Pair with fadeIn() on the children. The container animates nothing itself —
   it only owns the timing. */
export const staggerContainer = (
  stagger: number = STAGGER.base,
  delayChildren: number = 0
) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/* For imagery: a touch of scale alongside the fade reads as depth rather than
   as a card sliding around. */
export const fadeScale = (
  from: number = 0.94,
  duration: number = DURATION.slow
) => ({
  hidden: { opacity: 0, scale: from },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration, ease: EASE_OUT },
  },
});

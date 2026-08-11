/* -------------------------------------------------------------------------- */
/*                        SMOOTH SCROLL CONTROL REGISTRY                       */
/* -------------------------------------------------------------------------- */
/*  The public site runs two independent smooth-scroll engines:                */
/*                                                                            */
/*    - GSAP ScrollSmoother (GlobalSmoothScroll.tsx) on most /roadshow pages   */
/*    - Lenis (SmoothScroll.tsx) wrapping the whole roadshow layout            */
/*                                                                            */
/*  Both drive scrolling from their own wheel/touch listeners rather than      */
/*  native browser scroll, so `overflow: hidden` on body/html does not stop    */
/*  either of them. ScrollSmoother can be reached anywhere via                 */
/*  `ScrollSmoother.get()`, but Lenis has no equivalent global lookup — its    */
/*  instance is local to SmoothScroll's effect. This registry exposes it so    */
/*  popups can actually freeze the page behind them.                          */

export interface LenisLike {
  stop: () => void;
  start: () => void;
}

let activeLenis: LenisLike | null = null;

/** Called by SmoothScroll on mount; pass null on unmount. */
export const registerLenis = (instance: LenisLike | null): void => {
  activeLenis = instance;
};

export const getLenis = (): LenisLike | null => activeLenis;

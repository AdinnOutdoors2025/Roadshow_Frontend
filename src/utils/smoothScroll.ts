// export function smoothScrollTo(target: HTMLElement, duration = 800) {
//   if (!target) return;

//   const start = window.scrollY;
//   const end = target.getBoundingClientRect().top + window.scrollY;
//   const distance = end - start;

//   let startTime: number | null = null;

//   function easeInOutElastic(t: number) {
//     const c4 = (2 * Math.PI) / 3;
//     return t === 0
//       ? 0
//       : t === 1
//       ? 1
//       : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
//   }

//   function animation(currentTime: number) {
//     if (startTime === null) startTime = currentTime;
//     const elapsed = currentTime - startTime;
//     const progress = Math.min(elapsed / duration, 1);
//     const ease = easeInOutElastic(progress);

//     window.scrollTo(0, start + distance * ease);

//     if (elapsed < duration) {
//       requestAnimationFrame(animation);
//     }
//   }

//   requestAnimationFrame(animation);
// }
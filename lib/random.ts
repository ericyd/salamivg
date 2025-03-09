/**
 * The seedable PRNG functions are taken from this SO question:
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * And specifically this insanely thorough answer:
 * https://stackoverflow.com/a/47593316/3991555
 */

import { ClosedInterval, Integer } from './types.js'

export type Rng = () => number

/**
 * Credit: https://stackoverflow.com/a/47593316/3991555
 */
export function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ]
}

/**
 * Credit: https://stackoverflow.com/a/47593316/3991555
 */
export function sfc32(i: number, j: number, k: number, l: number): Rng {
  let a = i
  let b = j
  let c = k
  let d = l
  return () => {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

export function createRng(seed?: string | number): Rng {
  const cyrb128seed = cyrb128(String(seed ?? Date.now()))
  // Four 32-bit component hashes provide the seed for sfc32.
  return sfc32(cyrb128seed[0], cyrb128seed[1], cyrb128seed[2], cyrb128seed[3])
}

export function random(
  min: number,
  max: number,
  rng: Rng = Math.random,
): number {
  const [low, high] = min < max ? [min, max] : [max, min]
  return low + rng() * (high - low)
}

export function randomInt(
  min: number,
  max: number,
  rng: Rng = Math.random,
): Integer {
  return Math.floor(random(min, max, rng))
}

/**
 * @returns {number} an integer in range [0, Number.MAX_SAFE_INTEGER]
 */
export function randomSeed(
  rng: Rng = Math.random,
): ClosedInterval<0, typeof Number.MAX_SAFE_INTEGER> {
  return Math.floor(random(0, Number.MAX_SAFE_INTEGER, rng))
}

/**
 * Returns a random number in range [`value` - `amount`, `value` + `amount`]
 */
export function jitter(amount: number, value: number, rng: Rng): number {
  return random(value - amount, value + amount, rng)
}

/**
 * Shuffle an array.
 * Returns a new array, does *not* modify in place.
 */
export function shuffle<T>(arr: Array<T>, rng: Rng = Math.random): Array<T> {
  const copy = [...arr] // create a copy of original array
  for (let i = copy.length - 1; i; i--) {
    const randomIndex = Math.floor(random(0, i + 1, rng))
    ;[copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]] // swap
  }
  return copy
}

/**
 * Returns a random value from an array
 */
export function randomFromArray<T>(array: Array<T>, rng: Rng = Math.random): T {
  const index = randomInt(0, array.length, rng)
  return array[index]
}

/**
 * Returns a random value from an object
 */
export function randomFromObject<T>(
  obj: Record<string, T>,
  rng: Rng = Math.random,
): T {
  return obj[randomFromArray(Object.keys(obj), rng)]
}

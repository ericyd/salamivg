// resources: https://observablehq.com/@makio135/utilities

/**
 * @param {number} n length of array
 * @returns {number[]}
 */
export function array(n: number): number[] {
  try {
    return new Array(n).fill(0).map((_zero, i) => i)
  } catch (e) {
    const error = new Error(
      `Could not create an array with n: ${n}. Original error: ${
        (e as Error).message
      }`,
    )
    throw error
  }
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} step
 * @returns {number[]}
 */
export function range(min: number, max: number, step = 1): number[] {
  try {
    return new Array((max - min) / step).fill(0).map((_, i) => min + i * step)
  } catch (e) {
    const error = new Error(
      `Could not create an array with min: ${min}, max: ${max}, step: ${step}. Original error: ${
        (e as Error).message
      }`,
    )
    throw error
  }
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} step
 * @returns {[number, number][]}
 */
export function rangeWithIndex(
  min: number,
  max: number,
  step = 1,
): [number, number][] {
  try {
    return new Array((max - min) / step)
      .fill(0)
      .map((_, i) => [min + i * step, i])
  } catch (e) {
    const error = new Error(
      `Could not create an array with min: ${min}, max: ${max}, step: ${step}. Original error: ${
        (e as Error).message
      }`,
    )
    throw error
  }
}

/**
 *
 * @param {Degrees} degrees
 * @returns {Radians}
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * https://github.com/openrndr/openrndr/blob/2ca048076f6999cd79aee0d5b3db471152f59063/openrndr-math/src/commonMain/kotlin/org/openrndr/math/Mapping.kt#L8-L33
 * Linearly maps a value, which is given in the before domain to a value in the after domain.
 * @param {number} beforeLeft the lowest value of the before range
 * @param {number} beforeRight the highest value of the before range
 * @param {number} afterLeft the lowest value of the after range
 * @param {number} afterRight the highest value of the after range
 * @param {number} value the value to be mapped
 * @param {boolean} shouldClamp constrain the result to the after range
 * @return {number} a value in the after range
 */
export function map(
  beforeLeft: number,
  beforeRight: number,
  afterLeft: number,
  afterRight: number,
  value: number,
  shouldClamp?: boolean,
): number {
  const db = beforeRight - beforeLeft
  const da = afterRight - afterLeft

  if (db !== 0.0) {
    const n = (value - beforeLeft) / db
    return afterLeft + (shouldClamp ? clamp(0.0, 1.0, n) : n) * da
  }
  const n = value - beforeLeft
  return afterLeft + (shouldClamp ? clamp(0.0, 1.0, n) : n) * da
}

/**
 * @param {number} min
 * @param {number} max
 * @param {number} x
 * @returns number
 */
export const clamp = (min: number, max: number, x: number): number =>
  Math.max(min, Math.min(max, x))

/**
 *
 * @param {number} quantum
 * @param {number} value
 * @returns {number}
 */
export const quantize = (quantum: number, value: number): number =>
  Math.round(value / quantum) * quantum

// maybe I should just import ramda? https://github.com/ramda/ramda/blob/96d601016b562e887e15efd894ec401672f73757/source/pickBy.js
/**
 * Returns a partial copy of an object containing only the keys that satisfy
 * the supplied predicate.
 * @template T
 * @param {(value: T, key: string, obj: Record<string, T>): boolean} test A predicate to determine whether or not a key
 *        should be included on the output object.
 * @param {Record<string, T>} obj The object to copy from} test
 * @return {Record<string, T>} A new object with only properties that satisfy `pred`
 *         on it.
 */
export function pickBy<T>(
  test: (value: T, key: string, obj: Record<string, T>) => boolean,
  obj: Record<string, T>,
): Record<string, T> {
  const result: Record<string, T> = {}
  for (const prop in obj) {
    if (test(obj[prop], prop, obj)) {
      result[prop] = obj[prop]
    }
  }
  return result
}

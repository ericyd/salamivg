import { Radians } from './types.js'
import { Vector2 } from './vector2.js'

// some helpers to avoid the `Math.` namespace everywhere
export const cos = Math.cos
export const sin = Math.sin
export const tan = Math.tan
export const atan2 = Math.atan2

/**
 * Hypotenuse of a right triangle
 */
export function hypot(x: number, y: number): number {
  return Math.sqrt(x * x + y * y)
}

/**
 * Returns if a number is in a range
 */
export function isWithin(min: number, max: number, value: number): boolean {
  return value > min && value < max
}

/**
 * Returns if a number is in a range [target-error, target+error]
 */
export function isWithinError(
  target: number,
  error: number,
  value: number,
): boolean {
  return value > target - error && value < target + error
}

/**
 * Returns the angle (directionally-aware) of the smallest angular difference between them.
 * The result will always assume traveling from `angle1` to `angle2`;
 * that is, if angle1 is anti-clockwise of angle2, the result will be positive (traveling clockwise to reach angle2),
 * and if angle1 is clockwise of angle2, the result will be negative (traveling anti-clockwise to reach angle2).
 */
export function smallestAngularDifference(
  angle1: Radians,
  angle2: Radians,
): Radians {
  let diff = angle2 - angle1

  // the smallest angular rotation should always be in range [-π, π]
  while (diff > Math.PI) {
    diff -= Math.PI * 2
  }
  while (diff < -Math.PI) {
    diff += Math.PI * 2
  }

  return diff
}

/**
 * Three vertices define an angle.
 * Param `point2` is the vertex.
 * Params `point1` and `point3` are the two end points
 *
 * Two formula for the same thing
 * cos-1 ( (a · b) / (|a| |b|) )
 * sin-1 ( |a × b| / (|a| |b|) )
 */
export function angleOfVertex(
  point1: Vector2,
  point2: Vector2,
  point3: Vector2,
): number {
  const a = point1.subtract(point2)
  const b = point3.subtract(point2)
  const lengthProduct = a.length() * b.length()
  return Math.acos(a.dot(b) / lengthProduct)
}

export function haveSameSign(number1: number, number2: number): boolean {
  return number1 < 0 === number2 < 0
}

/**
 * Sets a value to a fixed precision.
 * @example toFixedPrecision(1.2345, 2) // 1.23
 * @param {number} value the value to be set to a fixed precision
 * @param {Integer} precision the number of decimal places to keep
 * @returns {number}
 */
export function toFixedPrecision(value: number, precision: number): number {
  if (precision === Infinity || precision < 0) {
    return value
  }
  return Math.round(value * 10 ** precision) / 10 ** precision
}

import { Vector2 } from "./vector2.js";

// some helpers to avoid the `Math.` namespace everywhere
export const cos = Math.cos
export const sin = Math.sin
export const tan = Math.tan
export const atan2 = Math.atan2

/**
 * Hypotenuse of a right triangle
 * @param {number} x 
 * @param {number} y 
 * @returns number
 */
export function hypot(x, y) {
  return Math.sqrt(x * x + y * y);
}

/**
 * Returns if a number is in a range
 * @param {number} min 
 * @param {number} max 
 * @param {number} value 
 * @returns {boolean}
 */
export function isWithin(min, max, value) {
  return value > min && value < max
}

/**
 * Returns if a number is in a range [target-error, target+error]
 * @param {number} target 
 * @param {number} error 
 * @param {number} value 
 * @returns {boolean}
 */
export function isWithinError(target, error, value) {
  return value > (target - error) && value < (target + error)
}

/**
 * Returns the angle (directionally-aware) of the smallest angular difference between them.
 * The result will always assume traveling from `angle1` to `angle2`;
 * that is, if angle1 is anti-clockwise of angle2, the result will be positive (traveling clockwise to reach angle2),
 * and if angle1 is clockwise of angle2, the result will be negative (traveling anti-clockwise to reach angle2).
 * @param {Radians} angle1 
 * @param {Radians} angle2 
 * @returns {Radians}
 */
export function smallestAngularDifference(angle1, angle2) {
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
 * @param {Vector2} point1 
 * @param {Vector2} point2 
 * @param {Vector2} point3 
 */
export function angleOfVertex(point1, point2, point3) {
  const a = point1.subtract(point2)
  const b = point3.subtract(point2)
  const lengthProduct = a.length() * b.length()
  return Math.acos(a.dot(b) / lengthProduct)
}

/**
 * @param {number} number1 
 * @param {number} number2 
 * @returns {boolean}
 */
export function haveSameSign(number1, number2) {
  return number1 < 0 === number2 < 0
}

/**
 * Sets a value to a fixed precision.
 * @example toFixedPrecision(1.2345, 2) // 1.23
 * @param {number} value the value to be set to a fixed precision
 * @param {Integer} precision the number of decimal places to keep
 * @returns {number}
 */
export function toFixedPrecision(value, precision) {
  if (precision === Infinity || precision < 0) {
    return value
  }
  return Math.round(value * 10 ** precision) / 10 ** precision
}
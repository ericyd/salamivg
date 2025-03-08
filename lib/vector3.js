import { jitter, random } from './random.js'

export class Vector3 {
  /**
   * @param {number} x coordinate
   * @param {number} [y] coordinate defaults to `x` if omitted.
   * @param {number} [z] coordinate defaults to `y` if omitted.
   */
  constructor(x, y, z) {
    if (typeof x !== 'number') {
      throw new Error(`Vector3 constructor requires a number for x, got ${typeof x}`)
    }
    this.x = x
    this.y = y ?? x
    this.z = z ?? this.y
  }

  /**
   * @param {Vector3} other 
   * @returns {Vector3}
   */
  add(other) {
    return vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /**
   * @param {Vector3} other 
   * @returns {Vector3}
   */
  subtract(other) {
    return vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /**
   * @param {number} n
   * @returns {Vector3}
   */
  divide(n) {
    return vec3(this.x / n, this.y / n, this.z / n)
  }

  /**
   * @param {number} n
   * @returns {Vector3}
   */
  multiply(n) {
    return vec3(this.x * n, this.y * n, this.z * n)
  }

  /**
   * Alias for `multiply`
   * @param {number} n
   * @returns {Vector3}
   */
  scale(n) {
    return this.multiply(n)
  }

  /**
   * Returns a Vector3 that is a mix
   * @param {Vector3} a 
   * @param {Vector3} b 
   * @param {number} mix a mix percentage in range [0, 1] where 0 returns a and 1 returns b
   * @returns {Vector3}
   */
  static mix(a, b, mix) {
    return a.multiply(1 - mix).add(b.multiply(mix))
  }

  /**
   * @param {Vector3} other 
   * @returns {number}
   */
  distanceTo(other) {
    return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2) + Math.pow(other.z - this.z, 2))
  }

  /**
   * The euclidean length of the vector
   * @returns {number}
   */
  length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
  }

  /**
   * Dot product
   * @param {Vector3} other 
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  /**
   * @param {Vector3} a
   * @param {Vector3} b 
   * @returns {Vector3}
   */
  static midpoint(a, b) {
    return vec3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
  }

  /**
   * Returns a random point in the given bounds.
   * @param {number} xMin
   * @param {number} xMax
   * @param {number} yMin
   * @param {number} yMax
   * @param {number} zMin
   * @param {number} zMax
   * @param {import('./random.js').Rng} rng
   * @returns {Vector3}
   */
  static random(xMin, xMax, yMin, yMax, zMin, zMax, rng) {
    return vec3(random(xMin, xMax, rng), random(yMin, yMax, rng), random(zMin, zMax, rng));
  }

  /**
   * Returns a new Vector3, randomly offset by a maximum of `amount`
   * @param {number} amount 
   * @param {import('./random.js').Rng} rng 
   * @returns {Vector3}
   */
  jitter(amount, rng) {
    return vec3(
      jitter(amount, this.x, rng),
      jitter(amount, this.y, rng),
      jitter(amount, this.z, rng),
    )
  }

  /**
   * Value equality check
   * @param {Vector3} other 
   * @returns {boolean}
   */
  eq(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  toString() {
    return `Vector3 { x: ${this.x}, y: ${this.y}, z: ${this.z} }`
  }
}

/**
 * @param {number} x 
 * @param {number} [y] defaults to `x` if omitted. 
 * @param {number} [z] defaults to `y` if omitted. 
 * @returns Vector3
 */
export function vec3(x, y, z) {
  return new Vector3(x, y ?? x, z ?? y ?? x)
}

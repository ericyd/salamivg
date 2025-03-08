import { jitter, random, Rng } from './random'
import { ClosedInterval } from './types'

export class Vector3 {
  x: number
  y: number
  z: number
  /**
   * @param {number} x coordinate
   * @param {number} [y] coordinate defaults to `x` if omitted.
   * @param {number} [z] coordinate defaults to `y` if omitted.
   */
  constructor(x: number, y?: number, z?: number) {
    if (typeof x !== 'number') {
      throw new Error(
        `Vector3 constructor requires a number for x, got ${typeof x}`,
      )
    }
    this.x = x
    this.y = y ?? x
    this.z = z ?? this.y
  }

  add(other: Vector3): Vector3 {
    return vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  subtract(other: Vector3): Vector3 {
    return vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  divide(n: number): Vector3 {
    return vec3(this.x / n, this.y / n, this.z / n)
  }

  multiply(n: number): Vector3 {
    return vec3(this.x * n, this.y * n, this.z * n)
  }

  /**
   * Alias for `multiply`
   */
  scale(n: number): Vector3 {
    return this.multiply(n)
  }

  /**
   * Returns a Vector3 that is a mix
   * @param {Vector3} a
   * @param {Vector3} b
   * @param {number} mix when 0, returns a; when 1, returns b
   * @returns {Vector3}
   */
  static mix(a: Vector3, b: Vector3, mix: ClosedInterval<0, 1>) {
    return a.multiply(1 - mix).add(b.multiply(mix))
  }

  distanceTo(other: Vector3): number {
    return Math.sqrt(
      (other.x - this.x) ** 2 +
        (other.y - this.y) ** 2 +
        (other.z - this.z) ** 2,
    )
  }

  /**
   * The euclidean length of the vector
   */
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2)
  }

  /**
   * Dot product
   */
  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  static midpoint(a: Vector3, b: Vector3): Vector3 {
    return vec3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
  }

  /**
   * Returns a random point in the given bounds.
   */
  static random(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    zMin: number,
    zMax: number,
    rng: Rng,
  ): Vector3 {
    return vec3(
      random(xMin, xMax, rng),
      random(yMin, yMax, rng),
      random(zMin, zMax, rng),
    )
  }

  /**
   * Returns a new Vector3, randomly offset by a maximum of `amount`
   */
  jitter(amount: number, rng: Rng): Vector3 {
    return vec3(
      jitter(amount, this.x, rng),
      jitter(amount, this.y, rng),
      jitter(amount, this.z, rng),
    )
  }

  /**
   * Value equality check
   */
  eq(other: Vector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z
  }

  toString(): string {
    return `Vector3 { x: ${this.x}, y: ${this.y}, z: ${this.z} }`
  }
}

/**
 * @param {number} x
 * @param {number} [y] defaults to `x` if omitted.
 * @param {number} [z] defaults to `y` if omitted.
 */
export function vec3(x: number, y?: number, z?: number): Vector3 {
  return new Vector3(x, y ?? x, z ?? y ?? x)
}

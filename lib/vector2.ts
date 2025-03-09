import { Circle } from './components/circle'
import { jitter, random, Rng } from './random'

export class Vector2 {
  x: number
  y: number
  /**
   * @param {number} x coordinate
   * @param {number} [y] coordinate defaults to `x` if omitted.
   */
  constructor(x: number, y?: number) {
    if (typeof x !== 'number') {
      throw new Error(
        `Vector2 constructor requires a number for x, got ${typeof x}`,
      )
    }
    this.x = x
    this.y = y ?? x
  }

  /**
   * @param {Vector2} other
   * @returns {Vector2}
   */
  add(other: Vector2): Vector2 {
    return vec2(this.x + other.x, this.y + other.y)
  }

  /**
   * @param {Vector2} other
   * @returns {Vector2}
   */
  subtract(other: Vector2): Vector2 {
    return vec2(this.x - other.x, this.y - other.y)
  }

  /**
   * @param {number} n
   * @returns {Vector2}
   */
  divide(n: number): Vector2 {
    return vec2(this.x / n, this.y / n)
  }

  /**
   * @param {number} n
   * @returns {Vector2}
   */
  multiply(n: number): Vector2 {
    return vec2(this.x * n, this.y * n)
  }

  /**
   * Alias for `multiply`
   * @param {number} n
   * @returns {Vector2}
   */
  scale(n: number): Vector2 {
    return this.multiply(n)
  }

  /**
   * Returns a Vector2 that is a mix
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {number} mix a mix percentage in range [0, 1] where 0 returns a and 1 returns b
   * @returns {Vector2}
   */
  static mix(a: Vector2, b: Vector2, mix: number): Vector2 {
    return a.multiply(1 - mix).add(b.multiply(mix))
  }

  /**
   * @param {Vector2} other
   * @returns {number}
   */
  distanceTo(other: Vector2): number {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
  }

  /**
   * The euclidean length of the vector
   * @returns {number}
   */
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  /**
   * Dot product
   * @param {Vector2} other
   */
  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y
  }

  /**
   * @param {Vector2} other
   * @returns {number}
   */
  angleTo(other: Vector2): number {
    return Math.atan2(other.y - this.y, other.x - this.x)
  }

  /**
   * @param {Vector2} a
   * @param {Vector2} b
   * @returns {Vector2}
   */
  static midpoint(a: Vector2, b: Vector2): Vector2 {
    return vec2((a.x + b.x) / 2, (a.y + b.y) / 2)
  }

  /**
   * Returns a random point in the given bounds.
   * @param {number} xMin
   * @param {number} xMax
   * @param {number} yMin
   * @param {number} yMax
   * @param {Rng} rng
   * @returns {Vector2}
   */
  static random(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    rng: Rng,
  ): Vector2 {
    return vec2(random(xMin, xMax, rng), random(yMin, yMax, rng))
  }

  /**
   * Returns a random point within the given circle.
   * @param {Circle} circle
   * @param {Rng} rng
   * @returns {Vector2}
   */
  static randomInCircle(circle: Circle, rng: Rng): Vector2 {
    const angle = random(0, Math.PI * 2, rng)
    const radius = random(0, circle.radius, rng)
    return circle.center.add(Vector2.fromAngle(angle).scale(radius))
  }

  /**
   * Constructs a Vector2 instance from the given angle, in Radians.
   * @param {Radians} angle
   * @returns {Vector2}
   */
  static fromAngle(angle: number): Vector2 {
    return vec2(Math.cos(angle), Math.sin(angle))
  }

  /**
   * Returns a new Vector2, randomly offset by a maximum of `amount`
   * @param {number} amount
   * @param {Rng} rng
   * @returns {Vector2}
   */
  jitter(amount: number, rng: Rng): Vector2 {
    return vec2(jitter(amount, this.x, rng), jitter(amount, this.y, rng))
  }

  /**
   * Value equality check
   * @param {Vector2} other
   * @returns {boolean}
   */
  eq(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y
  }

  toString(): string {
    return `Vector2 { x: ${this.x}, y: ${this.y} }`
  }
}

/**
 * @param {number} x
 * @param {number} [y] defaults to `x` if omitted.
 * @returns Vector2
 */
export function vec2(x: number, y?: number): Vector2 {
  return new Vector2(x, y ?? x)
}

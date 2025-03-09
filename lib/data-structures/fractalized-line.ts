import { LineSegment } from '../components/polyline.js'
import { Path } from '../components/path.js'
import { random, type Rng } from '../random.js'
import { Vector2 } from '../vector2.js'

/**
 * Based on the algorithm used here:
 * http://rectangleworld.com/blog/archives/462
 * and introduced here:
 * http://rectangleworld.com/blog/archives/413
 *
 * Note: since the original algorithm has been removed:
 * It used a linked-list type structure which, yes, is more efficient, but
 * I chose to use a normal array because it is much, much easier to work with.
 * That said, I could potentially implement a custom iterator if I wanted to use a linked list in the future.
 */

/**
 * Represents a fractalized line based on a given set of points.
 */
export class FractalizedLine {
  /**
   * The initial set of points.
   */
  private points: Vector2[]

  /**
   * The random number generator.
   */
  private rng: Rng

  /**
   * @param {Vector2[]} points - The initial set of points.
   * @param {Rng} [rng] - The random number generator. Defaults to the default Random instance.
   */
  constructor(points: Vector2[], rng: Rng = Math.random) {
    this.points = points
    this.rng = rng
  }

  /**
   * The segments formed by connecting consecutive points.
   * @returns {LineSegment[]} - The array of LineSegments.
   */
  get segments(): LineSegment[] {
    const segments: LineSegment[] = []
    for (let i = 0; i < this.points.length - 1; i++) {
      segments.push(new LineSegment(this.points[i], this.points[i + 1]))
    }
    return segments
  }

  /**
   * Creates a Path from the points.
   * @param {boolean} closed - Whether to close the path.
   * @returns {Path} - The created Path instance.
   */
  path(closed = true): Path {
    return Path.fromPoints(this.points, closed)
  }

  /**
   * Recursively subdivide the points using perpendicular offset.
   * @param {number} subdivisions - The number of times to subdivide.
   * @param {number} [offsetPct=0.5] - The percentage of the offset.
   * @returns {FractalizedLine} - The updated FractalizedLine instance.
   */
  perpendicularSubdivide(
    subdivisions: number,
    offsetPct = 0.5,
  ): FractalizedLine {
    return this.subdivide(
      subdivisions,
      offsetPct,
      this.perpendicularOffset.bind(this),
    )
  }

  /**
   * Recursively subdivide the points.
   * @private
   * @param {number} subdivisions - The number of times to subdivide.
   * @param {number} [offsetPct=0.5] - The percentage of the offset.
   * @param {(v1: Vector2, v2: Vector2, n: number) => Vector2} [offsetFn=this.perpendicularOffset] - The offset function.
   * @returns {FractalizedLine} - The updated FractalizedLine instance.
   */
  subdivide(
    subdivisions: number,
    offsetPct = 0.5,
    offsetFn: (
      v1: Vector2,
      v2: Vector2,
      n: number,
    ) => Vector2 = this.perpendicularOffset.bind(this),
  ): FractalizedLine {
    for (let i = 0; i < subdivisions; i++) {
      const newPoints: Vector2[] = []

      for (let j = 0; j < this.points.length - 1; j++) {
        const current = this.points[j]
        const next = this.points[j + 1]
        const mid = offsetFn(current, next, offsetPct)
        newPoints.push(current, mid)
      }
      newPoints.push(this.points[this.points.length - 1])

      this.points = newPoints
    }
    return this
  }

  /**
   * Calculate the perpendicular offset between two points.
   * @private
   * @param {Vector2} start - The starting point.
   * @param {Vector2} end - The ending point.
   * @param {number} offsetPct - The percentage of the offset.
   * @returns {Vector2} - The calculated offset point.
   */
  perpendicularOffset(
    start: Vector2,
    end: Vector2,
    offsetPct: number,
  ): Vector2 {
    const perpendicular =
      Math.atan2(end.y - start.y, end.x - start.x) - Math.PI / 2.0
    const maxDeviation = (start.subtract(end).length() / 2.0) * offsetPct
    const mid = start.add(end).divide(2)
    const offset = random(-maxDeviation, maxDeviation, this.rng)
    return new Vector2(
      mid.x + Math.cos(perpendicular) * offset,
      mid.y + Math.sin(perpendicular) * offset,
    )
  }
}

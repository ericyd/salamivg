import { toFixedPrecision } from '../math.js'
import { Vector2 } from '../vector2.js'
import { Rectangle } from './rectangle.js'
import { CommonAttributes, Tag } from './tag.js'

type PolylineAttributes = CommonAttributes & {
  points?: Vector2[]
}

export class Polyline extends Tag {
  cursor = new Vector2(0, 0)
  points: Vector2[] = []

  /**
   * Initialize to "empty" rectangle
   */
  #boundingBox = new Rectangle({ x: 0, y: 0, width: 0, height: 0 })

  constructor({ points = [], ...attributes }: PolylineAttributes = {}) {
    super('polyline', attributes)
    this.points = points
    this.cursor = points[points.length - 1] ?? new Vector2(0, 0)
  }

  /** @returns {Rectangle} */
  get boundingBox(): Rectangle {
    if (this.#boundingBox.empty()) {
      const xs = this.points.map(({ x }) => x)
      const ys = this.points.map(({ y }) => y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      this.#boundingBox = new Rectangle({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      })
    }
    return this.#boundingBox
  }

  /**
   * Adds a point to the points of the polyline.
   * @param {Vector2} point
   */
  push(point: Vector2) {
    this.points.push(point)
    this.cursor = point
  }

  /**
   * @returns {boolean}
   */
  empty(): boolean {
    return this.points.length === 0
  }

  render(): string {
    if (!Array.isArray(this.points) || this.points.length === 0) {
      throw new Error('Cannot render a Polyline without points')
    }
    this.setAttributes({
      points: this.points
        .map((vec) =>
          [
            toFixedPrecision(vec.x, this.numericPrecision),
            toFixedPrecision(vec.y, this.numericPrecision),
          ].join(','),
        )
        .join(' '),
    })
    return super.render()
  }
}

export function polyline(atts: PolylineAttributes): Polyline
export function polyline(builder: (p: Polyline) => void): Polyline
export function polyline(
  attrsOrBuilder: PolylineAttributes | ((poly: Polyline) => void),
): Polyline {
  if (typeof attrsOrBuilder === 'function') {
    const poly = new Polyline()
    attrsOrBuilder(poly)
    return poly
  }
  return new Polyline(attrsOrBuilder)
}

// I would prefer this to live in it's own file but it creates a circular dependency. oh well.
export class LineSegment extends Polyline {
  /**
   * @param {Vector2} start
   * @param {Vector2} end
   */
  constructor(start: Vector2, end: Vector2) {
    super({
      points: [start, end],
    })
  }
}

/**
 * @param {Vector2} start
 * @param {Vector2} end
 * @returns {LineSegment}
 */
export function lineSegment(start: Vector2, end: Vector2): LineSegment {
  return new LineSegment(start, end)
}

import { toFixedPrecision } from '../math.js'
import { Vector2 } from '../vector2.js'
import { Rectangle } from './rectangle.js'
import { Tag } from './tag.js'

/**
 * @typedef {object} PolygonAttributes
 * @property {Vector2[]} [points=[]]
 */

/**
 * @class Polygon
 * @extends Tag
 */
export class Polygon extends Tag {
  /** @type {Vector2[]} */
  points = []
  /**
   * Initialize to "empty" rectangle
   * @type {Rectangle}
   */
  #boundingBox = new Rectangle({ x: 0, y: 0, width: 0, height: 0 })
  /** @type {Decimal[]} */
  #xs
  /** @type {Decimal[]} */
  #ys

  /**
   * @param {PolygonAttributes} attributes
   */
  constructor({ points = [], ...attributes } = { points: [] }) {
    super('polygon', attributes)
    this.points = points
    this.#xs = points.map(({ x }) => x)
    this.#ys = points.map(({ y }) => y)
  }

  /** @returns {Rectangle} */
  get boundingBox() {
    if (this.#boundingBox.empty()) {
      const minX = Math.min(...this.#xs)
      const maxX = Math.max(...this.#xs)
      const minY = Math.min(...this.#ys)
      const maxY = Math.max(...this.#ys)
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
   * Returns true when the given point is inside the polygon, and false when outside.
   * If the point lies on the edge of the polygon, the results might not be predictable.
   * Credit: https://stackoverflow.com/a/2922778/3991555
   * Original: https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
   * @param {Vector2} point
   */
  contains(point) {
    let i
    let j
    let c = false
    for (i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
      if (
        this.#ys[i] > point.y !== this.#ys[j] > point.y &&
        point.x <
          ((this.#xs[j] - this.#xs[i]) * (point.y - this.#ys[i])) /
            (this.#ys[j] - this.#ys[i]) +
            this.#xs[i]
      ) {
        c = !c
      }
    }
    return c
  }

  render() {
    if (!Array.isArray(this.points) || this.points.length === 0) {
      throw new Error('Cannot render a Polygon without points')
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

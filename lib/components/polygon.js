import { toFixedPrecision } from '../math.js'
import { Vector2 } from '../vector2.js'
import { Rectangle } from './rectangle.js'
import { Tag } from './tag.js'

/**
 * @typedef {object} PolygonAttributes
 * @property {Vector2[]} points
 */

export class Polygon extends Tag {
  /** @type {Vector2[]} */
  points = []
  /**
   * Initialize to "empty" rectangle
   * @type {Rectangle}
   */
  #boundingBox = new Rectangle({ x: 0, y: 0, width: 0, height: 0 })
  /**
   * @param {PolygonAttributes} attributes
   */
  constructor(attributes = { points: [] }) {
    if (!Array.isArray(attributes.points) || attributes.points.length === 0) {
      // Maybe this will change in the future if I make a builder
      throw new Error('Cannot construct a Polygon without points')
    }
    super('polygon', attributes)
    this.points = attributes.points
  }

  /** @returns {Rectangle} */
  get boundingBox() {
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

  render() {
    this.setAttributes({
      points: this.points
        .map(
          (vec) =>
            `${toFixedPrecision(
              vec.x,
              this.numericPrecision,
            )},${toFixedPrecision(vec.y, this.numericPrecision)}`,
        )
        .join(' '),
    })
    return super.render()
  }
}

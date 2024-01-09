import { Vector2 } from '../vector2.js'
import { Rectangle } from './rectangle.js'
import { Tag } from './tag.js'

/**
 * @typedef {object} PolygonAttributes
 * @property {Vector2[]} points
 */

export class Polygon extends Tag {
  /**
   * Initialize to "empty" rectangle
   * @type {Rectangle}
   */
  #boundingBox = new Rectangle({x: 0, y: 0, width: 0, height: 0})
  /**
   * @param {PolygonAttributes} attributes
   */
  constructor(attributes = { points: [] }) {
    if (!Array.isArray(attributes.points) || attributes.points.length === 0) {
      // Maybe this will change in the future if I make a builder
      throw new Error('Cannot construct a Polygon without points')
    }
    super('polygon', attributes)
  }

  /** @returns {Rectangle} */
  get boundingBox() {
    if (this.#boundingBox.empty()) {
      /** @type {Vector2[]} */
      // @ts-expect-error JSDoc doesn't allow casting I guess
      const points = this.attributes.points
      const minX = Math.min(...points.map(({x}) => x))
      const maxX = Math.max(...points.map(({x}) => x))
      const minY = Math.min(...points.map(({y}) => y))
      const maxY = Math.max(...points.map(({y}) => y))
      this.#boundingBox = new Rectangle({ x: minX, y: minY, width: maxX - minX, height: maxY - minY})
    }
    return this.#boundingBox
  }

  #formatAttributes() {
    return Object.entries(this.attributes)
      .map(([key, value]) =>
        key === 'points'
          ? // @ts-expect-error TS doesn't know that we're operating on the points property,
            // which is of type Vector2[]
            `${key}="${value.map((vec) => `${vec.x},${vec.y}`).join(' ')}"`
          : `${key}="${value}"`,
      )
      .join(' ')
  }

  /**
   * @returns {string}
   */
  render() {
    // unfortunately requires it's own render method because of the `points` format.
    // This probably deserves a more nuanced treatment by the Tag class, we'll see.
    return [
      `<${this.tagName} ${this.#formatAttributes()}>`,
      this.children.map((child) => child.render()).join(''),
      `</${this.tagName}>`,
    ].join('')
  }
}

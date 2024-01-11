import { vec2 } from '../vector2.js'
import { Polygon } from './polygon.js'

/** @typedef {import('../vector2.js').Vector2} Vector2 */

/**
 * @typedef {object} HexagonAttributes
 * @property {Vector2} center
 * @property {number} [circumradius] the radius of the circumscribed circle. Either the apothem or the circumradius must be defined.
 * @property {number} [apothem] the radius of the inscribed circle. Either the apothem or the circumradius must be defined.
 * @property {Radians} [rotation=0]
 */

export class Hexagon extends Polygon {
  /** @type {number} */
  #rotation = 0
  /** @type {number} */
  #circumradius
  /** @type {number} */
  #apothem
  /** @type {Vector2} */
  #center

  /**
   * @param {HexagonAttributes} attributes
   */
  constructor({ center, circumradius, apothem, rotation = 0, ...attributes }) {
    if (typeof circumradius !== 'number' && typeof apothem !== 'number') {
      throw new Error('Must provide either circumradius or apothem')
    }

    // @ts-expect-error either circumradius or apothem is defined at this point
    const cr = circumradius ?? (apothem * 2) / Math.sqrt(3)
    const points = new Array(6)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + rotation
      points[i] = center.add(
        vec2(Math.cos(angle), Math.sin(angle)).multiply(cr),
      )
    }

    super({ ...attributes, points })
    this.#center = center
    this.#circumradius = cr
    this.#apothem = apothem ?? (cr * Math.sqrt(3)) / 2
  }

  /**
   * @returns {Hexagon[]} the list of neighboring hexagons, assuming a hexagonal grid
   */
  neighbors() {
    const hexagons = new Array(6)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + this.#rotation + Math.PI / 6
      const center = this.#center.add(
        vec2(Math.cos(angle), Math.sin(angle)).multiply(this.#apothem * 2),
      )
      hexagons[i] = new Hexagon({
        center,
        circumradius: this.#circumradius,
        rotation: this.#rotation,
        ...this.attributes,
      })
    }
    return hexagons
  }
}

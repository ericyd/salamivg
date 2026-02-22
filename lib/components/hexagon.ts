import { Radians } from '../types.js'
import { vec2, Vector2 } from '../vector2.js'
import { CommonAttributes } from './tag.js'
import { Polygon } from './polygon.js'

type HexagonAttributes = CommonAttributes & {
  center: Vector2
  /**
   * the radius of the circumscribed circle. Either the apothem or the circumradius must be defined.
   */
  circumradius?: number
  /**
   * the radius of the inscribed circle. Either the apothem or the circumradius must be defined.
   */
  apothem?: number
  /**
   * @default 0
   */
  rotation?: Radians
}

export class Hexagon extends Polygon {
  #rotation = 0
  #circumradius: number | undefined
  #apothem: number | undefined
  center: Vector2

  constructor({
    center,
    circumradius,
    apothem,
    rotation = 0,
    ...attributes
  }: HexagonAttributes) {
    if (typeof circumradius !== 'number' && typeof apothem !== 'number') {
      throw new Error('Must provide either circumradius or apothem')
    }

    // @ts-expect-error either circumradius or apothem is defined at this point
    const cr = circumradius ?? (apothem * 2) / Math.sqrt(3)
    const points: Vector2[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + rotation
      points[i] = center.add(
        vec2(Math.cos(angle), Math.sin(angle)).multiply(cr),
      )
    }

    super({ ...attributes, points })
    this.center = center
    this.#circumradius = cr
    this.#apothem = apothem ?? (cr * Math.sqrt(3)) / 2
  }

  /**
   * @returns {Hexagon[]} the list of neighboring hexagons, assuming a hexagonal grid
   */
  neighbors(): Hexagon[] {
    const hexagons: Hexagon[] = new Array(6)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + this.#rotation + Math.PI / 6
      const center = this.center.add(
        vec2(Math.cos(angle), Math.sin(angle)).multiply(
          (this.#apothem ?? 1) * 2,
        ),
      )
      hexagons[i] = new Hexagon({
        center,
        circumradius: this.#circumradius ?? 1,
        rotation: this.#rotation,
        ...this.attributes,
      })
    }
    return hexagons
  }
}

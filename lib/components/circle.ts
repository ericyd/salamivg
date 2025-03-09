import { error } from '../internal.js'
import { Vector2, vec2 } from '../vector2.js'
import { Tag } from './tag.js'

export type CircleAttributes = {
  x?: number
  y?: number
  center?: Vector2
  /**
   * @default 1
   */
  radius?: number
}

type Bitangent = [Vector2, Vector2, number, 'inner' | 'outer']
type InnerBitangent = [Vector2, Vector2, number, 'inner']
type OuterBitangent = [Vector2, Vector2, number, 'outer']

/**
 * @class Circle
 */
export class Circle extends Tag {
  #x: number
  #y: number
  #radius: number
  #center: Vector2

  constructor({
    x,
    y,
    radius = 1,
    center,
    ...attributes
  }: CircleAttributes = {}) {
    const [i, j] =
      x !== undefined && y !== undefined
        ? [x, y]
        : center !== undefined
          ? [center.x, center.y]
          : error(
              'Must pass either `x` and `y` or `center` arguments to Circle constructor',
            )
    super('circle', {
      cx: i,
      cy: j,
      r: radius,
      ...attributes,
    })
    this.#x = i
    this.#y = j
    this.#center = vec2(i, j)
    this.#radius = radius
  }

  /**
   * @param {number} value
   */
  set x(value: number) {
    this.setAttributes({ cx: value })
    this.#x = value
  }
  get x(): number {
    return this.#x
  }

  /**
   * @param {number} value
   */
  set y(value: number) {
    this.setAttributes({ cy: value })
    this.#y = value
  }
  get y(): number {
    return this.#y
  }

  /**
   * @param {number} value
   */
  set radius(value: number) {
    this.setAttributes({ r: value })
    this.#radius = value
  }
  get radius(): number {
    return this.#radius
  }

  /**
   * @returns {Vector2}
   */
  get center(): Vector2 {
    return this.#center
  }

  /**
   * Check if the circle contains a point
   * @param {Vector2} point
   * @returns {boolean}
   */
  contains(point: Vector2): boolean {
    return point.distanceTo(this.#center) <= this.#radius
  }

  /**
   * @param {Circle} other
   * @parram {number} [padding=0] optional padding; allows using this method to check for "close to circle" instead of strict intersections
   * @returns {boolean}
   */
  intersectsCircle(other: Circle, padding = 0): boolean {
    return (
      this.center.distanceTo(other.center) <
      this.radius + other.radius + padding
    )
  }

  /**
   * Returns a list of all bitangents, i.e. lines that are tangent to both circles.
   * Thanks SO! https://math.stackexchange.com/questions/719758/inner-tangent-between-two-circles-formula
   * @param {Circle} other
   * @returns {Bitangent[]} a list of tangents,
   * where the first value is the point on `small` and the second value is the point on `large`,
   * and the third value is the angle of the tangent points relative to 0 radians
   */
  bitangents(other: Circle): Bitangent[] {
    // there is some duplicated calculations in outer and inner tangents; consider refactoring
    return (<Bitangent[]>this.outerTangents(other)).concat(
      this.innerTangents(other),
    )
  }

  /**
   * @param {Circle} other
   * @returns {OuterBitangent[]} outer tangent lines
   * where the first value is the point on `small` and the second value is the point on `large`,
   * and the third value is the angle of the tangent points relative to 0 radians
   */
  outerTangents(other: Circle): OuterBitangent[] {
    const small = this.radius > other.radius ? other : this
    const large = this.radius > other.radius ? this : other
    const hypotenuse = small.center.distanceTo(large.center)
    const short = large.radius - small.radius
    const angleBetweenCenters = Math.atan2(small.y - large.y, small.x - large.x)
    const phi = angleBetweenCenters + Math.acos(short / hypotenuse)
    const phi2 = angleBetweenCenters - Math.acos(short / hypotenuse)

    return [
      [
        vec2(
          small.x + small.radius * Math.cos(phi),
          small.y + small.radius * Math.sin(phi),
        ),
        vec2(
          large.x + large.radius * Math.cos(phi),
          large.y + large.radius * Math.sin(phi),
        ),
        phi,
        'outer',
      ],
      [
        vec2(
          small.x + small.radius * Math.cos(phi2),
          small.y + small.radius * Math.sin(phi2),
        ),
        vec2(
          large.x + large.radius * Math.cos(phi2),
          large.y + large.radius * Math.sin(phi2),
        ),
        phi2,
        'outer',
      ],
    ]
  }

  /**
   * @param {Circle} other
   * @returns {InnerBitangent[]} inner tangent lines,
   * where the first value is the point on `small` and the second value is the point on `large`,
   * and the third value is the angle of the tangent points relative to 0 radians
   */
  innerTangents(other: Circle): InnerBitangent[] {
    if (this.intersectsCircle(other)) {
      return []
    }
    const small = this.radius > other.radius ? other : this
    const large = this.radius > other.radius ? this : other
    const hypotenuse = small.center.distanceTo(large.center)
    const short = large.radius + small.radius
    const angleBetweenCenters = Math.atan2(small.y - large.y, small.x - large.x)
    const phi =
      angleBetweenCenters + Math.asin(short / hypotenuse) - Math.PI / 2
    const phi2 =
      angleBetweenCenters - Math.asin(short / hypotenuse) - Math.PI / 2

    return [
      [
        vec2(
          small.x - small.radius * Math.cos(phi),
          small.y - small.radius * Math.sin(phi),
        ),
        vec2(
          large.x + large.radius * Math.cos(phi),
          large.y + large.radius * Math.sin(phi),
        ),
        phi,
        'inner',
      ],
      [
        vec2(
          small.x + small.radius * Math.cos(phi2),
          small.y + small.radius * Math.sin(phi2),
        ),
        vec2(
          large.x - large.radius * Math.cos(phi2),
          large.y - large.radius * Math.sin(phi2),
        ),
        phi2,
        'inner',
      ],
    ]
  }

  toString(): string {
    return `Circle { x: ${this.#x}, y: ${this.#y}, radius: ${this.#radius} }`
  }
}

export function circle(attrs: CircleAttributes): Circle
export function circle(x: number, y: number, radius: number): Circle
export function circle(builder: (c: Circle) => void): Circle
export function circle(
  attrsOrBuilderOrX: CircleAttributes | number | ((circle: Circle) => void),
  y?: number,
  radius?: number,
): Circle {
  if (typeof attrsOrBuilderOrX === 'function') {
    const c = new Circle()
    attrsOrBuilderOrX(c)
    return c
  }
  if (typeof attrsOrBuilderOrX === 'object') {
    return new Circle(attrsOrBuilderOrX as CircleAttributes)
  }
  if (
    typeof attrsOrBuilderOrX === 'number' &&
    typeof y === 'number' &&
    typeof radius === 'number'
  ) {
    return new Circle({ x: attrsOrBuilderOrX, y, radius })
  }
  throw new Error(
    `Unable to construct circle from "${attrsOrBuilderOrX}, ${y}, ${radius}"`,
  )
}

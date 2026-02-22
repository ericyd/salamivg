import { Vector2, vec2 } from '../vector2.js'
import { LineSegment } from './polyline.js'
import { CommonAttributes, Tag } from './tag.js'

type RectangleAttributes = CommonAttributes & {
  /**
   * @default 0
   */
  x?: number
  /**
   * @default 0
   */
  y?: number
  /**
   * @default 1
   */
  width?: number
  /**
   * @default 1
   */
  height?: number
  /**
   * If provided, sets the `rx` property of the SVG rect tag.
   * Takes precedence over `rx` property if both are passed in the constructor
   */
  borderRadius?: number
  /**
   * border radius in the x direction
   */
  rx?: number
  /**
   * border radius in the y direction. Defaults to rx if not provided.
   */
  ry?: number
}

/**
 * @example
 *   const r = rect(r => {
 *     r.fill = '#000'
 *     r.stroke = '#055'
 *     r.x = 1
 *     r.y = 10
 *     r.width = 100
 *     r.height = 15
 *     r.borderRadius = 1.4
 *   })
 * @example
 *   const r = rect({ x: 1, y: 10, width: 100, height: 15, borderRadius: 1.4 })
 */
export class Rectangle extends Tag {
  constructor(attributes: RectangleAttributes = {}) {
    super('rect', {
      x: attributes.x ?? 0,
      y: attributes.y ?? 0,
      width: attributes.width ?? 1,
      height: attributes.height ?? 1,
      rx: attributes.borderRadius ?? attributes.rx,
      ...attributes,
    })
  }

  set x(value: number) {
    this.setAttributes({ x: value })
  }

  get x(): number {
    return this.attributes.x as number
  }

  set y(value: number) {
    this.setAttributes({ y: value })
  }

  get y(): number {
    return this.attributes.y as number
  }

  set width(value: number) {
    this.setAttributes({ width: value })
  }

  get width(): number {
    return this.attributes.width as number
  }

  set height(value: number) {
    this.setAttributes({ height: value })
  }

  get height(): number {
    return this.attributes.height as number
  }

  set borderRadius(value: number) {
    this.setAttributes({ rx: value })
  }

  get center(): Vector2 {
    return vec2(this.x + this.width / 2, this.y + this.height / 2)
  }

  get corner(): Vector2 {
    return vec2(this.x, this.y)
  }

  vertices(): Vector2[] {
    return [
      vec2(this.x, this.y),
      vec2(this.x, this.y + this.height),
      vec2(this.x + this.width, this.y + this.height),
      vec2(this.x + this.width, this.y),
    ]
  }

  sides(): LineSegment[] {
    return [
      new LineSegment(vec2(this.x, this.y), vec2(this.x, this.y + this.height)),
      new LineSegment(
        vec2(this.x, this.y + this.height),
        vec2(this.x + this.width, this.y + this.height),
      ),
      new LineSegment(
        vec2(this.x + this.width, this.y + this.height),
        vec2(this.x + this.width, this.y),
      ),
      new LineSegment(vec2(this.x + this.width, this.y), vec2(this.x, this.y)),
    ]
  }

  static fromCenter(center: Vector2, width: number, height: number): Rectangle {
    return new Rectangle({
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    })
  }

  empty(): boolean {
    return this.x === 0 && this.y === 0 && this.width === 0 && this.height === 0
  }
}

type RectFunction = (rect: Rectangle) => void

// TODO: add proper overloads
/**
 * @param {RectangleAttributes | number | RectFunction} attrsOrBuilderOrX
 * @param {number} [y]
 * @param {number} [width]
 * @param {number} [height]
 */
export function rect(
  attrsOrBuilderOrX: RectangleAttributes | number | RectFunction,
  y?: number,
  width?: number,
  height?: number,
): Rectangle {
  if (typeof attrsOrBuilderOrX === 'function') {
    const c = new Rectangle()
    attrsOrBuilderOrX(c)
    return c
  }
  if (typeof attrsOrBuilderOrX === 'object') {
    return new Rectangle(attrsOrBuilderOrX as RectangleAttributes)
  }
  if (
    typeof attrsOrBuilderOrX === 'number' &&
    (typeof y === 'number' || y === undefined) &&
    (typeof width === 'number' || width === undefined) &&
    (typeof height === 'number' || height === undefined)
  ) {
    return new Rectangle({ x: attrsOrBuilderOrX, y, width, height })
  }
  throw new Error(
    `Unable to construct circle from "${attrsOrBuilderOrX}, ${y}, ${width}, ${height}"`,
  )
}

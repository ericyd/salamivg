// utilities for svg path tags
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#path_commands
//
// MoveTo: M, m
// LineTo: L, l, H, h, V, v
// Cubic Bézier Curve: C, c, S, s
// Quadratic Bézier Curve: Q, q, T, t
// Elliptical Arc Curve: A, a
// ClosePath: Z, z
//
// Note: Commands are case-sensitive.
// An upper-case command specifies absolute coordinates,
// while a lower-case command specifies coordinates relative to the current position.
//
// It is always possible to specify a negative value as an argument to a command:
//   negative angles will be anti-clockwise;
//   absolute negative x and y values are interpreted as negative coordinates;
//   relative negative x values move to the left, and relative negative y values move upwards.

import { Tag } from './tag'
import { vec2, Vector2 } from '../vector2'
import { toFixedPrecision } from '../math'

export type CoordinateType = 'absolute' | 'relative'
// TODO: consider adding definitions for shared attributes like fill, stroke, etc
export type PathAttributes = Record<string, unknown>
export type ArcProps = {
  rx: number
  ry: number
  /**
   * @default 0
   */
  xAxisRotation?: number
  /**
   * @default false
   */
  largeArcFlag?: boolean
  /**
   * @default false
   */
  sweepFlag?: boolean
  end: Vector2
}

export class Path extends Tag {
  #d: PathInstruction[] = []
  cursor: Vector2

  constructor(attributes: PathAttributes = {}) {
    super('path', attributes)
    this.cursor = vec2(0, 0)
  }

  /**
   *
   * @param {Vector2} endPoint
   * @param {CoordinateType} coordinateType
   */
  moveTo(endPoint: Vector2, coordinateType: CoordinateType = 'absolute'): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'M' : 'm', [
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   *
   * @param {Vector2} endPoint
   * @param {CoordinateType} coordinateType
   */
  lineTo(endPoint: Vector2, coordinateType: CoordinateType = 'absolute'): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'L' : 'l', [
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   * * C
   * (x1,y1, x2,y2, x,y)
   * Draw a cubic Bézier curve from the current point to the end point specified by x,y.
   * The start control point is specified by x1,y1 and the end control point is specified by x2,y2
   * @param {Vector2} controlPoint1
   * @param {Vector2} controlPoint2
   * @param {Vector2} endPoint
   * @param {CoordinateType} coordinateType
   */
  cubicBezier(
    controlPoint1: Vector2,
    controlPoint2: Vector2,
    endPoint: Vector2,
    coordinateType: CoordinateType = 'absolute',
  ): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'C' : 'c', [
        controlPoint1,
        controlPoint2,
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   * S
   * Draw a smooth cubic Bézier curve from the current point to the end point specified by x,y.
   * The end control point is specified by x2,y2.
   * The start control point is a reflection of the end control point of the previous curve command
   * @param {Vector2} controlPoint
   * @param {Vector2} endPoint
   * @param {'absolute' | 'relative'} coordinateType
   */
  smoothBezier(
    controlPoint: Vector2,
    endPoint: Vector2,
    coordinateType: CoordinateType = 'absolute',
  ): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'S' : 's', [
        controlPoint,
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   * Draw a quadratic curve controlled by `controlPoint` to the `endPoint`
   * @param {Vector2} controlPoint
   * @param {Vector2} endPoint
   * @param {'absolute' | 'relative'} coordinateType
   */
  quadraticBezier(
    controlPoint: Vector2,
    endPoint: Vector2,
    coordinateType: CoordinateType = 'absolute',
  ): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'Q' : 'q', [
        controlPoint,
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   * Draw a quadratic curve controlled by `controlPoint` to the `endPoint`
   * @param {Vector2} controlPoint
   * @param {Vector2} endPoint
   * @param {'absolute' | 'relative'} coordinateType
   */
  smoothQuadraticBezier(
    controlPoint: Vector2,
    endPoint: Vector2,
    coordinateType: CoordinateType = 'absolute',
  ): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'T' : 't', [
        controlPoint,
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  arc(
    {
      rx,
      ry,
      xAxisRotation = 0,
      largeArcFlag = false,
      sweepFlag = false,
      end,
    }: ArcProps,
    coordinateType: CoordinateType = 'absolute',
  ): void {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'A' : 'a', [
        vec2(rx, ry),
        xAxisRotation,
        Number(largeArcFlag),
        Number(sweepFlag),
        end,
      ]),
    )
  }

  close(): void {
    this.#d.push(new PathInstruction('Z', []))
    this.cursor = this.#d[0].endPoint
  }

  /**
   * @param {Vector2[]} points
   * @param {boolean} [closed=true]
   * @param {CoordinateType} [coordinateType='absolute']
   */
  static fromPoints(
    points: Vector2[],
    closed = true,
    coordinateType: CoordinateType = 'absolute',
  ): Path {
    return path((p) => {
      p.moveTo(points[0], coordinateType)
      for (let i = 1; i < points.length; i++) {
        p.lineTo(points[i], coordinateType)
      }
      if (closed) {
        p.close()
      }
    })
  }

  render(): string {
    this.setAttributes({
      d: this.#d.map((p) => p.render(this.numericPrecision)).join(' '),
    })
    return super.render()
  }
}

export type PathAttributesOrBuilder = PathAttributes | ((Path: Path) => void)

export function path(
  attrsOrBuilder: PathAttributes,
  attributes?: PathAttributes,
): Path
export function path(
  attrsOrBuilder: (Path: Path) => void,
  attributes?: PathAttributes,
): Path
export function path(
  attrsOrBuilder: PathAttributesOrBuilder,
  attributes: PathAttributes = {},
): Path {
  if (typeof attrsOrBuilder === 'function') {
    const c = new Path(attributes)
    attrsOrBuilder(c)
    return c
  }
  if (typeof attrsOrBuilder === 'object') {
    return new Path(attrsOrBuilder)
  }
  throw new Error(`Unable to construct Path from "${attrsOrBuilder}"`)
}

type PathCommand =
  | 'l'
  | 'L'
  | 'm'
  | 'M'
  | 'c'
  | 'C'
  | 's'
  | 'S'
  | 'Z'
  | 'A'
  | 'a'
  | 'Q'
  | 'q'
  | 'T'
  | 't'

class PathInstruction {
  endPoint: Vector2
  points: (Vector2 | number)[]
  commandType: PathCommand
  constructor(commandType: PathCommand, points: (Vector2 | number)[]) {
    // This isn't super resilient, but this class should never be instantiated manually so it should be fine
    this.endPoint = typeof points?.[0] === 'number' ? vec2(0, 0) : points[0]
    this.points = points
    this.commandType = commandType
  }

  /**
   * @param {number} [precision=Infinity]
   * @returns {string}
   */
  render(precision: number = Infinity): string {
    return [
      this.commandType,
      ...this.points.map((pt) =>
        pt instanceof Vector2
          ? [
              toFixedPrecision(pt.x, precision),
              toFixedPrecision(pt.y, precision),
            ].join(' ')
          : toFixedPrecision(pt as number, precision).toString(),
      ),
    ].join(' ')
  }
}

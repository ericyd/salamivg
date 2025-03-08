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

import { Tag } from './tag.js'
import { vec2, Vector2 } from '../vector2.js'
import { toFixedPrecision } from '../math.js'

/**
 * @typedef CoordinateType
 * @type {'absolute' | 'relative'}
 */

/**
 * @typedef {Record<string, unknown>} PathAttributes
 * TODO: consider adding definitions for shared attributes like fill, stroke, etc
 */

/**
 * @class Path
 * @extends Tag
 */
export class Path extends Tag {
  /** @type {PathInstruction[]} */
  #d = []
  /**
   * @param {PathAttributes} [attributes={}]
   */
  constructor(attributes = {}) {
    super('path', attributes)
    this.cursor = vec2(0, 0)
  }

  /**
   * This only works when the path is only made up of straight lines...
   * @type {Vector2[]}
   */
  get points() {
    return this.#d.map((p) => p.endPoint)
  }

  /**
   *
   * @param {Vector2} endPoint
   * @param {CoordinateType} coordinateType
   */
  moveTo(endPoint, coordinateType = 'absolute') {
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
  lineTo(endPoint, coordinateType = 'absolute') {
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
    controlPoint1,
    controlPoint2,
    endPoint,
    coordinateType = 'absolute',
  ) {
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
  smoothBezier(controlPoint, endPoint, coordinateType = 'absolute') {
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
  quadraticBezier(controlPoint, endPoint, coordinateType = 'absolute') {
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
  smoothQuadraticBezier(controlPoint, endPoint, coordinateType = 'absolute') {
    this.#d.push(
      new PathInstruction(coordinateType === 'absolute' ? 'T' : 't', [
        controlPoint,
        endPoint,
      ]),
    )
    this.cursor = endPoint
  }

  /**
   * @typedef {object} ArcProps
   * @property {number} rx
   * @property {number} ry
   * @property {number} [xAxisRotation=0]
   * @property {boolean} [largeArcFlag=false]
   * @property {boolean} [sweepFlag=false]
   * @property {Vector2} end
   */
  /**
   *
   * @param {ArcProps} props
   * @param {'absolute' | 'relative'} coordinateType
   */
  arc(
    { rx, ry, xAxisRotation = 0, largeArcFlag = false, sweepFlag = false, end },
    coordinateType = 'absolute',
  ) {
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

  close() {
    this.#d.push(new PathInstruction('Z', []))
    this.cursor = this.#d[0].endPoint
  }

  /**
   * @param {Vector2[]} points
   * @param {boolean} [closed=true]
   * @param {CoordinateType} [coordinateType='absolute']
   */
  static fromPoints(points, closed = true, coordinateType = 'absolute') {
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

  render() {
    this.setAttributes({
      d: this.#d.map((p) => p.render(this.numericPrecision)).join(' '),
    })
    return super.render()
  }
}

/** @typedef {PathAttributes | ((Path: Path) => void)} PathAttributesOrBuilder */

/**
 * @overload
 * @param {PathAttributes} attrsOrBuilder
 * @param {PathAttributes} [attributes={}]
 * @returns {Path}
 */
/**
 * @overload
 * @param {(Path: Path) => void} attrsOrBuilder
 * @param {PathAttributes} [attributes={}]
 * @returns {Path}
 */
/**
 * @param {PathAttributesOrBuilder} attrsOrBuilder
 * @param {PathAttributes} [attributes={}]
 * @returns {Path}
 */
export const path = (attrsOrBuilder, attributes = {}) => {
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

class PathInstruction {
  /**
   *
   * @param {'l' | 'L' | 'm' | 'M' | 'c' | 'C' | 's' | 'S' | 'Z' | 'A' | 'a' | 'Q' | 'q' | 'T' | 't'} commandType
   * @param {(Vector2 | number)[]} points
   */
  constructor(commandType, points) {
    // This isn't super resilient, but this class should never be instantiated manually so it should be fine
    this.endPoint = typeof points?.[0] === 'number' ? vec2(0, 0) : points[0]
    this.points = points
    this.commandType = commandType
  }

  /**
   * @param {number} [precision=Infinity]
   * @returns {string}
   */
  render(precision = Infinity) {
    return [
      this.commandType,
      ...this.points.map((pt) =>
        pt instanceof Vector2
          ? [
              toFixedPrecision(pt.x, precision),
              toFixedPrecision(pt.y, precision),
            ].join(' ')
          : toFixedPrecision(pt, precision).toString(),
      ),
    ].join(' ')
  }
}

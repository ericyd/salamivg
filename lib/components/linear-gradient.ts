import { ColorHsl } from '../color/hsl'
import { ColorRgb } from '../color/rgb'
import { Vector2, vec2 } from '../vector2'
import { Tag } from './tag'

/** @typedef {import("../color/color-sequence.js").ColorStop} ColorStop */

/**
 * @typedef {object} LinearGradientAttributes
 * @property {ColorStop[]} [stops]
 * @property {Array<ColorRgb | ColorHsl | string>} [colors]
 * @property {Vector2} [start=new Vector2(0, 0)]
 * @property {Vector2} [end=new Vector2(0, 1)]
 * @property {string} [id=Math.random().toString(16).replace(/^0\./, '')]
 * @property {number} [numericPrecision=Infinity]
 */

/**
 * @class LinearGradient
 * @extends Tag
 */
export class LinearGradient extends Tag {
  /** @param {LinearGradientAttributes} [attributes] */
  constructor({
    stops,
    colors,
    start = vec2(0, 0),
    end = vec2(0, 1),
    id = Math.random().toString(16).replace(/^0\./, ''),
    numericPrecision = Infinity,
  } = {}) {
    if ((stops?.length ?? 0) === 0 && (colors?.length ?? 0) === 0) {
      throw new Error(
        'Cannot create linear gradient without at least one stop or color',
      )
    }

    super('linearGradient', {
      x1: start.x,
      x2: end.x,
      y1: start.y,
      y2: end.y,
      id,
    })
    this.numericPrecision = numericPrecision
    /** @type {Array<[number, ColorHsl | ColorRgb]> | undefined} */
    const colorStops =
      stops?.map(([num, color]) => [
        num,
        typeof color === 'string' ? ColorRgb.fromHex(color) : color,
      ]) ??
      colors?.map((color, i, array) => [
        (i / (array.length - 1)) * 100,
        typeof color === 'string' ? ColorRgb.fromHex(color) : color,
      ])
    this.children =
      colorStops?.map(
        (stop) => new LinearGradientStop(stop, this.numericPrecision),
      ) ?? []
  }

  get id() {
    return this.attributes.id
  }
}

class LinearGradientStop extends Tag {
  /** @param {ColorStop} stop */
  constructor(stop, numericPrecision = Infinity) {
    super('stop', {
      offset: stop[0],
      'stop-color': stop[1],
    })
    this.numericPrecision = numericPrecision
  }
}

import { ColorRgb } from './rgb'
import { ColorHsl } from './hsl'

/** @typedef {string | ColorRgb | ColorHsl} Color */

/**
 * `number` attribute is value in range [0, 1] that identifies the part of the spectrum where the color is present.
 * @typedef {[number, Color]} ColorStop
 */

/**
 * The public interface can accept any type of color (string, rgb, hsl), but internally it is stored as Hsl
 * @typedef {[number, ColorHsl]} InternalColorStop
 */

/**
 * @description A sequence of colors that can be linearly interpolated together.
 * @example
 * const spectrum = ColorSequence.fromColors(['#ff0000', '#00ff00', '#0000ff'])
 * spectrum.at(0) // ColorHsl ColorHsl { h: 0, s: 1, l: 0.5, a: 1 }
 * spectrum.at(0.5) // ColorHsl { h: 120, s: 1, l: 0.5, a: 1 }
 * spectrum.at(1) // ColorHsl { h: 240, s: 1, l: 0.5, a: 1 }
 * @example
 * // You may customize the "stops" as needed
 * const spectrum = new ColorSequence([
 *   [0, '#ff0000'],
 *   [0.7, '#00ff00'],
 *   [1, '#0000ff']
 * ])
 * spectrum.at(0) // ColorHsl { h: 0, s: 1, l: 0.5, a: 1 }
 * spectrum.at(0.5) // ColorHsl { h: 85.71428571428572, s: 1, l: 0.5, a: 1 }
 * spectrum.at(0.7) // ColorHsl { h: 120, s: 1, l: 0.5, a: 1 }
 * spectrum.at(1) // ColorHsl { h: 240, s: 1, l: 0.5, a: 1 }
 */
export class ColorSequence {
  /** @type {InternalColorStop[]} */
  #pairs = []

  /**
   * @param {ColorStop[]} pairs
   */
  constructor(pairs) {
    this.#pairs = pairs.map(([stopVal, color]) => [stopVal, colorToHsl(color)])
  }

  /**
   * @param {Color[]} colors list of colors (hex strings, ColorRgb instances, or ColorHsl instances)
   * @returns {ColorSequence}
   */
  static fromColors(colors) {
    return new ColorSequence(
      colors.map((color, i, array) => [
        i / (array.length - 1),
        colorToHsl(color),
      ]),
    )
  }

  /**
   * Returns a linearly interpolated color from the color sequence based on the `t` value.
   * @param {number} t
   * @returns {ColorHsl}
   */
  at(t) {
    const stopB = this.#pairs.findIndex(([stopVal]) => stopVal >= t)
    if (stopB === 0 || this.#pairs.length === 1) {
      return this.#pairs[stopB][1]
    }
    if (stopB === -1) {
      return this.#pairs[this.#pairs.length - 1][1]
    }
    const stopA = stopB - 1
    const range = this.#pairs[stopB][0] - this.#pairs[stopA][0]
    const percentage = (t - this.#pairs[stopA][0]) / range
    return this.#pairs[stopA][1].mix(this.#pairs[stopB][1], percentage)
  }
}

/**
 * @param {Color} color
 * @returns {ColorHsl}
 */
function colorToHsl(color) {
  if (typeof color === 'string') {
    return ColorRgb.fromHex(color).toHsl()
  }
  if (color instanceof ColorRgb) {
    return color.toHsl()
  }
  if (color instanceof ColorHsl) {
    return color
  }
  throw new Error(`Invalid color type: ${color}`)
}

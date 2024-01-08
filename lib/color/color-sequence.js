import { ColorRgb } from './rgb.js'

/**
 * `number` attribute is value in range [0, 1] that identifies the part of the spectrum where the color is present.
 * @typedef {[number, ColorRgb]} ColorStop
 */

/**
 * @description A sequence of colors that can be linearly interpolated together.
 * @example
 * const spectrum = ColorSequence.fromHexes(['#ff0000', '#00ff00', '#0000ff'])
 * spectrum.at(0) // ColorRgb { r: 1, g: 0, b: 0, a: 1 }
 * spectrum.at(0.5) // ColorRgb { r: 0, g: 1, b: 0, a: 1 }
 * spectrum.at(1) // ColorRgb { r: 0, g: 0, b: 1, a: 1 }
 * @example
 * // You may customize the "stops" as needed
 * // Note that you must pass ColorRgb instances in the ColorStop pairs,
 * // rather than simple hex strings
 * const spectrum = new ColorSequence([
 *   [0, ColorRgb.fromHex('#ff0000')],
 *   [0.7, ColorRgb.fromHex('#00ff00')],
 *   [1, ColorRgb.fromHex('#0000ff')]
 * ])
 * spectrum.at(0) // ColorRgb { r: 1, g: 0, b: 0, a: 1 }
 * spectrum.at(0.5) // ColorRgb { r: 0.5714285714285714, g: 1, b: 0, a: 1 }
 * spectrum.at(0.7) // ColorRgb { r: 0, g: 1, b: 0, a: 1 }
 * spectrum.at(1) // ColorRgb { r: 0, g: 0, b: 1, a: 1 }
 */
export class ColorSequence {
  /** @type {ColorStop[]} */
  #pairs = []

  /**
   * @param {ColorStop[]} pairs
   */
  constructor(pairs) {
    this.#pairs = pairs
  }

  /**
   * @param {string[]} hexes list of color hex strings
   * @returns {ColorSequence}
   */
  static fromHexes(hexes) {
    console.log(
      hexes.map((hex, i, array) => [
        i / (array.length - 1),
        ColorRgb.fromHex(hex).toString(),
      ]),
    )
    return new ColorSequence(
      hexes.map((hex, i, array) => [
        i / (array.length - 1),
        ColorRgb.fromHex(hex),
      ]),
    )
  }

  /**
   * @param {number} t
   * @returns {ColorRgb}
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

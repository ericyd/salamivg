import { warnWithDefault } from '../internal.js'
import { ClosedInterval } from '../types.js'
import { clamp } from '../util.js'
import { ColorHsl } from './hsl.js'

export class ColorRgb {
  r: ClosedInterval<0, 1>
  g: ClosedInterval<0, 1>
  b: ClosedInterval<0, 1>
  a: ClosedInterval<0, 1>

  constructor(
    red: ClosedInterval<0, 1>,
    green: ClosedInterval<0, 1>,
    blue: ClosedInterval<0, 1>,
    alpha: ClosedInterval<0, 1> = 1,
  ) {
    this.r =
      red > 1 || red < 0
        ? warnWithDefault(`clamping r '${red}' to [0, 1]`, clamp(0, 1, red))
        : red
    this.g =
      green > 1 || green < 0
        ? warnWithDefault(`clamping g '${green}' to [0, 1]`, clamp(0, 1, green))
        : green
    this.b =
      blue > 1 || blue < 0
        ? warnWithDefault(`clamping b '${blue}' to [0, 1]`, clamp(0, 1, blue))
        : blue
    this.a =
      alpha > 1 || alpha < 0
        ? warnWithDefault(`clamping a '${alpha}' to [0, 1]`, clamp(0, 1, alpha))
        : alpha
  }

  static Black = new ColorRgb(0, 0, 0)
  static White = new ColorRgb(1, 1, 1)

  /**
   * credit: https://github.com/openrndr/openrndr/blob/d184fed22e191df2860ed47f9f9354a142ad52b6/openrndr-color/src/commonMain/kotlin/org/openrndr/color/ColorRGBa.kt#L84-L131
   * @param {string} hex color hex string, e.g. '#000'
   */
  static fromHex(hex: string): ColorRgb {
    const raw = hex.replace(/^0x|#/, '')
    /**
     * @param {string} str
     * @param {number} start
     * @param {number} end
     * @returns number
     */
    const fromHex = (
      str: string,
      start: number,
      end: number,
      multiplier = 1,
    ): number => (multiplier * parseInt(str.slice(start, end), 16)) / 255

    switch (raw.length) {
      case 3:
        return new ColorRgb(
          fromHex(raw, 0, 1, 17),
          fromHex(raw, 1, 2, 17),
          fromHex(raw, 2, 3, 17),
        )
      case 6:
        return new ColorRgb(
          fromHex(raw, 0, 2),
          fromHex(raw, 2, 4),
          fromHex(raw, 4, 6),
        )
      case 8:
        return new ColorRgb(
          fromHex(raw, 0, 2),
          fromHex(raw, 2, 4),
          fromHex(raw, 4, 6),
          fromHex(raw, 6, 8),
        )
      default:
        throw new Error(`Cannot construct ColorRgb from value ${hex}`)
    }
  }

  /**
   * This is very homespun, I imagine there are serious optimizations available
   * @param {ColorRgb} other
   * @param {number} [mix=0.5] the mix of the two colors. When 0, returns `this`. When 1, returns `other`
   * @returns {ColorRgb}
   */
  mix(other: ColorRgb, mix = 0.5): ColorRgb {
    return ColorHsl.fromRgb(this).mix(ColorHsl.fromRgb(other), mix).toRgb()
  }

  toString(): string {
    return `rgb(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`
  }

  toHex(): string {
    return [
      '#',
      Math.round(this.r * 255)
        .toString(16)
        .padStart(2, '0'),
      Math.round(this.g * 255)
        .toString(16)
        .padStart(2, '0'),
      Math.round(this.b * 255)
        .toString(16)
        .padStart(2, '0'),
      Math.round(this.a * 255)
        .toString(16)
        .padStart(2, '0'),
    ].join('')
  }

  /**
   * Converts to HSL color space
   * @returns {ColorHsl}
   */
  toHsl(): ColorHsl {
    return ColorHsl.fromRgb(this)
  }

  /**
   * @param {number} a new alpha amount
   * @returns {ColorRgb}
   */
  opacify(a: number): ColorRgb {
    return new ColorRgb(this.r, this.g, this.b, a)
  }
}

export function rgb(
  r: ClosedInterval<0, 1>,
  g: ClosedInterval<0, 1>,
  b: ClosedInterval<0, 1>,
  a: ClosedInterval<0, 1> = 1,
): ColorRgb {
  return new ColorRgb(r, g, b, a)
}

import { warnWithDefault } from '../internal.js'
import type { ColorFormat } from '../types.js'
import { ClosedInterval } from '../types.js'
import { clamp } from '../util.js'
import { ColorRgb } from './rgb.js'

export class ColorHsl {
  h: ClosedInterval<0, 360>
  s: ClosedInterval<0, 1>
  l: ClosedInterval<0, 1>
  a: ClosedInterval<0, 1>

  constructor(
    hue: ClosedInterval<0, 360>,
    saturation: ClosedInterval<0, 1>,
    luminocity: ClosedInterval<0, 1>,
    alpha: ClosedInterval<0, 1> = 1,
  ) {
    this.h =
      hue > 360 || hue < 0
        ? warnWithDefault(`clamping h '${hue}' to [0, 360]`, clamp(0, 360, hue))
        : hue
    this.s =
      saturation > 1 || saturation < 0
        ? warnWithDefault(
            `clamping s '${saturation}' to [0, 1]`,
            clamp(0, 1, saturation),
          )
        : saturation
    this.l =
      luminocity > 1 || luminocity < 0
        ? warnWithDefault(
            `clamping l '${luminocity}' to [0, 1]`,
            clamp(0, 1, luminocity),
          )
        : luminocity
    this.a =
      alpha > 1 || alpha < 0
        ? warnWithDefault(`clamping a '${alpha}' to [0, 1]`, clamp(0, 1, alpha))
        : alpha
    return
  }

  /**
   * Converts a ColorRgb to ColorHsl.
   * Thank you OPENRNDR: https://github.com/openrndr/openrndr/blob/71f233075e01ced7670963194e8730bc5c35c67c/openrndr-color/src/commonMain/kotlin/org/openrndr/color/ColorHSLa.kt#L28
   * And SO: https://stackoverflow.com/questions/39118528/rgb-to-hsl-conversion
   * @param {ColorRgb} rgb
   * @returns {ColorHsl}
   */
  static fromRgb(rgb: ColorRgb): ColorHsl {
    const min = Math.min(rgb.r, rgb.g, rgb.b)
    const max = Math.max(rgb.r, rgb.g, rgb.b)
    const component = max === rgb.r ? 'r' : max === rgb.g ? 'g' : 'b'

    // In the case r == g == b
    if (min === max) {
      return new ColorHsl(0, 0, max, rgb.a)
    }
    const delta = max - min
    const l = (max + min) / 2
    const s = delta / (1 - Math.abs(2 * l - 1))
    // cheap pattern matching ¯\_(ツ)_/¯
    const componentHueMap: Record<string, number> = {
      r: (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0),
      g: (rgb.b - rgb.r) / delta + 2,
      b: (rgb.r - rgb.g) / delta + 4,
    }
    const h =
      60 *
      (componentHueMap[component] ??
        warnWithDefault(
          `Unable to successfully convert value ${rgb} to HSL space. Defaulting hue to 0.`,
          0,
        ))
    return new ColorHsl(h, s, l, rgb.a)
  }

  /**
   * @returns {ColorRgb}
   */
  toRgb(): ColorRgb {
    if (this.s === 0.0) {
      return new ColorRgb(this.l, this.l, this.l, this.a)
    }
    const q =
      this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s
    const p = 2 * this.l - q
    const r = hue2rgb(p, q, this.h / 360.0 + 1.0 / 3)
    const g = hue2rgb(p, q, this.h / 360.0)
    const b = hue2rgb(p, q, this.h / 360.0 - 1.0 / 3)
    return new ColorRgb(r, g, b, this.a)
  }

  toString(colorFormat: ColorFormat = 'hsl'): string {
    switch (colorFormat) {
      case 'hex':
        return this.toHex()
      case 'rgb':
        return this.toRgb().toString('rgb')
      default:
        return `hsl(${this.h}, ${this.s * 100}%, ${this.l * 100}%, ${this.a})`
    }
  }

  /**
   * Mix two colors together.
   * This is very homespun, I imagine there are optimizations available
   * @param {ColorHsl} other
   * @param {number} [mix=0.5] The mix of colors. When 0, returns `this`. When 1, returns `other`
   * @returns {ColorHsl}
   */
  mix(other: ColorHsl, mix = 0.5): ColorHsl {
    const h = mixColorComponent(this.h, other.h, mix)
    const s = lerp(this.s, other.s, mix)
    const l = lerp(this.l, other.l, mix)
    const a = lerp(this.a, other.a, mix)
    return new ColorHsl(h, s, l, a)
  }

  /**
   * @returns {string} hex representation of the color
   */
  toHex(): string {
    return this.toRgb().toHex()
  }

  /**
   * @param {number} a new alpha amount
   * @returns {ColorHsl}
   */
  opacify(a: number): ColorHsl {
    return new ColorHsl(this.h, this.s, this.l, a)
  }
}

/**
 * @param {number} h hue, in range [0, 360]
 * @param {number} s saturation, in range [0, 1]
 * @param {number} l luminocity, in range [0, 1]
 * @param {number} [a=1] alpha, in range [0, 1]
 * @returns {ColorHsl} color in hsl format
 */
export function hsl(h: number, s: number, l: number, a = 1): ColorHsl {
  return new ColorHsl(h, s, l, a)
}

/**
 * Mixes two color components (in range [0, 1]) using linear interpolation.
 * Color components mix in an interesting way because the values cycle,
 * i.e. 0.001 is "close" to 0.999 on a color wheel.
 * @param {number} a in range [0, 1]
 * @param {number} b in range [0, 1]
 * @param {number} mix in range [0, 1]. When 0, returns `a`. When 1, returns `b`.
 * @returns {number}
 */
export function mixColorComponent(a: number, b: number, mix: number): number {
  const aVal = a < b && b - a > 180 ? a + 360 : a
  const bVal = b < a && a - b > 180 ? b + 360 : b
  const aPct = 1 - mix
  const bPct = mix
  const result = aVal * aPct + bVal * bPct
  return result > 360 ? result - 360 : result < 0 ? result + 360 : result
}

// this should probably go in a utility file
function lerp(
  a: ClosedInterval<0, 1>,
  b: ClosedInterval<0, 1>,
  mix: ClosedInterval<0, 1>,
): number {
  const aPct = 1 - mix
  const bPct = mix
  const result = a * aPct + b * bPct
  return result
}

/**
 * Honestly not sure what this does
 * https://github.com/openrndr/openrndr/blob/71f233075e01ced7670963194e8730bc5c35c67c/openrndr-color/src/commonMain/kotlin/org/openrndr/color/ColorHSLa.kt#L123C10-L130C2
 */
function hue2rgb(p: number, q: number, ut: number): number {
  let t = ut
  while (t < 0) t += 1.0
  while (t > 1) t -= 1.0
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t
  if (t < 1.0 / 2.0) return q
  return t < 2.0 / 3.0 ? p + (q - p) * (2.0 / 3.0 - t) * 6.0 : p
}

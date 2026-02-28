import { ColorHsl } from '../color/hsl.js'
import { ColorRgb } from '../color/rgb.js'
import { toFixedPrecision } from '../math.js'
import type { ColorFormat } from '../types.js'
import { pickBy } from '../util.js'
import { LinearGradient } from './linear-gradient.js'

export type SvgColor =
  | 'none'
  | string
  | null
  | ColorRgb
  | ColorHsl
  | LinearGradient

export type CommonAttributes = {
  stroke?: SvgColor
  fill?: SvgColor
  strokeWidth?: number
  id?: string
  class?: string
  style?: string
  [key: string]: unknown
}

export class Tag {
  tagName: string
  attributes: Record<string, any>
  children: Tag[]
  /**
   * When < Infinity, will drop decimal values beyond this precision.
   * For example, when numericPrecision = 3, 12.34567 will be rounded to 12.345
   * @type {number}
   */
  numericPrecision: number = Infinity

  #colorFormat: ColorFormat | undefined

  /**
   * The color format for the tag. When undefined, colors use their native format
   * (ColorRgb → rgb, ColorHsl → hsl).
   * When set to 'hex' | 'hsl' | 'rgb', all colors are rendered in that format.
   */
  get colorFormat(): ColorFormat | undefined {
    return this.#colorFormat
  }

  set colorFormat(value: ColorFormat | undefined) {
    this.#colorFormat = value
  }

  /**
   * @param {string} tagName
   * @param {Record<string, unknown>} attributes
   */
  constructor(tagName: string, attributes: Record<string, unknown> = {}) {
    this.tagName = tagName
    this.attributes = attributes
    /** @type {Array<Tag>} */
    this.children = []
  }

  /**
   * @param {Record<string, unknown>} attributes
   */
  setAttributes(attributes: Record<string, unknown>): void {
    this.attributes = {
      ...this.attributes,
      ...attributes,
    }
  }

  set fill(value: SvgColor) {
    const fill = value === null ? 'none' : value
    this.setAttributes({ fill })
  }

  set stroke(value: SvgColor) {
    const stroke = value === null ? 'none' : value
    this.setAttributes({ stroke })
  }

  set strokeWidth(value: number) {
    this.setAttributes({ 'stroke-width': value })
  }

  /**
   * @param {*} value
   * @param {*} key
   * @returns {boolean}
   */
  #visualAttributesTestFn(value: unknown, key: string): boolean {
    return (
      ['fill', 'stroke', 'stroke-width', 'strokeWidth'].includes(key) &&
      value !== undefined
    )
  }

  /**
   * @protected
   * Returns an object containing the core "visual styles" that should be inherited
   * as children are added to the document.
   * @returns {Record<string, unknown>}
   */
  visualAttributes(): Record<string, unknown> {
    return pickBy(this.#visualAttributesTestFn, {
      fill: this.attributes.fill,
      stroke: this.attributes.stroke,
      strokeWidth:
        this.attributes['stroke-width'] || this.attributes.strokeWidth,
    })
  }

  /**
   * @protected
   * Sets visual attributes on the current tag, favoring any values that have been set explicitly
   * @param {Record<string, unknown>} incoming
   * @returns {void}
   */
  setVisualAttributes(incoming: Record<string, unknown> = {}): void {
    const normalized = (obj: Record<string, unknown>) => {
      const result = { ...obj }
      if ('strokeWidth' in result && result.strokeWidth !== undefined) {
        result['stroke-width'] = result.strokeWidth
        // biome-ignore lint/performance/noDelete: normalize strokeWidth to stroke-width for consistent attribute storage
        delete result.strokeWidth
      }
      return result
    }
    this.setAttributes({
      ...normalized(pickBy(this.#visualAttributesTestFn, incoming)),
      ...normalized(this.visualAttributes()),
    })
  }

  /**
   * @protected
   * @param {Tag} child
   */
  addChild(child: Tag): Tag {
    child.setVisualAttributes(this.visualAttributes())
    // Future enhancement: There should be a more generalized concept of "inheritable attributes".
    // The idea here is if the parent's precision has never been set, then use the child's precision, else use the parent's precision.
    child.numericPrecision =
      this.numericPrecision === Infinity
        ? child.numericPrecision
        : this.numericPrecision
    child.colorFormat = this.#colorFormat
    this.children.push(child)
    return child
  }

  #formatAttributes(): string {
    return Object.entries(pickBy((v) => v !== undefined, this.attributes))
      .map(([key, value]) => {
        const normalizeKey = this.#normalizeKey(key)
        if (typeof value === 'number') {
          return `${normalizeKey}="${toFixedPrecision(
            value,
            this.numericPrecision,
          )}"`
        }
        if (value instanceof ColorRgb || value instanceof ColorHsl) {
          return `${normalizeKey}="${value.toString(this.#colorFormat)}"`
        }
        return `${normalizeKey}="${value}"`
      })
      .join(' ')
  }

  #normalizeKey(key: string): string {
    // These are keys which may be camelCased in the lib, but should be kebab-cased in the SVG output.
    const kebabCaseKeys = new Set([
      'strokeWidth',
      'strokeLinecap',
      'strokeLinejoin',
      'strokeMiterlimit',
      'strokeDasharray',
      'strokeDashoffset',
      'fillOpacity',
      'strokeOpacity',
      'stopColor',
      'stopOpacity',
      'clipPath',
      'clipRule',
      'colorInterpolation',
      'colorInterpolationFilters',
      'fontFamily',
      'fontSize',
    ])

    if (kebabCaseKeys.has(key)) {
      return key.replace(/([A-Z])/g, '-$1').toLowerCase()
    }
    return key
  }

  /**
   * @returns {string}
   */
  render(): string {
    // this would be much more elegant as `this.attributes.fill instanceof LinearGradient`,
    // but doing so would result in a circular dependency that I don't want to resolve
    // with additional abstractions
    if (
      this.attributes.fill instanceof Tag &&
      this.attributes.fill.tagName === 'linearGradient' &&
      'id' in this.attributes.fill
    ) {
      this.attributes.fill = `url(#${this.attributes.fill.id})`
    }
    if (
      this.attributes.stroke instanceof Tag &&
      this.attributes.stroke.tagName === 'linearGradient' &&
      'id' in this.attributes.stroke
    ) {
      this.attributes.stroke = `url(#${this.attributes.stroke.id})`
    }
    return [
      `<${this.tagName} ${this.#formatAttributes()}>`,
      this.children.map((child) => child.render()).join(''),
      `</${this.tagName}>`,
    ].join('')
  }
}

/**
 * @param {string} tagName
 * @param {(tag: Tag) => void} builder
 * @returns {Tag}
 */
export function tag(tagName: string, builder: (tag: Tag) => void): Tag {
  const t = new Tag(tagName)
  builder(t)
  return t
}

import { ColorHsl } from '../color/hsl.js'
import { ColorRgb } from '../color/rgb.js'
import { toFixedPrecision } from '../math.js'
import { pickBy } from '../util.js'
import { LinearGradient } from './linear-gradient.js'

export type SvgColor =
  | 'none'
  | string
  | null
  | ColorRgb
  | ColorHsl
  | LinearGradient

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
      ['fill', 'stroke', 'stroke-width'].includes(key) && value !== undefined
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
      'stroke-width': this.attributes['stroke-width'],
    })
  }

  /**
   * @protected
   * Sets visual attributes on the current tag, favoring any values that have been set explicitly
   * @param {Record<string, unknown>} incoming
   * @returns {void}
   */
  setVisualAttributes(incoming: Record<string, unknown> = {}): void {
    this.setAttributes({
      ...pickBy(this.#visualAttributesTestFn, incoming),
      ...this.visualAttributes(),
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
    this.children.push(child)
    return child
  }

  #formatAttributes(): string {
    return Object.entries(pickBy((v) => v !== undefined, this.attributes))
      .map(([key, value]) => {
        if (typeof value === 'number') {
          return `${key}="${toFixedPrecision(value, this.numericPrecision)}"`
        }
        return `${key}="${value}"`
      })
      .join(' ')
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

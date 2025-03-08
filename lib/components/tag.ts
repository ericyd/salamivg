import { toFixedPrecision } from '../math'
import { pickBy } from '../util'
/** @typedef {import('./linear-gradient').LinearGradient} tag.LinearGradient */
/** @typedef {import('../color/rgb').ColorRgb} tag.ColorRgb */
/** @typedef {import('../color/hsl').ColorHsl} tag.ColorHsl */
/** @typedef {'none' | string | null | tag.ColorRgb | tag.ColorHsl | tag.LinearGradient} SvgColor */

/**
 * @property {string} tagName
 * @property {object} attributes
 * @property {Array<Tag>} children
 */
export class Tag {
  /**
   * When < Infinity, will drop decimal values beyond this precision.
   * For example, when numericPrecision = 3, 12.34567 will be rounded to 12.345
   * @type {number}
   */
  numericPrecision = Infinity

  /**
   * @param {string} tagName
   * @param {Record<string, unknown>} attributes
   */
  constructor(tagName, attributes = {}) {
    this.tagName = tagName
    this.attributes = attributes
    /** @type {Array<Tag>} */
    this.children = []
  }

  /**
   * @param {Record<string, unknown>} attributes
   */
  setAttributes(attributes) {
    this.attributes = {
      ...this.attributes,
      ...attributes,
    }
  }

  /** @param {SvgColor} value */
  set fill(value) {
    const fill = value === null ? 'none' : value
    this.setAttributes({ fill })
  }

  /** @param {SvgColor} value */
  set stroke(value) {
    const stroke = value === null ? 'none' : value
    this.setAttributes({ stroke })
  }

  /** @param {number} value */
  set strokeWidth(value) {
    this.setAttributes({ 'stroke-width': value })
  }

  /**
   * @param {*} value
   * @param {*} key
   * @returns {boolean}
   */
  #visualAttributesTestFn(value, key) {
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
  visualAttributes() {
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
  setVisualAttributes(incoming = {}) {
    this.setAttributes({
      ...pickBy(this.#visualAttributesTestFn, incoming),
      ...this.visualAttributes(),
    })
  }

  /**
   * @protected
   * @param {Tag} child
   */
  addChild(child) {
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

  #formatAttributes() {
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
  render() {
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
export function tag(tagName, builder) {
  const t = new Tag(tagName)
  builder(t)
  return t
}

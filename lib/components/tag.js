import { pickBy } from '../util.js'

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

  // TODO: consider using a Proxy to set aribtrary attributes using camelCase kebab-case transitions
  /** @param {'none' | string | null} value */
  set fill(value) {
    const fill = value === null ? 'none' : value
    this.setAttributes({ fill })
  }

  /** @param {'none' | string | null} value */
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
    // TODO: I don't really like this pattern, but it's quick-n-dirty. There should be a more generalized concept of "inheritable attributes".
    // The idea here is if the parent's precision has never been set, then just use the child's precision. Otherwise, use the parent's precision.
    child.numericPrecision = this.numericPrecision === Infinity ? child.numericPrecision : this.numericPrecision
    this.children.push(child)
    return child
  }

  #formatAttributes() {
    return Object.entries(this.attributes)
      .map(([key, value]) => {
        if (typeof value === 'number' && this.numericPrecision < Infinity && this.numericPrecision >= 0) {
          const rounded = Math.round(value * 10 ** this.numericPrecision) / 10 ** this.numericPrecision
          return `${key}="${rounded}"`
        }
        return `${key}="${value}"`
      })
      .join(' ')
  }

  /**
   * @returns {string}
   */
  render() {
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

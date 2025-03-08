import { Tag } from './tag.js'

/**
 * @typedef {object} LayerAttributes
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [width=1]
 * @property {number} [height=1]
 */

/**
 * @class Layer
 * @example
 *   const r = g(g => {
 *     g.fill = '#000'
 *     g.stroke = '#055'
 *     g.x = 1
 *     g.y = 10
 *     g.width = 100
 *     g.height = 15
 *   })
 * @example
 *   const r = rect({ x: 1, y: 10, width: 100, height: 15, borderRadius: 1.4 })
 * @extends Tag
 */
export class Layer extends Tag {
  /**
   * @param {LayerAttributes} [attributes={}]
   */
  constructor({ x = 0, y = 0, width = 1, height = 1, ...attributes } = {}) {
    super('g', {
      x,
      y,
      width,
      height,
      ...attributes,
    })
  }
}

/**
 * @overload
 * @param {LayerAttributes} attrsOrBuilderOrX
 * @returns {Layer}
 */
/**
 * @overload
 * @param {number} attrsOrBuilderOrX
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {Layer}
 */
/**
 * @overload
 * @param {(rect: Layer) => void} attrsOrBuilderOrX
 * @returns {Layer}
 */
/**
 * @param {LayerAttributes | number | ((rect: Layer) => void)} attrsOrBuilderOrX
 * @param {number} [y]
 * @param {number} [width]
 * @param {number} [height]
 */
export function g(attrsOrBuilderOrX, y, width, height) {
  if (typeof attrsOrBuilderOrX === 'function') {
    const c = new Layer()
    attrsOrBuilderOrX(c)
    return c
  }
  if (typeof attrsOrBuilderOrX === 'object') {
    return new Layer(attrsOrBuilderOrX)
  }
  if (
    typeof attrsOrBuilderOrX === 'number' &&
    (typeof y === 'number' || y === undefined) &&
    (typeof width === 'number' || width === undefined) &&
    (typeof height === 'number' || height === undefined)
  ) {
    return new Layer({ x: attrsOrBuilderOrX, y, width, height })
  }
  throw new Error(
    `Unable to construct circle from "${attrsOrBuilderOrX}, ${y}, ${width}, ${height}"`,
  )
}

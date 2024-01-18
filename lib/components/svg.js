import { Tag } from './tag.js'
import { Circle, circle } from './circle.js'
import { Path, path } from './path.js'
import { Rectangle, rect } from './rectangle.js'
import { Polyline, LineSegment, polyline } from './polyline.js'
import { Polygon } from './polygon.js'
import { LinearGradient } from './linear-gradient.js'
import { Defs } from './defs.js'
import { Vector2, vec2 } from '../vector2.js'

/**
 * @typedef {object} SvgAttributes
 * @property {number} [width=100]
 * @property {number} [height=100]
 * @property {number} [scale=1] Allows the resulting SVG to have larger dimensions, which still keeping the viewBox the same as the `width` and `height` attributes
 * @property {string} [viewBox] Defaults to `0 0 width height`
 * @property {string} [preserveAspectRatio] Defaults to `xMidYMid meet`
 */

/**
 * @class Svg
 * @description The root of any SVG document.
 * Although you can construct this class manually, it's much nicer to the the `svg` builder function,
 * or the `renderSvg` function if you're running this locally or on a server.
 * @example
 * ```js
 * import { svg, vec2 } from '@salamivg/core'
 *
 * const document = svg({ width: 100, height: 100, scale: 5 }, (doc) => {
 *   doc.fill = null
 *   doc.strokeWidth = 1
 *   doc.path((p) => {
 *     p.fill = '#ab9342'
 *     p.stroke = '#000'
 *     p.strokeWidth = 2
 *     p.moveTo(vec2(0, 0))
 *     p.lineTo(vec2(doc.width, doc.height))
 *     p.lineTo(vec2(doc.width, 0))
 *     p.close()
 *   })
 * })
 *
 * console.log(document.render())
 * ```
 */
export class Svg extends Tag {
  /** @type {LinearGradient[]} */
  #defs = []

  /**
   * @param {SvgAttributes} [attributes={}]
   */
  constructor({ width = 100, height = 100, scale = 1, ...attributes } = {}) {
    super('svg', {
      viewBox: attributes.viewBox ?? `0 0 ${width} ${height}`,
      preserveAspectRatio: attributes.preserveAspectRatio ?? 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      width: width * scale,
      height: height * scale,
      ...attributes,
    })
    this.width = width
    this.height = height
    /** @type {Record<string, string | number> | null} */
    this.filenameMetadata = null
  }

  /** @type {Vector2} */
  get center() {
    return vec2(this.width / 2, this.height / 2)
  }

  // TODO@v1: find a more generic way of expressing this "instance or builder" pattern
  /**
   * @param {Path | ((path: Path) => void)} instanceOrBuilder
   */
  path(instanceOrBuilder) {
    return instanceOrBuilder instanceof Path
      ? this.addChild(instanceOrBuilder)
      : this.addChild(path(instanceOrBuilder))
  }

  /**
   * @param {Path[]} ps
   */
  paths(ps) {
    for (const p of ps) {
      this.path(p)
    }
  }

  /**
   * @param {LineSegment} lineSegment
   */
  lineSegment(lineSegment) {
    return this.addChild(lineSegment)
  }

  /**
   * @param {LineSegment[]} ls
   */
  lineSegments(ls) {
    for (const l of ls) {
      this.lineSegment(l)
    }
  }

  /**
   * TODO@v1: "or builder" can be anything accepted by the "circle" helper
   * TODO@v1: add overload type defs
   * @param {Circle | ((circle: Circle) => void)} instanceOrBuilder
   */
  circle(instanceOrBuilder) {
    return instanceOrBuilder instanceof Circle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(circle(instanceOrBuilder))
  }

  /**
   * @param {Circle[]} cs
   */
  circles(cs) {
    for (const c of cs) {
      this.circle(c)
    }
  }

  /**
   * @param {Rectangle | ((rect: Rectangle) => void)} instanceOrBuilder
   */
  rect(instanceOrBuilder) {
    return instanceOrBuilder instanceof Rectangle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(rect(instanceOrBuilder))
  }

  /**
   * @param {Rectangle[]} rs
   */
  rects(rs) {
    for (const r of rs) {
      this.rect(r)
    }
  }

  /**
   * @param {Polygon | import('./polygon.js').PolygonAttributes} instanceOrBuilder
   */
  polygon(instanceOrBuilder) {
    return instanceOrBuilder instanceof Polygon
      ? this.addChild(instanceOrBuilder)
      : this.addChild(new Polygon(instanceOrBuilder))
  }

  /**
   * @param {Array<Polygon | import('./polygon.js').PolygonAttributes>} ps
   */
  polygons(ps) {
    for (const p of ps) {
      this.polygon(p)
    }
  }

  /**
   * @param {Polyline | ((poly: Polyline) => void)} instanceOrBuilder
   */
  polyline(instanceOrBuilder) {
    return instanceOrBuilder instanceof Polyline
      ? this.addChild(instanceOrBuilder)
      : this.addChild(polyline(instanceOrBuilder))
  }

  /**
   * @param {Polyline[]} ps
   */
  polylines(ps) {
    for (const p of ps) {
      this.polyline(p)
    }
  }

  /**
   * Generates filename metadata when running in a render loop
   * @returns {string}
   */
  formatFilenameMetadata() {
    return Object.entries(this.filenameMetadata ?? {})
      .map(([key, value]) => `${key}-${value}`)
      .join('-')
  }

  /**
   * @param {import('./tag.js').SvgColor} color
   */
  setBackground(color) {
    const rect = new Rectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    })
    rect.stroke = null
    rect.fill = color
    this.children.unshift(rect)
  }

  /**
   * @example
   * const gradient = svg.defineLinearGradient({ colors: ['#444', '#678', '#8fe'] })
   * svg.circle(circle({ x: 0, y: 0, radius: 10, fill: gradient }))
   * @param {Omit<import('./linear-gradient.js').LinearGradientAttributes, 'id' | 'numericPrecision'>} props
   */
  defineLinearGradient(props) {
    const grad = new LinearGradient({
      ...props,
      numericPrecision: this.numericPrecision,
    })
    this.#defs.push(grad)
    return grad
  }

  /**
   * @returns {string}
   */
  render() {
    if (this.#defs.length > 0) {
      const defs = new Defs()
      for (const def of this.#defs) {
        defs.addDefinition(def)
      }
      this.children.unshift(defs)
    }
    return super.render()
  }
}

/**
 * @callback SvgBuilder
 * @param {Svg} svg
 * @returns {void | SvgBuilderPostLoop}
 */

/**
 * @callback SvgBuilderPostLoop
 * @description A callback which will be run after ever render loop.
 * Useful to trigger side-effects like setting up new values for global variables such as seeds.
 * Similar to a "cleanup" function returned from React's useEffect hook.
 * @returns {void}
 */

/**
 * @param {SvgAttributes} attributes
 * @param {SvgBuilder} builder
 */
export function svg(attributes, builder) {
  const s = new Svg(attributes)
  builder(s)
  return s
}

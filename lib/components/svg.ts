import { CommonAttributes, SvgColor, Tag } from './tag.js'
import { Circle, circle } from './circle.js'
import { Path, path } from './path.js'
import { Rectangle, rect } from './rectangle.js'
import { Polyline, LineSegment, polyline } from './polyline.js'
import { polygon, Polygon } from './polygon.js'
import { Layer, layer } from './layer.js'
import { LinearGradient, LinearGradientAttributes } from './linear-gradient.js'
import { Defs } from './defs.js'
import { Vector2, vec2 } from '../vector2.js'

export type SvgAttributes = CommonAttributes & {
  /**
   * @default 100
   */
  width?: number
  /**
   * @default 100
   */
  height?: number
  /**
   * Allows the resulting SVG to have larger dimensions, which still keeping the viewBox the same as the `width` and `height` attributes
   * @default 1
   */
  scale?: number
  /**
   * @default '0 0 width height'
   */
  viewBox?: string
  /**
   * @default 'xMidYMid meet'
   */
  preserveAspectRatio?: string
}

/**
 * The root of any SVG document.
 * Although you can construct this class manually, it's much nicer to the the `svg` builder function,
 * or the `renderSvg` function if you're running this locally or on a server.
 *
 * @example
 * import { svg, vec2 } from '@salamivg/core'
 *
 * const document = svg({ width: 100, height: 100, scale: 5 }, (doc) => {
 *   doc.fill = null;
 *   doc.strokeWidth = 1;
 *   doc.path((p) => {
 *     p.fill = '#ab9342';
 *     p.stroke = '#000';
 *     p.strokeWidth = 2;
 *     p.moveTo(vec2(0, 0));
 *     p.lineTo(vec2(doc.width, doc.height));
 *     p.lineTo(vec2(doc.width, 0));
 *     p.close();
 *   });
 * });
 *
 * console.log(document.render());
 */
export class Svg extends Tag {
  #defs: LinearGradient[] = []
  width: number
  height: number
  filenameMetadata: Record<string, string> | null

  constructor({
    width = 100,
    height = 100,
    scale = 1,
    ...attributes
  }: SvgAttributes = {}) {
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
    this.filenameMetadata = null
  }

  get center(): Vector2 {
    return vec2(this.width / 2, this.height / 2)
  }

  path(instanceOrBuilder: Path | ((path: Path) => void)): Tag {
    return instanceOrBuilder instanceof Path
      ? this.addChild(instanceOrBuilder)
      : this.addChild(path(instanceOrBuilder))
  }

  paths(ps: Path[]): void {
    for (const p of ps) {
      this.path(p)
    }
  }

  lineSegment(lineSegment: LineSegment): Tag {
    return this.addChild(lineSegment)
  }

  lineSegments(ls: LineSegment[]): void {
    for (const l of ls) {
      this.lineSegment(l)
    }
  }

  circle(instanceOrBuilder: Circle | ((circle: Circle) => void)): Tag {
    return instanceOrBuilder instanceof Circle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(circle(instanceOrBuilder))
  }

  circles(cs: Circle[]): void {
    for (const c of cs) {
      this.circle(c)
    }
  }

  rect(instanceOrBuilder: Rectangle | ((rect: Rectangle) => void)): Tag {
    return instanceOrBuilder instanceof Rectangle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(rect(instanceOrBuilder))
  }

  rects(rs: Rectangle[]): void {
    for (const r of rs) {
      this.rect(r)
    }
  }

  polygon(instanceOrBuilder: Polygon | ((polygon: Polygon) => void)): Tag {
    return instanceOrBuilder instanceof Polygon
      ? this.addChild(instanceOrBuilder)
      : this.addChild(polygon(instanceOrBuilder))
  }

  polygons(ps: Array<Polygon | ((polygon: Polygon) => void)>): void {
    for (const p of ps) {
      this.polygon(p)
    }
  }

  polyline(instanceOrBuilder: Polyline | ((polyline: Polyline) => void)): Tag {
    return instanceOrBuilder instanceof Polyline
      ? this.addChild(instanceOrBuilder)
      : this.addChild(polyline(instanceOrBuilder))
  }

  layer(instanceOrBuilder: Layer | ((layer: Layer) => void)): Tag {
    return instanceOrBuilder instanceof Layer
      ? this.addChild(instanceOrBuilder)
      : this.addChild(layer(instanceOrBuilder))
  }

  polylines(ps: Polyline[]): void {
    for (const p of ps) {
      this.polyline(p)
    }
  }

  formatFilenameMetadata(): string {
    return Object.entries(this.filenameMetadata ?? {})
      .map(([key, value]) => `${key}-${value}`)
      .join('-')
  }

  setBackground(color: SvgColor): void {
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

  defineLinearGradient(
    props: Omit<LinearGradientAttributes, 'id' | 'numericPrecision'>,
  ): LinearGradient {
    const grad = new LinearGradient({
      ...props,
      numericPrecision: this.numericPrecision,
    })
    this.#defs.push(grad)
    return grad
  }

  contains(point: Vector2): boolean {
    if (
      typeof this.attributes.viewBox !== 'string' ||
      !this.attributes.viewBox.startsWith('0 0')
    ) {
      console.warn(
        `Svg#contains is only guaranteed to work when the viewBox starts with "0 0". Current viewbox is ${this.attributes.viewBox}`,
      )
    }
    return (
      point.x >= 0 &&
      point.x <= this.width &&
      point.y >= 0 &&
      point.y <= this.height
    )
  }

  render(): string {
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

export type SvgBuilder = (svg: Svg) => undefined | SvgBuilderPostLoop

export type SvgBuilderPostLoop = () => void

/**
 * @param {SvgAttributes} attributes
 * @param {SvgBuilder} builder
 */
export function svg(attributes: SvgAttributes, builder: SvgBuilder): Svg {
  const s = new Svg(attributes)
  builder(s)
  return s
}

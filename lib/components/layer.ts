import { CommonAttributes, Tag } from './tag.js'
import { Circle, circle } from './circle.js'
import { Path, path } from './path.js'
import { Rectangle, rect } from './rectangle.js'
import { Polyline, LineSegment, polyline } from './polyline.js'
import { polygon, Polygon } from './polygon.js'

/**
 * An SVG group (`<g>`) element for organizing elements into layers.
 * Supports the builder pattern via the `layer()` function.
 *
 * @example
 * svg({ width: 100, height: 100 }, (doc) => {
 *   doc.layer((l) => {
 *     l.fill = '#333';
 *     l.path((p) => {
 *       p.moveTo(vec2(0, 0));
 *       p.lineTo(vec2(100, 100));
 *     });
 *     l.circle((c) => {
 *       c.center = doc.center;
 *       c.radius = 10;
 *     });
 *   });
 * });
 */
export type LayerAttributes = CommonAttributes & Record<string, unknown>

export class Layer extends Tag {
  constructor(attributes: LayerAttributes = {}) {
    super('g', attributes)
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

  polylines(ps: Polyline[]): void {
    for (const p of ps) {
      this.polyline(p)
    }
  }

  layer(instanceOrBuilder: Layer | ((layer: Layer) => void)): Tag {
    return instanceOrBuilder instanceof Layer
      ? this.addChild(instanceOrBuilder)
      : this.addChild(layer(instanceOrBuilder))
  }
}

/**
 * Creates an SVG group (`<g>`) element using a builder callback.
 *
 * @param builder Callback that receives the layer for building content
 * @returns The built Layer
 */
export function layer(builder: (layer: Layer) => void): Layer {
  const l = new Layer()
  builder(l)
  return l
}

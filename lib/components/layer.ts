import { CommonAttributes, Tag } from './tag.js'
import { Circle, circle } from './circle.js'
import { Path, path } from './path.js'
import { Rectangle, rect } from './rectangle.js'
import { Polyline, LineSegment, polyline, lineSegment } from './polyline.js'
import { polygon, Polygon } from './polygon.js'
import { Vector2 } from '../vector2.js'
import { error } from '../internal.js'

/**
 * Base class for SVG elements that can contain shapes (paths, circles, etc.).
 * Provides the shared shape-adding API used by both Svg and Layer.
 * Svg is the source of truth for method signatures and behavior.
 */
export abstract class ShapeContainer extends Tag {
  path(instanceOrBuilder: Path | Parameters<typeof path>[0]): Tag {
    return instanceOrBuilder instanceof Path
      ? this.addChild(instanceOrBuilder)
      : this.addChild(path(instanceOrBuilder))
  }

  paths(ps: Path[]): void {
    for (const p of ps) {
      this.path(p)
    }
  }

  lineSegment(start: Vector2, end: Vector2): Tag
  lineSegment(segment: LineSegment): Tag
  lineSegment(segment: LineSegment | Vector2, end?: Vector2): Tag {
    return segment instanceof LineSegment
      ? this.addChild(segment)
      : end
        ? this.addChild(lineSegment(segment, end))
        : error(
            'Invalid line segment, must be an instance of LineSegment or include both start and end points',
          )
  }

  lineSegments(ls: LineSegment[]): void {
    for (const l of ls) {
      this.lineSegment(l)
    }
  }

  circle(instanceOrBuilder: Circle | Parameters<typeof circle>[0]): Tag {
    return instanceOrBuilder instanceof Circle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(circle(instanceOrBuilder))
  }

  circles(cs: Circle[]): void {
    for (const c of cs) {
      this.circle(c)
    }
  }

  rect(instanceOrBuilder: Rectangle | Parameters<typeof rect>[0]): Tag {
    return instanceOrBuilder instanceof Rectangle
      ? this.addChild(instanceOrBuilder)
      : this.addChild(rect(instanceOrBuilder))
  }

  rects(rs: Rectangle[]): void {
    for (const r of rs) {
      this.rect(r)
    }
  }

  polygon(instanceOrBuilder: Polygon | Parameters<typeof polygon>[0]): Tag {
    return instanceOrBuilder instanceof Polygon
      ? this.addChild(instanceOrBuilder)
      : this.addChild(polygon(instanceOrBuilder))
  }

  polygons(ps: Array<Polygon | Parameters<typeof polygon>[0]>): void {
    for (const p of ps) {
      this.polygon(p)
    }
  }

  polyline(instanceOrBuilder: Polyline | Parameters<typeof polyline>[0]): Tag {
    return instanceOrBuilder instanceof Polyline
      ? this.addChild(instanceOrBuilder)
      : this.addChild(polyline(instanceOrBuilder))
  }

  polylines(ps: Polyline[]): void {
    for (const p of ps) {
      this.polyline(p)
    }
  }

  layer(instanceOrBuilder: Layer | Parameters<typeof layer>[0]): Tag {
    return instanceOrBuilder instanceof Layer
      ? this.addChild(instanceOrBuilder)
      : this.addChild(layer(instanceOrBuilder))
  }
}

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

export class Layer extends ShapeContainer {
  constructor(attributes: LayerAttributes = {}) {
    super('g', attributes)
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

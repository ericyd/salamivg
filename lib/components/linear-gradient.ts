import { type ColorStop } from '../color/color-sequence'
import { ColorHsl } from '../color/hsl'
import { ColorRgb } from '../color/rgb'
import { Vector2, vec2 } from '../vector2'
import { Tag } from './tag'

export type LinearGradientAttributes = {
  stops?: ColorStop[]
  colors?: Array<ColorRgb | ColorHsl | string>
  /**
   * @default new Vector2(0, 0)
   */
  start?: Vector2
  /**
   * @default new Vector2(0, 1)
   */
  end?: Vector2
  /**
   * @default Math.random().toString(16).replace(/^0\./, '')
   */
  id?: string
  /**
   * @default Infinity
   */
  numericPrecision?: number
}

export class LinearGradient extends Tag {
  constructor({
    stops,
    colors,
    start = vec2(0, 0),
    end = vec2(0, 1),
    id = Math.random().toString(16).replace(/^0\./, ''),
    numericPrecision = Infinity,
  }: LinearGradientAttributes = {}) {
    if ((stops?.length ?? 0) === 0 && (colors?.length ?? 0) === 0) {
      throw new Error(
        'Cannot create linear gradient without at least one stop or color',
      )
    }

    super('linearGradient', {
      x1: start.x,
      x2: end.x,
      y1: start.y,
      y2: end.y,
      id,
    })
    this.numericPrecision = numericPrecision
    const colorStops: [number, ColorHsl | ColorRgb][] =
      stops?.map(([num, color]) => [
        num,
        typeof color === 'string' ? ColorRgb.fromHex(color) : color,
      ]) ??
      colors?.map((color, i, array) => [
        (i / (array.length - 1)) * 100,
        typeof color === 'string' ? ColorRgb.fromHex(color) : color,
      ]) ??
      []
    this.children =
      colorStops?.map(
        (stop) => new LinearGradientStop(stop, this.numericPrecision),
      ) ?? []
  }

  get id(): string {
    return this.attributes.id
  }
}

class LinearGradientStop extends Tag {
  /** @param {ColorStop} stop */
  constructor(stop: ColorStop, numericPrecision = Infinity) {
    super('stop', {
      offset: stop[0],
      'stop-color': stop[1],
    })
    this.numericPrecision = numericPrecision
  }
}

import { error } from '../internal'
import { Vector2, vec2 } from '../vector2'

export type GridAttributes = {
  /**
   * the minimum x value (inclusive), when used as an iterator
   * @default 0
   */
  xMin?: number
  /**
   * the maximum x value (exclusive), when used as an iterator
   * @default 1
   */
  xMax?: number
  /**
   * the minimum y value (inclusive), when used as an iterator
   * @default 0
   */
  yMin?: number
  /**
   * the maximum y value (exclusive), when used as an iterator
   * @default 1
   */
  yMax?: number
  /**
   * the step size in the x direction
   * @default 1
   */
  xStep?: number
  /**
   * the step size in the x direction
   * @default 1
   */
  yStep?: number
  /**
   * the number of columnCount in the grid. This is more commonly defined when using the grid as a data store, but if `columnCount` is defined it will override `xMax` when used as an iterator.
   */
  columnCount?: number
  /**
   * the number of rowCount in the grid. This is more commonly defined when using the grid as a data store, but if `rowCount` is defined it will override `yMax` when used as an iterator.
   */
  rowCount?: number
  /**
   * order of the grid. This is rarely necessary to define, but since the internal representation of the grid is a 1-D array, this defines the layout of the cells.
   * @default 'row major'
   */
  order?: 'row major' | 'column major'
  /**
   * the value to fill the grid with. This is only used when the grid is used as a data store.
   */
  fill?: any
}

export class Grid<T = any> {
  #xMin: number
  #xMax: number
  #yMin: number
  #yMax: number
  #xStep: number
  #yStep: number
  #order: 'row major' | 'column major'
  #grid: T[]
  columnCount: number
  rowCount: number
  length: number

  constructor({
    xMin = 0,
    xMax = 1,
    yMin = 0,
    yMax = 1,
    xStep = 1,
    yStep = 1,
    order = 'row major',
    columnCount,
    rowCount,
    fill,
  }: GridAttributes = {}) {
    this.#xMin = xMin
    this.#xMax = columnCount ? this.#xMin + columnCount : xMax
    this.#yMin = yMin
    this.#yMax = rowCount ? this.#yMin + rowCount : yMax
    this.#xStep = xStep
    this.#yStep = yStep
    this.columnCount =
      columnCount ?? Math.ceil((this.#xMax - this.#xMin) / this.#xStep)
    this.rowCount =
      rowCount ?? Math.ceil((this.#yMax - this.#yMin) / this.#yStep)
    this.#grid = new Array(this.columnCount * this.rowCount)
    if (fill !== undefined) {
      this.#grid.fill(fill)
    }
    this.#order = order
    this.length = this.#grid.length
  }

  get xMin(): number {
    return this.#xMin
  }
  get xMax(): number {
    return this.#xMax
  }
  get yMin(): number {
    return this.#yMin
  }
  get yMax(): number {
    return this.#yMax
  }
  get xStep(): number {
    return this.#xStep
  }
  get yStep(): number {
    return this.#yStep
  }
  get order(): 'row major' | 'column major' {
    return this.#order
  }

  #index(x: Vector2 | number, y?: number): number {
    const [i, j] =
      x instanceof Vector2
        ? [Math.round(x.x / this.#xStep), Math.round(x.y / this.#yStep)]
        : y !== undefined
          ? [Math.round(x / this.#xStep), Math.round(y / this.#yStep)]
          : error(`invalid arguments ${x}, ${y}`)
    if (this.#order === 'row major') {
      return this.columnCount * j + i
    }
    return this.rowCount * i + j
  }

  get(x: Vector2 | number, y?: number): T {
    return this.#grid[this.#index(x, y)]
  }

  set(...args: [Vector2, any] | [number, number, any]): void {
    const [x, y, value] =
      args[0] instanceof Vector2 ? [args[0].x, args[0].y, args[1]] : args
    this.#grid[this.#index(x, y)] = value
  }

  *[Symbol.iterator](): Generator<[Vector2, any, number], void> {
    if (this.#order === 'row major') {
      for (let y = this.#yMin; y < this.#yMax; y += this.#yStep) {
        for (let x = this.#xMin; x < this.#xMax; x += this.#xStep) {
          yield [vec2(x, y), this.get(x, y), this.#index(x, y)]
        }
      }
    } else {
      for (let x = this.#xMin; x < this.#xMax; x += this.#xStep) {
        for (let y = this.#yMin; y < this.#yMax; y += this.#yStep) {
          yield [vec2(x, y), this.get(x, y), this.#index(x, y)]
        }
      }
    }
  }
}

export function grid(attributes: GridAttributes = {}): Grid {
  return new Grid(attributes)
}

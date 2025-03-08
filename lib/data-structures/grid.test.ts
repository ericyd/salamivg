import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Grid, grid } from './grid.js'
import { vec2 } from '../vector2.js'

describe('grid', () => {
  it('should return an instance of Grid', () => {
    const g = grid()
    assert(g instanceof Grid)
  })
})

/**
 * helper to simplify comparing vector2 outputs
 * @param {Grid} grid
 */
function gridToPojo(grid) {
  return [...grid].map(([{ x, y }]) => ({ x, y }))
}

describe('Grid', () => {
  describe('iterator', () => {
    it('should default to range x:[0, 1), y:[0, 1)', () => {
      const g = new Grid()
      const expected = [{ x: 0, y: 0 }]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should step x by xStep', () => {
      const g = new Grid({ xMax: 11, xStep: 5 })
      const expected = [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should step y by yStep', () => {
      const g = new Grid({ yMax: 11, yStep: 5 })
      const expected = [
        { x: 0, y: 0 },
        { x: 0, y: 5 },
        { x: 0, y: 10 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should yield x range of [xMin, xMax)', () => {
      const g = new Grid({ xMin: 2, xMax: 5 })
      const expected = [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should yield y range of [yMin, yMax)', () => {
      const g = new Grid({ yMin: 2, yMax: 5 })
      const expected = [
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('when columns is set, should yield x range of [xMin, xMin + columns)', () => {
      const g = new Grid({ xMin: 2, columnCount: 3 })
      const expected = [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('when rows is set, should yield y range of [yMin, yMin + rows)', () => {
      const g = new Grid({ yMin: 2, rowCount: 3 })
      const expected = [
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should yield in row major order by default', () => {
      const g = new Grid({ xMin: 2, xMax: 4, yMin: 2, yMax: 4 })
      const expected = [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should yield in column major order when specified in constructor', () => {
      const g = new Grid({
        xMin: 2,
        xMax: 4,
        yMin: 2,
        yMax: 4,
        order: 'column major',
      })
      const expected = [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
      ]
      const actual = gridToPojo(g)
      assert.deepStrictEqual(actual, expected)
    })

    it('should return correct indices when grid is constructed from non-square floats in row major order', () => {
      const g = new Grid({
        xMin: 0,
        xMax: 5,
        yMin: 0,
        yMax: 5,
        xStep: 1.48492424049175,
        yStep: 1.7146428199482247,
      })
      const indices = Array.from(g).map(([_, __, i]) => i)
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      assert.strictEqual(g.rowCount, 3)
      assert.strictEqual(g.columnCount, 4)
      assert.deepStrictEqual(indices, expected)
    })

    it('should return correct indices when grid is constructed from non-square floats in column major order', () => {
      const g = new Grid({
        xMin: 0,
        xMax: 5,
        yMin: 0,
        yMax: 5,
        xStep: 1.48492424049175,
        yStep: 1.7146428199482247,
        order: 'column major',
      })
      const indices = Array.from(g).map(([_, __, i]) => i)
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      assert.strictEqual(g.rowCount, 3)
      assert.strictEqual(g.columnCount, 4)
      assert.deepStrictEqual(indices, expected)
    })
  })

  it('should fill data store when fill is specified', () => {
    const g = new Grid({ fill: 'testeroo magoo' })
    const actual = g.get(0, 0)
    assert.strictEqual(actual, 'testeroo magoo')
  })

  it('should create data store of correct size when columns and rows are specified', () => {
    const g = new Grid({ columnCount: 10, rowCount: 10, fill: 'test' })
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        assert.strictEqual(
          g.get(i, j),
          'test',
          `grid.get(${i}, ${j}) is '${g.get(i, j)}', expected 'test'`,
        )
      }
    }
  })

  // This is a pretty confusing API, definitely not the recommended usage, but this is probably the least bad way to represent this.
  it('should create data store of correct size when xMin,xMax,yMin,yMax are specified', () => {
    const g = new Grid({ xMin: 10, xMax: 20, yMin: 15, yMax: 25, fill: 'test' })
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        assert.strictEqual(
          g.get(i, j),
          'test',
          `grid.get(${i}, ${j}) is '${g.get(i, j)}', expected 'test'`,
        )
      }
    }
  })

  it('should ignore xStep and yStep when creating data store', () => {
    const g = new Grid({
      columnCount: 10,
      rowCount: 10,
      xStep: 10,
      yStep: 10,
      fill: 'test',
    })
    assert.strictEqual(g.get(9, 9), 'test')
  })

  describe('.get', () => {
    it('should get values from discrete x/y args', () => {
      const g = new Grid({ columnCount: 10, rowCount: 10, fill: 'test' })
      assert.strictEqual(g.get(9, 9), 'test')
    })

    it('should get values from Vector2 arg', () => {
      const g = new Grid({ columnCount: 10, rowCount: 10, fill: 'test' })
      assert.strictEqual(g.get(vec2(9, 9)), 'test')
    })
  })

  describe('.set', () => {
    it('should set values from discrete x/y args', () => {
      const g = new Grid({ columnCount: 10, rowCount: 10, fill: 'test' })
      g.set(8, 8, 'test2')
      assert.strictEqual(g.get(8, 8), 'test2')
    })

    it('should set values from Vector2 arg', () => {
      const g = new Grid({ columnCount: 10, rowCount: 10, fill: 'test' })
      g.set(vec2(8, 8), 'test2')
      assert.strictEqual(g.get(8, 8), 'test2')
    })
  })
})

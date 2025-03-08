import { describe, it } from 'node:test'
import { Polygon } from './polygon.js'
import assert from 'node:assert'
import { vec2 } from '../vector2.js'

describe('Polygon', () => {
  describe('render', () => {
    it('formats `points` correctly', () => {
      const poly = new Polygon({ points: [vec2(0, 0), vec2(100, 100)] })
      const actual = poly.render()
      assert.strictEqual(actual, '<polygon points="0,0 100,100"></polygon>')
    })

    it('includes other properties', () => {
      const poly = new Polygon({
        points: [vec2(0, 0), vec2(100, 100)],
        fill: '#000',
        stroke: '#432',
      })
      const actual = poly.render()
      assert.strictEqual(
        actual,
        '<polygon fill="#000" stroke="#432" points="0,0 100,100"></polygon>',
      )
    })

    it('uses correct precision', () => {
      const poly = new Polygon({
        points: [vec2(0.1234, 0.1234), vec2(100.1234, 100.1234)],
      })
      poly.numericPrecision = 2
      const actual = poly.render()
      assert.strictEqual(
        actual,
        '<polygon points="0.12,0.12 100.12,100.12"></polygon>',
      )
    })

    it('throws if points is empty', () => {
      const poly = new Polygon()
      assert.throws(() => poly.render())
    })
  })

  describe('contains', () => {
    describe('square', () => {
      const poly = new Polygon({
        points: [vec2(0, 0), vec2(100, 0), vec2(100, 100), vec2(0, 100)],
      })

      const tests = [
        [vec2(50, 50), true],
        [vec2(99, 99), true],
        [vec2(99, 1), true],
        [vec2(1, 1), true],
        [vec2(1, 99), true],
        [vec2(-1, -1), false],
        [vec2(-1, 99), false],
        [vec2(1, -1), false],
        [vec2(101, 101), false],
        // edges; sometimes unexpected results
        [vec2(100, 50), false],
        [vec2(50, 100), false],
        [vec2(0, 50), true],
        [vec2(50, 0), true],
      ]

      for (const [point, expected] of tests) {
        it(`returns ${expected} for ${point}`, () => {
          assert.strictEqual(poly.contains(point), expected)
        })
      }
    })

    describe('diamond', () => {
      const poly = new Polygon({
        points: [vec2(5, 0), vec2(10, 5), vec2(5, 10), vec2(0, 5)],
      })

      const tests = [
        [vec2(5, 1), true],
        [vec2(5, 9), true],
        [vec2(1, 5), true],
        [vec2(9, 5), true],
        [vec2(5, 5), true],
        [vec2(4, 0.5), false],
        [vec2(6, 0.5), false],
        [vec2(9.5, 4), false],
        [vec2(9.5, 6), false],
        [vec2(4, 9.5), false],
        [vec2(6, 9.5), false],
        [vec2(0.5, 4), false],
        [vec2(0.5, 6), false],
      ]

      for (const [point, expected] of tests) {
        it(`returns ${expected} for ${point}`, () => {
          assert.strictEqual(poly.contains(point), expected)
        })
      }
    })

    describe('bowtie', () => {
      const poly = new Polygon({
        points: [
          vec2(0, 0),
          vec2(5, 2),
          vec2(10, 0),
          vec2(10, 8),
          vec2(5, 6),
          vec2(0, 8),
        ],
      })

      const tests = [
        [vec2(1, 1), true],
        [vec2(1, 7), true],
        [vec2(5, 5), true],
        [vec2(9, 1), true],
        [vec2(9, 7), true],
        [vec2(5, 1), false],
        [vec2(5, 7), false],
      ]

      for (const [point, expected] of tests) {
        it(`returns ${expected} for ${point}`, () => {
          assert.strictEqual(poly.contains(point), expected)
        })
      }
    })
  })
})

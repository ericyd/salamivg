import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Polyline, lineSegment } from './polyline'
import { vec2 } from '../vector2'

describe('Polyline', () => {
  describe('render', () => {
    it('formats `points` correctly', () => {
      const poly = new Polyline({ points: [vec2(0, 0), vec2(100, 100)] })
      const actual = poly.render()
      assert.strictEqual(actual, '<polyline points="0,0 100,100"></polyline>')
    })

    it('includes other properties', () => {
      const poly = new Polyline({
        points: [vec2(0, 0), vec2(100, 100)],
        fill: '#000',
        stroke: '#432',
      })
      const actual = poly.render()
      assert.strictEqual(
        actual,
        '<polyline fill="#000" stroke="#432" points="0,0 100,100"></polyline>',
      )
    })

    it('uses correct precision', () => {
      const poly = new Polyline({
        points: [vec2(0.1234, 0.1234), vec2(100.1234, 100.1234)],
      })
      poly.numericPrecision = 2
      const actual = poly.render()
      assert.strictEqual(
        actual,
        '<polyline points="0.12,0.12 100.12,100.12"></polyline>',
      )
    })

    it('throws if points is empty', () => {
      const poly = new Polyline()
      assert.throws(() => poly.render())
    })
  })
})

describe('LineSegment', () => {
  it('renders a polyline tag', () => {
    const actual = lineSegment(vec2(0, 0), vec2(100, 100)).render()
    assert.strictEqual(actual, '<polyline points="0,0 100,100"></polyline>')
  })
})

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
        '<polygon points="0,0 100,100" fill="#000" stroke="#432"></polygon>',
      )
    })
  })
})

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Circle } from './circle.js'
import { vec2 } from '../vector2.js'

describe('Circle', () => {
  describe('constructor', () => {
    it('can be constructed with x, y, radius', () => {
      const c = new Circle({ x: 10, y: 12, radius: 5 })
      assert.strictEqual(c.x, 10)
      assert.strictEqual(c.y, 12)
      assert.strictEqual(c.radius, 5)
    })

    it('can be constructed with center, radius', () => {
      const c = new Circle({ center: vec2(10, 12), radius: 5 })
      assert.strictEqual(c.x, 10)
      assert.strictEqual(c.y, 12)
      assert.strictEqual(c.radius, 5)
    })

    it('will throw error without either (x,y) or center', () => {
      assert.throws(() => new Circle({ radius: 10 }))
    })
  })

  describe('center', () => {
    it('returns the center', () => {
      const c = new Circle({ x: 10, y: 12, radius: 5 })
      assert.strictEqual(c.center.x, c.x)
      assert.strictEqual(c.center.x, 10)
      assert.strictEqual(c.center.y, c.y)
      assert.strictEqual(c.center.y, 12)
    })
  })

  describe('contains', () => {
    const circle = new Circle({ x: 10, y: 10, radius: 5 })
    const tests = [
      [vec2(10, 10), true],
      [vec2(5, 10), true],
      [vec2(10, 5), true],
      [vec2(10, 15), true],
      [vec2(15, 10), true],
      [vec2(5, 5), false],
      [vec2(15, 15), false],
    ]

    for (const [point, expected] of tests) {
      it(`returns ${expected} for ${point}`, () => {
        assert.strictEqual(circle.contains(point), expected)
      })
    }
  })
})

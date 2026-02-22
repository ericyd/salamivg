import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Hexagon } from './hexagon'
import { vec2 } from '../vector2'

describe('Hexagon', () => {
  it('renders a hexagonal polygon', () => {
    const hex = new Hexagon({
      center: vec2(10, 10),
      circumradius: 1,
      rotation: Math.PI / 6,
    })
    hex.numericPrecision = 2
    assert.strictEqual(
      hex.render(),
      '<polygon points="10.87,10.5 10,11 9.13,10.5 9.13,9.5 10,9 10.87,9.5"></polygon>',
    )
  })

  describe('.neighbors', () => {
    it('returns the correct number of neighbors', () => {
      const hex = new Hexagon({
        center: vec2(10, 10),
        circumradius: 1,
        rotation: Math.PI / 6,
      })
      const neighbors = hex.neighbors()
      assert.strictEqual(neighbors.length, 6)
    })

    it('returns the correct neighbors', () => {
      const hex = new Hexagon({
        center: vec2(10, 10),
        circumradius: 1,
        rotation: Math.PI / 6,
      })
      const neighbors = hex.neighbors()
      const sqrt3 = Math.sqrt(3)
      const dist = sqrt3 // apothem * 2
      const expected = [
        {
          x: 10 + Math.cos(Math.PI / 6) * dist,
          y: 10 + Math.sin(Math.PI / 6) * dist,
        },
        {
          x: 10 + Math.cos(Math.PI / 2) * dist,
          y: 10 + Math.sin(Math.PI / 2) * dist,
        },
        {
          x: 10 + Math.cos((5 * Math.PI) / 6) * dist,
          y: 10 + Math.sin((5 * Math.PI) / 6) * dist,
        },
        {
          x: 10 + Math.cos((7 * Math.PI) / 6) * dist,
          y: 10 + Math.sin((7 * Math.PI) / 6) * dist,
        },
        {
          x: 10 + Math.cos((3 * Math.PI) / 2) * dist,
          y: 10 + Math.sin((3 * Math.PI) / 2) * dist,
        },
        {
          x: 10 + Math.cos((11 * Math.PI) / 6) * dist,
          y: 10 + Math.sin((11 * Math.PI) / 6) * dist,
        },
      ]
      const epsilon = 1e-10
      for (let i = 0; i < 6; i++) {
        assert.ok(
          Math.abs(neighbors[i].center.x - expected[i].x) < epsilon,
          `neighbor ${i} x: expected ${expected[i].x}, got ${neighbors[i].center.x}`,
        )
        assert.ok(
          Math.abs(neighbors[i].center.y - expected[i].y) < epsilon,
          `neighbor ${i} y: expected ${expected[i].y}, got ${neighbors[i].center.y}`,
        )
      }
    })
  })
})

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Hexagon } from './hexagon.js'
import { vec2 } from '../vector2.js'

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

    it.todo('returns the correct neighbors')
  })
})

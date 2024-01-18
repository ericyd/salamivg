import { describe, it } from 'node:test'
import { path } from './path.js'
import assert from 'node:assert'
import { vec2 } from '../vector2.js'

describe('Path', () => {
  it.todo('moveTo should add the correct path instruction')

  it.todo('lineTo should add the correct path instruction')

  it.todo('cubicBezier should add the correct path instruction')

  it.todo('smoothBezier should add the correct path instruction')

  it.todo('close should add the correct path instruction')

  it('should render an arc correctly', () => {
    const p = path((p) => {
      p.moveTo(vec2(80, 80))
      p.arc({
        rx: 45,
        ry: 45,
        xAxisRotation: 0,
        largeArcFlag: false,
        sweepFlag: false,
        end: vec2(125, 125),
      })
      p.lineTo(vec2(125, 80))
      p.close()
    })
    assert.strictEqual(
      p.render(),
      '<path d="M 80 80 A 45 45 0 0 0 125 125 L 125 80 Z"></path>',
    )
  })
})

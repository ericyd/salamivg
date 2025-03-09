import { describe, it } from 'node:test'
import { path } from './path'
import assert from 'node:assert'
import { vec2 } from '../vector2'

describe('Path', () => {
  it('moveTo should add the correct path instruction', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.moveTo(vec2(10, 10))
    })
    assert.strictEqual(p.render(), '<path d="M 5 5 M 10 10"></path>')
  })

  it('lineTo should add the correct path instruction', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.lineTo(vec2(10, 10))
    })
    assert.strictEqual(p.render(), '<path d="M 5 5 L 10 10"></path>')
  })

  it('cubicBezier should add the correct path instruction', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.cubicBezier(vec2(10, 10), vec2(15, 15), vec2(20, 20))
    })
    assert.strictEqual(
      p.render(),
      '<path d="M 5 5 C 10 10 15 15 20 20"></path>',
    )
  })

  it('smoothBezier should add the correct path instruction', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.smoothBezier(vec2(10, 10), vec2(15, 15))
    })
    assert.strictEqual(p.render(), '<path d="M 5 5 S 10 10 15 15"></path>')
  })

  it('close should add the correct path instruction', () => {
    const p = path((p) => {
      p.moveTo(vec2(80, 80))
      p.close()
    })
    assert.strictEqual(p.render(), '<path d="M 80 80 Z"></path>')
  })

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

  it('should render a quadratic bezier correctly', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.quadraticBezier(vec2(10, 10), vec2(15, 15))
    })
    assert.strictEqual(p.render(), '<path d="M 5 5 Q 10 10 15 15"></path>')
  })

  it('should render a smooth quadratic bezier correctly', () => {
    const p = path((p) => {
      p.moveTo(vec2(5, 5))
      p.smoothQuadraticBezier(vec2(10, 10), vec2(15, 15))
    })
    assert.strictEqual(p.render(), '<path d="M 5 5 T 10 10 15 15"></path>')
  })
})

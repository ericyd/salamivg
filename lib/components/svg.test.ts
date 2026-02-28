import { describe, it } from 'node:test'
import { Svg } from './svg'
import { LinearGradient } from './linear-gradient'
import { LineSegment } from './polyline'
import { vec2 } from '../vector2'
import assert from 'node:assert'
import { rgb } from '../color/rgb'

describe('Svg', () => {
  describe('defineLinearGradient', () => {
    it('renders defs', () => {
      const svg = new Svg({})
      svg.defineLinearGradient({ colors: ['#000', '#fff'], id: '123' })
      svg.rect({ x: 0, y: 0, width: 10, height: 10 })
      const actual = svg.render()
      const expected = [
        '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100">',
        '<defs >',
        '<linearGradient x1="0" x2="0" y1="0" y2="1" id="123">',
        '<stop offset="0" stop-color="rgb(0, 0, 0, 1)"></stop>',
        '<stop offset="100" stop-color="rgb(255, 255, 255, 1)"></stop>',
        '</linearGradient>',
        '</defs>',
        '<rect x="0" y="0" width="10" height="10"></rect>',
        '</svg>',
      ].join('')
      assert.strictEqual(actual, expected)
    })

    it('renders linear gradient IDs when fill is a LinearGradient', () => {
      const grad = new LinearGradient({
        id: 'grad-id',
        colors: ['#000', '#fff'],
      })
      const t = new Svg({ fill: grad })
      assert.strictEqual(
        t.render(),
        '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" fill="url(#grad-id)"></svg>',
      )
    })

    it('inherits colorFormat when SVG has colorFormat set', () => {
      const svg = new Svg({})
      svg.colorFormat = 'hex'
      svg.defineLinearGradient({
        colors: [rgb(0, 0, 0, 1), rgb(1, 1, 1, 1)],
        id: 'abc',
      })
      const actual = svg.render()
      assert.ok(actual.includes('stop-color="#000000ff"'))
      assert.ok(actual.includes('stop-color="#ffffffff"'))
    })
  })

  describe('center', () => {
    it('is a Vector2 at the center of the viewport', () => {
      const center = new Svg({ width: 50, height: 50 }).center
      assert.strictEqual(center.x, 25)
      assert.strictEqual(center.y, 25)
    })
  })

  describe('lineSegment', () => {
    it('adds a line segment from start and end Vector2', () => {
      const svg = new Svg({})
      svg.lineSegment(vec2(0, 0), vec2(10, 20))
      const actual = svg.render()
      assert.ok(actual.includes('<polyline points="0,0 10,20"></polyline>'))
    })

    it('adds an existing LineSegment instance', () => {
      const svg = new Svg({})
      const segment = new LineSegment(vec2(5, 5), vec2(15, 25))
      svg.lineSegment(segment)
      const actual = svg.render()
      assert.ok(actual.includes('<polyline points="5,5 15,25"></polyline>'))
    })
  })
})

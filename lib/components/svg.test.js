import { describe, it } from 'node:test'
import { Svg } from './svg.js'
import { LinearGradient } from './linear-gradient.js'
import assert from 'node:assert'

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
  })
})

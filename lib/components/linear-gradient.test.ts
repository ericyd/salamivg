import { describe, it } from 'node:test'
import { LinearGradient } from './linear-gradient'
import { ColorRgb } from '../color/rgb'
import { hsl } from '../color/hsl'
import assert from 'node:assert'

describe('LinearGradient', () => {
  describe('render', () => {
    it('renders stops and direction attributes', () => {
      const stops = [
        [10, new ColorRgb(0.2, 0.3, 0.4, 1)],
        [45, '#45f986'],
        [75, hsl(45, 0.3, 0.9)],
        [100, '#fe8945'],
      ]
      const actual = new LinearGradient({ stops, id: '18d0a2538b4' }).render()
      const expected = [
        '<linearGradient x1="0" x2="0" y1="0" y2="1" id="18d0a2538b4">',
        '<stop id="18d0a2538b4_0" offset="10" stop-color="rgb(51, 76.5, 102, 1)" style="stop-color:#334d66;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_1" offset="45" stop-color="rgb(69, 249, 134, 1)" style="stop-color:#45f986;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_2" offset="75" stop-color="hsl(45, 30%, 90%, 1)" style="stop-color:#ede9de;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_3" offset="100" stop-color="rgb(254, 137, 69, 1)" style="stop-color:#fe8945;stop-opacity:1;"></stop>',
        '</linearGradient>',
      ].join('')
      assert.strictEqual(actual, expected)
    })

    it('automatically creates stops from a list of colors', () => {
      const colors = [
        new ColorRgb(0.2, 0.3, 0.4, 1),
        '#45f986',
        hsl(45, 0.3, 0.9),
        '#fe8945',
      ]
      const actual = new LinearGradient({
        colors,
        id: '18d0a2538b4',
        numericPrecision: 2,
      }).render()
      const expected = [
        '<linearGradient x1="0" x2="0" y1="0" y2="1" id="18d0a2538b4">',
        '<stop id="18d0a2538b4_0" offset="0" stop-color="rgb(51, 76.5, 102, 1)" style="stop-color:#334d66;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_1" offset="33.33" stop-color="rgb(69, 249, 134, 1)" style="stop-color:#45f986;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_2" offset="66.67" stop-color="hsl(45, 30%, 90%, 1)" style="stop-color:#ede9de;stop-opacity:1;"></stop>',
        '<stop id="18d0a2538b4_3" offset="100" stop-color="rgb(254, 137, 69, 1)" style="stop-color:#fe8945;stop-opacity:1;"></stop>',
        '</linearGradient>',
      ].join('')
      assert.strictEqual(actual, expected)
    })
  })
})

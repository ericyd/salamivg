import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ColorSequence } from './color-sequence'
import { ColorRgb, rgb } from './rgb'
import { ColorHsl, hsl } from './hsl'

describe('ColorSequence', () => {
  describe('constructor', () => {
    it('can accept mixed types of colors', () => {
      const spectrum = new ColorSequence([
        [0, '010101'],
        [0.5, rgb(0.5, 0.9, 0.2)],
        [1, hsl(150, 0.5, 0.5)],
      ])
      assert(
        spectrum.at(1) instanceof ColorHsl,
        `spectrum.at(1) is not instance of ColorHsl. Got: ${spectrum.at(1)}`,
      )
      assert(
        spectrum.at(0) instanceof ColorHsl,
        `spectrum.at(0) is not instance of ColorHsl. Got: ${spectrum.at(0)}`,
      )
      assert(
        spectrum.at(0.5) instanceof ColorHsl,
        `spectrum.at(0. is not instance of ColorHsl. Got: ${spectrum.at(0.5)}`,
      )
    })
  })

  describe('fromColors', () => {
    it('with two colors, creates a color sequence with color stops at 0 and 1', () => {
      const spectrum = ColorSequence.fromColors(['010101', 'fefefe'])
      assert.strictEqual(spectrum.at(0).toRgb().toHex(), '#010101ff')
      assert.notStrictEqual(spectrum.at(0.01).toRgb().toHex(), '#010101ff')
      assert.strictEqual(spectrum.at(1).toRgb().toHex(), '#fefefeff')
      assert.notStrictEqual(spectrum.at(0.94).toRgb().toHex(), '#fefefeff')
      assert.strictEqual(spectrum.at(0.5).toRgb().toHex(), '#808080ff')
    })

    it('can accept mixed types of colors', () => {
      const spectrum = ColorSequence.fromColors([
        '010101',
        rgb(0.5, 0.9, 0.2),
        hsl(150, 0.5, 0.5),
      ])
      assert(
        spectrum.at(1) instanceof ColorHsl,
        `spectrum.at(1) is not instance of ColorHsl. Got: ${spectrum.at(1)}`,
      )
      assert(
        spectrum.at(0) instanceof ColorHsl,
        `spectrum.at(0) is not instance of ColorHsl. Got: ${spectrum.at(0)}`,
      )
      assert(
        spectrum.at(0.5) instanceof ColorHsl,
        `spectrum.at(0. is not instance of ColorHsl. Got: ${spectrum.at(0.5)}`,
      )
    })
  })

  describe('at', () => {
    it('returns lowest stop when `t` is lower than lowest stop is requested', () => {
      const spectrum = new ColorSequence([
        [0.3, ColorRgb.fromHex('#ab85a9ff')],
        [0.7, ColorRgb.fromHex('#97febcff')],
      ])
      assert.strictEqual(spectrum.at(0.3).toRgb().toHex(), '#ab85a9ff')
      assert.strictEqual(spectrum.at(0).toRgb().toHex(), '#ab85a9ff')
      assert.strictEqual(spectrum.at(-100).toRgb().toHex(), '#ab85a9ff')
    })

    it('returns highest stop when `t` is higher than highest stop is requested', () => {
      const spectrum = new ColorSequence([
        [0.3, ColorRgb.fromHex('#ab85a9ff')],
        [0.7, ColorRgb.fromHex('#97febcff')],
      ])
      assert.strictEqual(spectrum.at(0.7).toRgb().toHex(), '#97febcff')
      assert.strictEqual(spectrum.at(1).toRgb().toHex(), '#97febcff')
      assert.strictEqual(spectrum.at(100).toRgb().toHex(), '#97febcff')
    })

    it('mixes colors together', () => {
      const spectrum = ColorSequence.fromColors(['010101', 'fefefe'])
      const actual = spectrum.at(0.5)
      assert.strictEqual(actual.toRgb().toHex(), '#808080ff')
    })
  })
})

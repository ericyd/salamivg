import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ColorRgb } from '../color/rgb'
import { hsl } from '../color/hsl'
import { Tag } from './tag'
import { LinearGradient } from './linear-gradient'

describe('Tag', () => {
  describe('render', () => {
    it('should return a string', () => {
      const t = new Tag('test')
      assert.strictEqual(typeof t.render(), 'string')
    })

    it('should include all attributes', () => {
      const t = new Tag('test', { fill: 'red' })
      assert.strictEqual(t.render(), '<test fill="red"></test>')
    })

    it('should round numeric attributes to the specified precision', () => {
      const t = new Tag('test', { x: 1.23456 })
      t.numericPrecision = 2
      assert.strictEqual(t.render(), '<test x="1.23"></test>')
    })

    it('should omit undefined attributes', () => {
      const t = new Tag('test', {
        fill: 'red',
        stroke: undefined,
        wonky: true,
        undef: undefined,
      })
      assert.strictEqual(t.render(), '<test fill="red" wonky="true"></test>')
    })
  })

  describe('setVisualAttributes', () => {
    it('should use incoming attributes when they are not set on the target instance', () => {
      const t = new Tag('test')
      t.setVisualAttributes({ fill: '#fff', stroke: '#000' })
      assert.strictEqual(t.attributes.fill, '#fff')
      assert.strictEqual(t.attributes.stroke, '#000')
    })

    it('should use target attributes when they are set on the target instance', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      t.strokeWidth = 2
      t.setVisualAttributes({
        fill: '#fff',
        strokeWidth: 5,
        stroke: '#000',
      })
      assert.strictEqual(t.attributes.fill, '#0f0')
      assert.strictEqual(t.attributes['stroke-width'], 2)
      assert.strictEqual(t.attributes.stroke, '#000')
    })

    it('should inherit strokeWidth when parent sets it via the setter', () => {
      const parent = new Tag('g')
      parent.strokeWidth = 2
      const child = new Tag('path')
      parent.addChild(child)
      assert.strictEqual(child.attributes['stroke-width'], 2)
    })

    it('should inherit stroke-width when parent sets it via setAttributes', () => {
      const parent = new Tag('g')
      parent.setAttributes({ 'stroke-width': 3 })
      const child = new Tag('path')
      parent.addChild(child)
      assert.strictEqual(child.attributes['stroke-width'], 3)
    })

    it('should inherit strokeWidth when passed to setVisualAttributes', () => {
      const t = new Tag('g')
      t.setVisualAttributes({ 'stroke-width': 4 })
      assert.strictEqual(t.attributes['stroke-width'], 4)
    })

    it('should omit attributes that are not defined in either incomine or target', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      t.setVisualAttributes({ 'stroke-width': 5 })
      assert.strictEqual(t.attributes.stroke, undefined)
    })
  })

  describe('attribute key normalization', () => {
    it('should convert camelCase strokeWidth to kebab-case in rendered output', () => {
      const t = new Tag('path', { strokeWidth: 2 })
      assert.ok(t.render().includes('stroke-width="2"'))
    })

    it('should leave kebab-case stroke-width unchanged in rendered output', () => {
      const t = new Tag('path', { 'stroke-width': 3 })
      assert.ok(t.render().includes('stroke-width="3"'))
    })

    it('should convert other camelCase keys like strokeLinecap to kebab-case', () => {
      const t = new Tag('path', { strokeLinecap: 'round' })
      assert.ok(t.render().includes('stroke-linecap="round"'))
    })

    it('should leave non-camelCase keys like viewBox unchanged', () => {
      const t = new Tag('svg', { viewBox: '0 0 100 100' })
      assert.ok(t.render().includes('viewBox="0 0 100 100"'))
    })
  })

  describe('colorFormat', () => {
    it('renders ColorRgb in rgb format by default', () => {
      const t = new Tag('rect', { fill: new ColorRgb(0.2, 0.3, 0.4, 1) })
      assert.ok(t.render().includes('fill="rgb(51, 76.5, 102, 1)"'))
    })

    it('renders ColorHsl in hsl format by default', () => {
      const t = new Tag('rect', { fill: hsl(45, 0.3, 0.9) })
      assert.ok(t.render().includes('fill="hsl(45, 30%, 90%, 1)"'))
    })

    it('renders colors in hex format when colorFormat is "hex"', () => {
      const t = new Tag('rect', { fill: new ColorRgb(0.2, 0.3, 0.4, 1) })
      t.colorFormat = 'hex'
      assert.ok(t.render().includes('fill="#334d66ff"'))
    })

    it('renders ColorHsl in rgb format when colorFormat is "rgb"', () => {
      const t = new Tag('rect', { fill: hsl(45, 0.3, 0.9) })
      t.colorFormat = 'rgb'
      assert.ok(
        t
          .render()
          .includes(
            'fill="rgb(237.14999999999998, 233.32500000000002, 221.85000000000002, 1)"',
          ),
      )
    })

    it('renders ColorRgb in hsl format when colorFormat is "hsl"', () => {
      const t = new Tag('rect', { fill: new ColorRgb(0.2, 0.3, 0.4, 1) })
      t.colorFormat = 'hsl'
      assert.match(t.render(), /fill="hsl\(210,\s*[\d.]+%,\s*[\d.]+%,\s*1\)"/)
    })

    it('propagates colorFormat to children in addChild', () => {
      const parent = new Tag('g')
      parent.colorFormat = 'hex'
      const child = new Tag('rect', { fill: new ColorRgb(0.2, 0.3, 0.4, 1) })
      parent.addChild(child)
      assert.ok(parent.render().includes('fill="#334d66ff"'))
    })
  })

  describe('addChild', () => {
    it('should set visual attributes on the child', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      const child = new Tag('test')
      t.addChild(child)
      assert.strictEqual(child.attributes.fill, '#0f0')
      assert.strictEqual(child.attributes.stroke, undefined)
    })

    it('should set numericPrecision', () => {
      const t = new Tag('test')
      t.numericPrecision = 2
      const child = new Tag('test')
      assert.strictEqual(child.numericPrecision, Infinity)
      t.addChild(child)
      assert.strictEqual(child.numericPrecision, 2)
    })
  })
})

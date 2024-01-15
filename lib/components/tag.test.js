import { describe, it } from 'node:test'
import assert from 'node:assert'
import { Tag } from './tag.js'
import { LinearGradient } from './linear-gradient.js'

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
  })

  describe('setVisualAttributes', () => {
    it('should use incoming attributes when they are not set on the target instance', () => {
      const t = new Tag('test')
      // @ts-expect-error this is either a lint error or a TS error. It's a test so it's fine
      t.setVisualAttributes({ fill: '#fff', stroke: '#000' })
      assert.strictEqual(t.attributes.fill, '#fff')
      assert.strictEqual(t.attributes.stroke, '#000')
    })

    it('should use target attributes when they are set on the target instance', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      t.strokeWidth = 2
      // @ts-expect-error this is either a lint error or a TS error. It's a test so it's fine
      t.setVisualAttributes({
        fill: '#fff',
        'stroke-width': 5,
        stroke: '#000',
      })
      assert.strictEqual(t.attributes.fill, '#0f0')
      assert.strictEqual(t.attributes['stroke-width'], 2)
      assert.strictEqual(t.attributes.stroke, '#000')
    })

    it('should omit attributes that are not defined in either incomine or target', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      // @ts-expect-error this is either a lint error or a TS error. It's a test so it's fine
      t.setVisualAttributes({ 'stroke-width': 5 })
      assert.strictEqual(t.attributes.stroke, undefined)
    })
  })

  describe('addChild', () => {
    it('should set visual attributes on the child', () => {
      const t = new Tag('test')
      t.fill = '#0f0'
      const child = new Tag('test')
      // @ts-expect-error this is either a lint error or a TS error. It's a test so it's fine
      t.addChild(child)
      assert.strictEqual(child.attributes.fill, '#0f0')
      assert.strictEqual(child.attributes.stroke, undefined)
    })

    it('should set numericPrecision', () => {
      const t = new Tag('test')
      t.numericPrecision = 2
      const child = new Tag('test')
      assert.strictEqual(child.numericPrecision, Infinity)
      // @ts-expect-error this is either a lint error or a TS error. It's a test so it's fine
      t.addChild(child)
      assert.strictEqual(child.numericPrecision, 2)
    })
  })
})

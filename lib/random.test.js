import assert from "node:assert"
import { describe, it } from "node:test"
import { randomFromObj } from './random.js'


describe('randomFromObj', () => {
  it('returns a value from the object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const rng = () => 0.5
    assert.strictEqual(randomFromObj(obj, rng), 2)
  })
})

describe('randomFromArray', () => {
  it('returns a value from the object', () => {
    const arr = [1,2,3]
    const rng = () => 0.5
    assert.strictEqual(randomFromArray(arr, rng), 2)
  })
})
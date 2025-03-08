import { describe, it } from 'node:test'
import { createOscNoise } from './oscillator-noise.js'
import { randomSeed } from '../random.js'
import assert from 'node:assert'

describe('OscillatorNoise', () => {
  it('returns consistent values for the same seed/x/y inputs', () => {
    const seed = randomSeed()
    const noiseFn1 = createOscNoise(seed)
    const actual1 = noiseFn1(100, 100)

    const noiseFn2 = createOscNoise(seed)
    const actual2 = noiseFn2(100, 100)

    assert.strictEqual(
      actual1,
      actual2,
      `Seed ${seed} gave 2 different values: ${actual1} and ${actual2}`,
    )
  })

  describe('createOscNoise', () => {
    // if I'm being honest, I don't know if this test is accurately testing this feature.
    it('can scale in the xy plane', () => {
      const noiseFn1 = createOscNoise('100', 1)
      const actual1 = noiseFn1(0, 0)
      const actual2 = noiseFn1(0.1, 0.1)
      const diff1 = actual2 - actual1

      const noiseFn2 = createOscNoise('100', 0.1)
      const actual3 = noiseFn2(0, 0)
      const actual4 = noiseFn2(0.1, 0.1)
      const diff2 = actual3 - actual4

      assert(diff2 < diff1)
    })

    it('can scale the output', () => {
      const outputScale = 10

      const noiseFn1 = createOscNoise('100', 1)
      const actual1 = noiseFn1(0, 0)

      const noiseFn2 = createOscNoise('100', 1, outputScale)
      const actual2 = noiseFn2(0, 0)

      assert(actual2 === actual1 * outputScale)
    })
  })
})

import { describe, it } from "node:test";
import { createOscNoise } from './oscillator-noise.js'
import { randomSeed } from "../random.js";
import assert from "node:assert";

describe("OscillatorNoise", () => {
  it('returns consistent values for the same seed/x/y inputs', () => {
    const seed = randomSeed()
    const noiseFn1 = createOscNoise(seed)
    const actual1 = noiseFn1(100, 100)

    const noiseFn2 = createOscNoise(seed)
    const actual2 = noiseFn2(100, 100)

    assert.strictEqual(actual1, actual2, `Seed ${seed} gave 2 different values: ${actual1} and ${actual2}`)
  })
})
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { randomFromObject, randomFromArray, Random } from './random'

describe('randomFromObject', () => {
  it('returns a value from the object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const rng = () => 0.5
    assert.strictEqual(randomFromObject(obj, rng), 2)
  })
})

describe('randomFromArray', () => {
  it('returns a value from the object', () => {
    const arr = [1, 2, 3]
    const rng = () => 0.5
    assert.strictEqual(randomFromArray(arr, rng), 2)
  })
})

describe('Random class', () => {
  describe('create', () => {
    it('creates a Random instance with a seed', () => {
      const rnd = Random.create('test-seed')
      assert.ok(rnd instanceof Random)
    })

    it('produces deterministic results with same seed', () => {
      const rnd1 = Random.create('my-seed')
      const rnd2 = Random.create('my-seed')
      assert.strictEqual(rnd1.value(0, 100), rnd2.value(0, 100))
    })

    it('produces different results with different seeds', () => {
      const rnd1 = Random.create('seed-a')
      const rnd2 = Random.create('seed-b')
      assert.notStrictEqual(rnd1.value(0, 100), rnd2.value(0, 100))
    })
  })

  describe('rng getter', () => {
    it('exposes the underlying rng function', () => {
      const rnd = Random.create('test')
      assert.strictEqual(typeof rnd.rng, 'function')
      assert.strictEqual(typeof rnd.rng(), 'number')
    })
  })

  describe('value', () => {
    it('returns a number in range [min, max]', () => {
      const rnd = Random.create('test')
      for (let i = 0; i < 100; i++) {
        const val = rnd.value(10, 20)
        assert.ok(val >= 10 && val <= 20, `${val} should be in [10, 20]`)
      }
    })
  })

  describe('int', () => {
    it('returns an integer in range [min, max)', () => {
      const rnd = Random.create('test')
      for (let i = 0; i < 100; i++) {
        const val = rnd.int(0, 10)
        assert.ok(Number.isInteger(val), `${val} should be an integer`)
        assert.ok(val >= 0 && val < 10, `${val} should be in [0, 10)`)
      }
    })
  })

  describe('seed', () => {
    it('returns an integer in range [0, MAX_SAFE_INTEGER]', () => {
      const rnd = Random.create('test')
      const seed = rnd.seed()
      assert.ok(Number.isInteger(seed))
      assert.ok(seed >= 0 && seed <= Number.MAX_SAFE_INTEGER)
    })
  })

  describe('jitter', () => {
    it('returns value within +/- amount of original', () => {
      const rnd = Random.create('test')
      for (let i = 0; i < 100; i++) {
        const val = rnd.jitter(5, 50)
        assert.ok(val >= 45 && val <= 55, `${val} should be in [45, 55]`)
      }
    })
  })

  describe('shuffle', () => {
    it('returns a new array with same elements', () => {
      const rnd = Random.create('test')
      const arr = [1, 2, 3, 4, 5]
      const shuffled = rnd.shuffle(arr)
      assert.notStrictEqual(shuffled, arr)
      assert.strictEqual(shuffled.length, arr.length)
      assert.deepStrictEqual([...shuffled].sort(), [...arr].sort())
    })

    it('produces deterministic results with same seed', () => {
      const arr = [1, 2, 3, 4, 5]
      const rnd1 = Random.create('shuffle-seed')
      const rnd2 = Random.create('shuffle-seed')
      assert.deepStrictEqual(rnd1.shuffle(arr), rnd2.shuffle(arr))
    })
  })

  describe('fromArray', () => {
    it('returns an element from the array', () => {
      const rnd = Random.create('test')
      const arr = ['a', 'b', 'c']
      const val = rnd.fromArray(arr)
      assert.ok(arr.includes(val))
    })
  })

  describe('fromObject', () => {
    it('returns a value from the object', () => {
      const rnd = Random.create('test')
      const obj = { x: 10, y: 20, z: 30 }
      const val = rnd.fromObject(obj)
      assert.ok(Object.values(obj).includes(val))
    })
  })
})

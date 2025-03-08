// tests/test_vector3.js

import  { Vector3, vec3 } from '../lib/vector3.js';
import  assert from 'node:assert';
import { describe, it } from 'node:test'

describe('Vector3', () => {
  const rng = () => 0.5;

  describe('constructor', () => {
    it('should create vector with default values if y and z are omitted', () => {
      const v = new Vector3(1);
      assert.strictEqual(v.x, 1);
      assert.strictEqual(v.y, 1);
      assert.strictEqual(v.z, 1);
    });

    it('should throw error if x is not a number', () => {
      assert.throws(() => new Vector3('a'), /Vector3 constructor requires a number for x, got string/);
    });
  });

  describe('add', () => {
    it('should add vectors correctly', () => {
      const v1 = vec3(1, 2, 3);
      const v2 = vec3(4, 5, 6);
      const result = v1.add(v2);
      assert.strictEqual(result.x, 5);
      assert.strictEqual(result.y, 7);
      assert.strictEqual(result.z, 9);
    });
  });

  describe('subtract', () => {
    it('should subtract vectors correctly', () => {
      const v1 = vec3(1, 2, 3);
      const v2 = vec3(4, 5, 6);
      const result = v1.subtract(v2);
      assert.strictEqual(result.x, -3);
      assert.strictEqual(result.y, -3);
      assert.strictEqual(result.z, -3);
    });
  });

  describe('multiply', () => {
    it('should multiply vector by scalar correctly', () => {
      const v = vec3(1, 2, 3);
      const result = v.multiply(2);
      assert.strictEqual(result.x, 2);
      assert.strictEqual(result.y, 4);
      assert.strictEqual(result.z, 6);
    });
  });

  describe('divide', () => {
    it('should divide vector by scalar correctly', () => {
      const v = vec3(1, 2, 3);
      const result = v.divide(2);
      assert.strictEqual(result.x, 0.5);
      assert.strictEqual(result.y, 1);
      assert.strictEqual(result.z, 1.5);
    });
  });

  describe('distanceTo', () => {
    it('should calculate distance between two vectors correctly', () => {
      const v1 = vec3(1, 2, 3);
      const v2 = vec3(4, 5, 6);
      const result = v1.distanceTo(v2);
      assert.strictEqual(result, Math.sqrt(9 + 9 + 9));
    });
  });

  describe('length', () => {
    it('should calculate the length of a vector correctly', () => {
      const v = vec3(3, 4, 12);
      const result = v.length();
      assert.strictEqual(result, 13);
    });
  });

  describe('dot', () => {
    it('should calculate the dot product of two vectors correctly', () => {
      const v1 = vec3(1, 2, 3);
      const v2 = vec3(4, 5, 6);
      const result = v1.dot(v2);
      assert.strictEqual(result, 32);
    });
  });

  describe('static midpoint', () => {
    it('should calculate the midpoint between two vectors correctly', () => {
      const v1 = vec3(0, 0, 0);
      const v2 = vec3(4, 5, 6);
      const result = Vector3.midpoint(v1, v2);
      assert.strictEqual(result.x, 2);
      assert.strictEqual(result.y, 2.5);
      assert.strictEqual(result.z, 3);
    });
  });

  describe('static random', () => {
    it('should generate a random vector within specified bounds', () => {
      const v = Vector3.random(0, 1, 0, 1, 0, 1, rng);
      assert.ok(v.x >= 0 && v.x <= 1);
      assert.ok(v.y >= 0 && v.y <= 1);
      assert.ok(v.z >= 0 && v.z <= 1);
    });
  });

  describe('jitter', () => {
    it('should jitter a vector by the specified amount', () => {
      const v = vec3(5, 5, 5);
      const result = v.jitter(1, rng);
      assert.ok(result.x >= 4 && result.x <= 6);
      assert.ok(result.y >= 4 && result.y <= 6);
      assert.ok(result.z >= 4 && result.z <= 6);
    });
  });

  describe('eq', () => {
    it('should check for value equality correctly', () => {
      const v1 = vec3(1, 2, 3);
      const v2 = vec3(1, 2, 3);
      assert.strictEqual(v1.eq(v2), true);

      const v3 = vec3(4, 5, 6);
      assert.strictEqual(v1.eq(v3), false);
    });
  });

  describe('toString', () => {
    it('should return a string representation of the vector', () => {
      const v = vec3(1, 2, 3);
      assert.strictEqual(v.toString(), 'Vector3 { x: 1, y: 2, z: 3 }');
    });
  });
});
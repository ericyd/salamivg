/*
Rules

1. Draw an equilateral triangle in the center of the viewBox
2. Subdivide the triangle into 4 equal-sized smaller triangles
3. If less than max depth and <chance>, continue recursively subdividing
4. Each triangle gets a different fun-colored fill, and a slightly-opacified stroke
*/
import {
  renderSvg,
  vec2,
  randomSeed,
  createRng,
  Vector2,
  random,
  randomInt,
  PI,
  ColorSequence,
  shuffle,
  TAU,
  ColorRgb,
} from '../lib/index.js'

const config = {
  width: 100,
  height: 100,
  scale: 3,
  loopCount: 1,
}

let seed = 8852037180828291 // or, randomSeed()

const colors = [
  '#974F7A',
  '#D093C2',
  '#6F9EB3',
  '#E5AD5A',
  '#EEDA76',
  '#B5CE8D',
  '#DAE7E8',
  '#2E4163',
]

const bg = '#2E4163'
const stroke = ColorRgb.fromHex('#DAE7E8')

renderSvg(config, (svg) => {
  const rng = createRng(seed)
  const maxDepth = randomInt(5, 7, rng)
  svg.filenameMetadata = { seed, maxDepth }
  svg.setBackground(bg)
  svg.numericPrecision = 3
  svg.fill = bg
  svg.stroke = stroke
  svg.strokeWidth = 0.25
  const spectrum = ColorSequence.fromColors(shuffle(colors, rng))

  function drawTriangle(a, b, c, depth = 0) {
    // always draw the first triangle; then, draw about half of the triangles
    if (depth === 0 || random(0, 1, rng) < 0.5) {
      // offset amount increases with depth
      const offsetAmount = depth / 2
      const offset = vec2(
        random(-offsetAmount, offsetAmount, rng),
        random(-offsetAmount, offsetAmount, rng),
      )
      // draw the triangle with some offset
      svg.polygon({
        points: [a.add(offset), b.add(offset), c.add(offset)],
        fill: spectrum.at(random(0, 1, rng)).opacify(0.4).toHex(),
        stroke: stroke.opacify(1 / (depth / 4 + 1)).toHex(),
      })
    }
    // recurse if we're above maxDepth and "lady chance allows it"
    if (depth < maxDepth && (depth < 2 || random(0, 1, rng) < 0.75)) {
      const ab = Vector2.mix(a, b, 0.5)
      const ac = Vector2.mix(a, c, 0.5)
      const bc = Vector2.mix(b, c, 0.5)
      drawTriangle(ab, ac, bc, depth + 1)
      drawTriangle(a, ab, ac, depth + 1)
      drawTriangle(b, bc, ab, depth + 1)
      drawTriangle(c, bc, ac, depth + 1)
    }
  }

  // construct an equilateral triangle from the center of the canvas with a random rotation
  const angle = random(0, TAU, rng)
  const a = svg.center.add(Vector2.fromAngle(angle).scale(45))
  const b = svg.center.add(Vector2.fromAngle(angle + (PI * 2) / 3).scale(45))
  const c = svg.center.add(Vector2.fromAngle(angle + (PI * 4) / 3).scale(45))
  drawTriangle(a, b, c)

  // when loopCount > 1, this will randomize the seed on each iteration
  return () => {
    seed = randomSeed()
  }
})

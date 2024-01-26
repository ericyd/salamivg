import {
  renderSvg,
  map,
  vec2,
  randomSeed,
  createRng,
  Vector2,
  random,
  ColorRgb,
  PI,
  cos,
  sin,
  ColorSequence,
  shuffle,
  createOscNoise,
} from '../lib/index.js'

const config = {
  width: 100,
  height: 100,
  scale: 3,
  loopCount: 1,
}

let seed = 5318189853830211 // randomSeed()

const colors = ['#B2D0DE', '#E0A0A5', '#9BB3E7', '#F1D1B8', '#D9A9D6']

renderSvg(config, (svg) => {
  // filenameMetadata will be added to the filename that is written to disk;
  // this makes it easy to recall which seeds were used in a particular sketch
  svg.filenameMetadata = { seed }

  // a seeded pseudo-random number generator provides controlled randomness for our sketch
  const rng = createRng(seed)

  // black background 😎
  svg.setBackground('#000')

  // set some basic SVG props
  svg.fill = null
  svg.stroke = ColorRgb.Black
  svg.strokeWidth = 0.25
  svg.numericPrecision = 3

  // create a 2D noise function using the built-in "oscillator noise"
  const noiseFn = createOscNoise(seed)

  // create a bunch of random start points within the svg boundaries
  const nPoints = 200
  const points = new Array(nPoints)
    .fill(0)
    .map(() => Vector2.random(0, svg.width, 0, svg.height, rng))

  // define a color spectrum that can be indexed randomly for line colors
  const spectrum = ColorSequence.fromColors(shuffle(colors, rng))

  // noise functions usually require some type of scaling;
  // here we randomize slightly to get the amount of "flowiness" that we want.
  const scale = random(0.05, 0.13, rng)

  // each start point gets a line
  for (const point of points) {
    svg.path((path) => {
      // choose a random stroke color for the line
      path.stroke = spectrum.at(random(0, 1, rng))

      // move along the vector field defined by the 2D noise function.
      // the line length is "100", which is totally arbitrary.
      path.moveTo(point)
      for (let i = 0; i < 100; i++) {
        let noise = noiseFn(path.cursor.x * scale, path.cursor.y * scale)
        let angle = map(-1, 1, -PI, PI, noise)
        path.lineTo(path.cursor.add(vec2(cos(angle), sin(angle))))
      }
    })
  }

  // when loopCount > 1, this will randomize the seed on each iteration
  return () => {
    seed = randomSeed()
  }
})

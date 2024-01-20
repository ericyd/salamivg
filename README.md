# SalamiVG ("Salami Vector Graphics")

A place to play with SVGs.

SalamiVG is a creative coding framework for JavaScript with a single render target: SVG.

<!-- TODO@v1 -->
## Heads up

This is in beta stage. I've been using it personally for a few weeks and it is pretty stable, but some things might change before v1.0

## Why?

I love [OPENRNDR](https://openrndr.org/) and wanted to see if I could make a generative art framework that ran in an interpretted language. I've never been a JVM guy, and even though I like Kotlin, it sounded appealing to me to be able to write generative art in a language I used every day: JavaScript.

Of course you may (reasonably) ask why I'm not just using p5.js, the dominant JavaScript framework for writing generative art. Well, I don't have a good answer to that. I suppose this is really "just for fun" `¯\_(ツ)_/¯`. (There is a [more detailed answer to this question in the Wiki](https://github.com/ericyd/salamivg/wiki/FAQ#why-not-p5js).)

## Installation

```
npm i --save @salamivg/core
```

If you use yarn and you can't automatically convert the above to the correct yarn command, then that's on you 😏

## Examples

There is [a Gallery page in the Wiki](https://github.com/ericyd/salamivg/wiki/Gallery) with some example renders and links to the code used to create them.

If you're the clone-n-run type, there are some additional examples in [the /sketch folder of this generative art repo](https://github.com/ericyd/generative-art/tree/57c17efb12df78fa5f4b5ab73adc6352a543cbbc/homegrown-svg/sketch). Assuming you have configured your `package.json` to declare `"type": "module"`, you can simply run as a normal Node script:

```js
node example.js
```

Here are some simple SVGs generated with SalamiVG

<details>

<summary>Concentric rings perturbated by a sine wave</summary>

```js
import { renderSvg, circle, hypot, vec2, map } from '@salamivg/core'

const config = {
  width: 100,
  height: 100,
  scale: 2,
  loopCount: 1,
}

renderSvg(config, (svg) => {
  // set basic SVG props
  svg.setBackground('#fff')
  svg.fill = null
  svg.stroke = '#000'
  svg.numericPrecision = 3

  // draw circle in middle of viewport
  svg.circle(
    circle({
      x: svg.center.x,
      y: svg.center.y,
      radius: hypot(svg.width, svg.height) * 0.04,
      'stroke-width': 1,
    }),
  )

  // draw 14 concentric rings around the center. (14 is arbitrary)
  const nRings = 14
  for (let i = 1; i <= nRings; i++) {
    // use `map` to linearly interpolate the radius on a log scale
    const baseRadius = map(
      0,
      Math.log(nRings),
      hypot(svg.width, svg.height) * 0.09,
      hypot(svg.width, svg.height) * 0.3,
      Math.log(i),
    )

    // as the rings get further from the center,
    // the path is increasingly perturbated by the sine wave.
    const sineInfluence = map(
      0,
      Math.log(nRings),
      baseRadius * 0.01,
      baseRadius * 0.1,
      Math.log(i),
    )

    svg.path((p) => {
      // the stroke width gets thinner as the rings get closer to the edge
      p.strokeWidth = map(1, nRings, 0.8, 0.1, i)

      // the radius varies because the path is perturbated by a sine wave
      const radius = (angle) => baseRadius + Math.sin(angle * 6) * sineInfluence
      p.moveTo(
        vec2(Math.cos(0) * radius(0), Math.sin(0) * radius(0)).add(svg.center),
      )

      // move our way around a circle to draw a smooth path
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        p.lineTo(
          vec2(
            Math.cos(angle) * radius(angle),
            Math.sin(angle) * radius(angle),
          ).add(svg.center),
        )
      }
      p.close()
    })
  }
})
```

</details>

![concentric circles example output](./examples/concentric-circles.svg)

<details>

<summary>Oscillator noise</summary>

SalamiVG ships with a bespoke noise function called "oscillator noise".

```js
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
} from '@salamivg/core'

const config = {
  width: 100,
  height: 100,
  scale: 3,
  loopCount: 1,
}

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
  const spectrum = ColorSequence.fromHexes(shuffle(colors, rng))

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
```

</details>

![oscillator noise example output](./examples/oscillator-noise.svg)

## Getting Started

[Please see the Wiki](https://github.com/ericyd/salamivg/wiki/Getting-Started)

## FAQ

[Please see the Wiki](https://github.com/ericyd/salamivg/wiki/FAQ)

## Design Philosophy

This lib is heavily inspired by [OPENRNDR](https://openrndr.org/), which means it utilizes the builder pattern extensively. My first attempt at writing my own SVG "framework" attempted to be much more functional, and I found the scripts to be really verbose and hard to follow. I think for the purpose of making art, imperative builder patterns are really nice.

TypeScript is used extensively for typechecking the lib, but the actual code is written in JavaScript with JSDocs. This was inspired by the SvelteKit team ([source 1](https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/), [source 2](https://github.com/sveltejs/kit/discussions/4429)) and I have to say it provides a lot of benefits. I didn't realize how much of my life I was losing to compilation times. That is time I could be spending looking at art!

## Development

Install dependencies:

```shell
npm i
```

Before committing:

```shell
npm run check:all
```

## Publishing

```shell
npm version minor
git push --tags && git push
./scripts/changelog.sh
npm login --registry https://registry.npmjs.org --scope=@salamivg
npm publish --access public
```

## Compatibility

I developed this with Node 20 but I'd bet money it works back to like Node 14 or so.

This library has been tested against
* Node 20.8.0
* Node 18.19.0
* Node 16.20.2
* I tried to test against Node 14 but [asdf](https://asdf-vm.com/) wouldn't install it on my M1 Mac and I didn't try to hard to fix it. Please open an issue if this is causing you problems.

### Deno / Bun?

Please open an issue if needed, although tbh I'd expect this to work fine with any JS runtime. The most modern JS feature this library uses is classes with private properties.

The one exception is the `renderSvg` function which uses `node` internal libraries such as `node:fs` and `node:path`. Happy to add similar functions for Deno or Bun if there's demand.

### ES Modules only

Is this a problem? Feel free to open an issue if you need commonjs. I think it would be trivial to set up rollup or similar to bundle into a commonjs package and include it in the exports, I just haven't done it because probably nobody will ever install this library.

## TODO

<!-- TODO@v1 -->
1. Finish "guide"

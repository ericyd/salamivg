/**
 * This is an implementation of the "Meandering Triangles" contour algorithm,
 * described by Bruce Hill here: https://blog.bruce-hill.com/meandering-triangles
 * A few changes were made to taste.
 * For a point-in-time reference, here are some benchmarks from my M1 Max MacBook Pro
 *
 * | TIN size | Threshold | Time  |
 * |          | count     |       |
 * |----------|-----------|-------|
 * | 414,534  | 10        | 0.7s  |
 * | 414,534  | 50        | 5.5s  |
 * | 414,534  | 100       | 15.3s |
 * | 45,968   | 10        | 0.1s  |
 * | 45,968   | 100       | 1.6s  |
 */
import { array, map } from '../util.js'
import { vec2, type Vector2 } from '../vector2.js'
import { type Vector3 } from '../vector3.js'

export type IntersectingLine = [Vector2, Vector2]
export type Triangle3 = [Vector3, Vector3, Vector3]
export type TIN = Triangle3[]
export type Contour = {
  line: IntersectingLine
  threshold: number
}
export type ContourParams = {
  /**
   * The TIN (Triangulated Irregular Network) to calculate contours for.
   */
  tin: TIN
  /**
   * How many thresholds to calculate contours for.
   * @default 10
   */
  thresholdCount?: number
  /**
   * Minimum "height" (z property of Vector3).
   * Thresholds will be evenly spaced between zMin and zMax.
   * @default -1
   */
  zMin?: number
  /**
   * Maximum "height" (z property of Vector3).
   * Thresholds will be evenly spaced between zMin and zMax.
   * @default -1
   */
  zMax?: number
  /**
   * When connecting contour segments, this is the maximum distance between two points for them to be considered the same point.
   * This might vary depending on the construction of your TIN, but generally it should remain fairly low.
   * @default 1
   */
  nearnessThreshold?: number
}

/**
 * Returns contour lines for the given TIN.
 * The return value is a map of threshold values to a list of contours.
 * This structure is useful if you want to color the contours based on the threshold value.
 *
 * @example
 *  // Render contours from a TIN, and color them based on their height.
 *  const spectrum = ColorSequence.fromColors([hsl(0, 0, 1), hsl(0, 0, 0)])
 *  const contourMap = contoursFromTIN({
 *    thresholdCount: 50,
 *    zMin: -1000,
 *    zMax: 1000,
 *    tin: [...],
 *    nearnessThreshold: 1,
 *  })
 *
 *  for (const [threshold, contourList] of contourMap.entries()) {
 *    for (const contours of contourList) {
 *      const contour = Path.fromPoints(contours, false, 'absolute')
 *      contour.fill = null
 *      contour.stroke = spectrum.at(map(zMin, zMax, 0, 1, threshold))
 *      contour.strokeWidth = 50
 *      svg.path(contour)
 *    }
 *  }
 *
 * @example
 *  // If you don't care about organizing segments by threshold, you can flatten the values into a single list
 *  const spectrum = ColorSequence.fromColors([hsl(0, 0, 1), hsl(0, 0, 0)])
 *  const contourMap = contoursFromTIN({
 *    thresholdCount: 50,
 *    zMin: -1000,
 *    zMax: 1000,
 *    tin: [...],
 *    nearnessThreshold: 1,
 *  })
 *  const contours = Array.from(contourMap.values()).flat(1)
 *
 *  for (const points of contours) {
 *    const contour = Path.fromPoints(points, false, 'absolute')
 *    contour.fill = null
 *    contour.stroke = spectrum.at(map(zMin, zMax, 0, 1, threshold))
 *    contour.strokeWidth = 50
 *    svg.path(contour)
 *  }
 */
export function contoursFromTIN({
  tin,
  thresholdCount = 10,
  zMin = -1,
  zMax = 1,
  nearnessThreshold = 1,
}: ContourParams): Map<number, Vector2[][]> {
  const thresholds = array(thresholdCount).map((i) =>
    map(0, thresholdCount - 1, zMin, zMax, i),
  )

  // this MUST be flatMapped to ensure we get an unordered list of contour segments for the given threshold
  // each segments represents an intersection of a single triangle.
  const segments = thresholds.flatMap((threshold) =>
    calcContour(threshold, tin),
  )

  return connectContourSegments(segments, nearnessThreshold)
}

function contourLine(vertices: Triangle3, threshold: number): Contour | null {
  const below = vertices.filter((v) => v.z < threshold)
  const above = vertices.filter((v) => v.z >= threshold)

  if (above.length === 0 || below.length === 0) {
    return null
  }

  const minority = below.length < above.length ? below : above
  const majority = below.length > above.length ? below : above

  // @ts-expect-error the array is initialized empty,
  // but visual inspection tells us it will contain IntersectingLine by the time it is returned.
  const contourPoints: IntersectingLine = []
  for (const [vMin, vMax] of [
    [minority[0], majority[0]],
    [minority[0], majority[1]],
  ]) {
    const howFar = (threshold - vMax.z) / (vMin.z - vMax.z)
    const crossingPoint = vec2(
      howFar * vMin.x + (1.0 - howFar) * vMax.x,
      howFar * vMin.y + (1.0 - howFar) * vMax.y,
    )
    contourPoints.push(crossingPoint)
  }
  return { line: contourPoints, threshold }
}

function calcContour(threshold: number, tin: TIN): Contour[] {
  return tin
    .map((triangle) => contourLine(triangle, threshold))
    .filter(Boolean) as Contour[]
}

function isNear(p1: Vector2, p2: Vector2, nearness = 1): boolean {
  return p1.distanceTo(p2) < nearness
}

function connectContourSegments(
  contours: Contour[],
  nearness?: number,
): Map<number, Vector2[][]> {
  const contourLines = new Map<number, Vector2[][]>()

  // partition the contour segments by threshold.
  // justification: we only want to connect segments which belong to the same threshold,
  // (i.e. avoid connecting segments which are spatially close but do not belong to the same threshold).
  // Also, this massively speeds up processing because it dramatically reduces the number of segments to search
  // through when looking for connecting segments.
  const contourMap = new Map<number, IntersectingLine[]>()
  for (let i = 0; i < contours.length; i++) {
    if (contourMap.has(contours[i].threshold)) {
      contourMap.get(contours[i].threshold)?.push(contours[i].line)
    } else {
      contourMap.set(contours[i].threshold, [contours[i].line])
    }
  }

  for (const [threshold, segments] of contourMap.entries()) {
    while (segments.length > 0) {
      // grab arbitrary segment
      const line: Vector2[] | undefined = segments.pop()
      if (!line) break

      while (true) {
        // find segments that join at the head of the line.
        // if we find a point that matches, we must take the other point from the segment, so
        // we continue to build a line moving forwards with no duplicate points.
        const firstMatchingSegmentIndex = segments.findIndex(
          (segment) =>
            isNear(line[0], segment[0], nearness) ||
            isNear(line[0], segment[1], nearness) ||
            isNear(line[line.length - 1], segment[0], nearness) ||
            isNear(line[line.length - 1], segment[1], nearness),
        )

        // when no matching segment exists, the line is complete.
        if (firstMatchingSegmentIndex === -1) {
          if (line.length > 5) {
            if (contourLines.has(threshold)) {
              contourLines.get(threshold)?.push(line)
            } else {
              contourLines.set(threshold, [line])
            }
          }
          break
        }

        const match = segments[firstMatchingSegmentIndex]

        // Note: in all "cases" below, the phrase "connects to" means the points are functionally equivalent,
        // and therefore do not need to be duplicated in the resulting contour.
        // case: match[0] connects to line[0]; unshift match[1]
        if (isNear(match[0], line[0], nearness)) {
          line.unshift(match[1])
        }
        // case: match[1] connects to line[0]; unshift match[0]
        else if (isNear(match[1], line[0], nearness)) {
          line.unshift(match[0])
        }
        // case: match[0] connects to line[-1]; push match[1]
        else if (isNear(match[0], line[line.length - 1], nearness)) {
          line.push(match[1])
        }
        // case: match[1] connects to line[-1]; push match[0]
        else if (isNear(match[1], line[line.length - 1], nearness)) {
          line.push(match[0])
        }

        // removing the matching segment from the list to prevent duplicate connections
        segments.splice(firstMatchingSegmentIndex, 1)
      }
    }
  }

  return contourLines
}

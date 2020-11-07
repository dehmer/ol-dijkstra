/**
  2525C: 2.X.2.5.2.1.4.1
  TACGRP.C2GM.OFF.LNE.AXSADV.GRD.MANATK
*/

import * as R from 'ramda'
import { Style, Text } from 'ol/style'
import * as TS from './ts'
import { transform } from './utm'

const arrowPoints = (width, line) => {
  const segments = R.aperture(2, TS.coordinates([line])).map(TS.lineSegment)
  const lastSegment = R.last(segments)
  const angle = lastSegment.angle()

  const median = (() => {
    const p1 = TS.point(lastSegment.p1)
    const p0 = TS.translate(angle, p1)(width)
    return TS.lineString([p0, p1].map(TS.coordinate))
  })()

  const longitudes = [-1, -0.5, 0.5, 1]
    .map(f => f * width)
    .map(TS.translate(angle + Math.PI / 2, median))

  const equator = TS.lineString(R.props([0, 3], longitudes).map(TS.endCoordinate))

  const latitudes = [3/4, 3/8]
    .map(f => f * width)
    .map(TS.translate(angle, equator))

  return TS.coordinates([
    TS.endPoint(line),
    TS.startPoint(latitudes[0]),
    TS.endPoint(latitudes[0]),
    TS.intersection([latitudes[0], longitudes[1]]),
    TS.intersection([latitudes[0], longitudes[2]]),
    TS.intersection([latitudes[1], median]),
    TS.intersection([latitudes[0], median])
  ])
}

const G_G_OLAGM = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowPoints(width, line)
  const arrow = TS.polygon(R.props([0, 2, 4, 5, 3, 1, 0], aps))
  const arrowBoundary = TS.polygon(R.props([0, 2, 1, 0], aps))

  // Shorten last center line segment to arrow base and calculate buffer.
  // NOTE: Buffer is slightly increased by 1 meter, so union with
  // arrow does not produce gaps.
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[6]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const corridor = TS.difference([
    TS.union([buffer, arrowBoundary]).getBoundary(),
    TS.pointBuffer(TS.startPoint(line))(width / 2)
  ])

  return [
    styles.outline(convert(corridor)),
    styles.outline(convert(arrow)),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line))))
  ].flat()
}

// Similar to G_G_OLAGM.
const G_G_OLAGS = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowPoints(width, line)
  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[6]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const corridor = TS.difference([
    TS.union([buffer, arrow]).getBoundary(),
    TS.pointBuffer(TS.startPoint(line))(width / 2)
  ])

  return [
    styles.outline(convert(corridor)),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line))))
  ].flat()
}

// Counterattack
const G_T_K = options => {
  const { width, line, point, convert, styles, resolution } = options
  const aps = arrowPoints(width, line)
  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[6]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const corridor = TS.difference([
    TS.union([buffer, arrow]).getBoundary(),
    TS.pointBuffer(TS.startPoint(line))(width / 2)
  ])

  const linePoints = TS.coordinates([line])
  const lastSegment = R.last(R.aperture(2, linePoints).map(TS.lineSegment))
  const angle = Math.PI - lastSegment.angle()
  const font = `${width / resolution / 2}px sans-serif`
  const flip = α => α > Math.PI / 2 && α < 3 * Math.PI / 2

  return [
    styles.outline(convert(corridor), { lineDash: [12, 10] }),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line)))),
    new Style({
      geometry: convert(TS.point(aps[6])),
      text: new Text({
        font,
        textAlign: flip(angle) ? 'start' : 'end',
        offsetX: flip(angle) ? -10 : 10,
        rotation: flip(angle) ? angle - Math.PI : angle,
        text: 'CATK'
      })
    })
  ].flat()
}

// G_G_OLAGS with nasty crossing in first segment.
const G_G_OLAA = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowPoints(width, line)
  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[6]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const linePoints = TS.coordinates([line])
  const segments = R.aperture(2, linePoints).map(TS.lineSegment)

  const cutpoint = linePoints.length === 2
    ? TS.point(linePoints[0])
    : TS.point(linePoints[linePoints.length - 2])

  const cutline = (() => {
    const bisector = (a, b) => (a.angle() + b.angle()) / 2
    const angle = segments.length === 1
      ? segments[0].angle()
      : bisector(segments[segments.length - 1], segments[segments.length - 2])

    return TS.lineString(TS.coordinates([
      TS.translate(angle + Math.PI / 2, cutpoint)(width),
      TS.translate(angle - Math.PI / 2, cutpoint)(width)
    ]))
  })()

  const crossing = (() => {
    const [p1, p2] = TS.coordinates([TS.intersection([buffer.getBoundary(), cutline])])
    const a = TS.lineString([p1, aps[3]])
    const b = TS.lineString([p2, aps[4]])
    if (a.intersects(b)) return TS.union([a, b])
    else return TS.union([
      TS.lineString([p1, aps[4]]),
      TS.lineString([p2, aps[3]])
    ])
  })()

  const cutout = TS
    .geometryCollection([cutline, TS.point(aps[3]), TS.point(aps[4])])
    .convexHull()

  const body = TS.union([buffer, arrow]).getBoundary()
  const opening = TS.pointBuffer(TS.startPoint(line))(width / 2)
  const corridor = TS.union([
    TS.difference([body, cutout, opening]),
    crossing
  ])

  return [
    styles.outline(convert(corridor)),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line))))
  ].flat()
}

export const style = fn => options => {
  const { feature } = options
  const geometry = feature.getGeometry().clone()
  const { toUTM, fromUTM } = transform(geometry.getGeometries()[1])
  const [line, point] = TS.geometries(TS.read(toUTM(geometry)))

  // Calculate corridor width:
  const width = 2 * TS.lineSegment([
    TS.startPoint(line),
    point
  ].map(TS.coordinate)).getLength()

  return fn({
    ...options,
    width, line, point,
    convert: R.compose(fromUTM, TS.write)
  })
}

export const corridors = {
  'G*G*OLAGM-': style(G_G_OLAGM),
  'G*G*OLAGS-': style(G_G_OLAGS),
  'G*G*OLAA--': style(G_G_OLAA),
  'G*T*K-----': style(G_T_K)
}

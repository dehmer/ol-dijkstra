/**
  2525C: 2.X.2.5.2.1.4.1
  TACGRP.C2GM.OFF.LNE.AXSADV.GRD.MANATK
*/

import * as R from 'ramda'
import { Style, Text, Fill } from 'ol/style'
import * as TS from './ts'
import { transform } from './utm'

const arrowCoordinates = (width, line) => {
  const [p0, p1] = R.last(R.aperture(2, TS.coordinates([line])))
  const segment = TS.lineSegment([p0, p1])
  const angle = segment.angle()

  return xs => xs
    .map(([dx, dy]) => [-dx * width, dy * width])
    .map(([dx, dy]) => [Math.sqrt(dx * dx + dy * dy), angle - Math.atan2(dy, dx)])
    .map(([c, α]) => new TS.Coordinate(p1.x + Math.cos(α) * c, p1.y + Math.sin(α) * c))
}

const G_G_OLAGM = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowCoordinates(width, line)([
    [0, 0],
    [3/4, 1],
    [3/4, 1/2],
    [3/8, 0],
    [3/4, -1/2],
    [3/4, -1],
    [3/4, 0]
  ])

  const arrow = TS.polygon(R.props([0, 1, 2, 3, 4, 5, 0], aps))
  const arrowBoundary = TS.polygon(R.props([0, 1, 5, 0], aps))

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
  const aps = arrowCoordinates(width, line)([
    [0, 0], [3/4, 1], [3/4, -1], [3/4, 0]
  ])

  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
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

const G_G_PA = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowCoordinates(width, line)([
    [10/26, 0], [30/26, 1], [30/26, -1], [30/26, 0],
    [23/26, 30/26], [0, 0], [23/26, -30/26]
  ])

  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const corridor = TS.difference([
    TS.union([buffer, arrow]).getBoundary(),
    TS.pointBuffer(TS.startPoint(line))(width / 2)
  ])

  return [
    styles.outline(convert(corridor)),
    styles.outline(convert(TS.lineString(R.props([4, 5, 6], aps))), { lineDash: [12, 10] }),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line))))
  ].flat()
}

// Counterattack
const G_T_K = options => {
  const { width, line, point, convert, styles, resolution } = options
  const aps = arrowCoordinates(width, line)([
    [0, 0], [3/4, 1], [3/4, -1], [3/4, 0]
  ])

  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
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
      geometry: convert(TS.point(aps[3])),
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

// Counterattack by Fire
const G_T_KF = options => {
  const { width, line, point, convert, styles, resolution } = options
  const aps = arrowCoordinates(width, line)([
    [28/26, 0], [48/26, 1], [48/26, -1], [48/26, 0],
    [37/26, 41/26], [15/26, 1], [15/26, -1], [37/26, -41/26],
    [15/26, 0], [5/26, 0],
    [0, 0], [5/26, 3/26], [5/26, -3/26]
  ])

  const arrow = TS.polygon(R.props([0, 2, 1, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
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
    styles.outline(convert(TS.lineString(R.props([4, 5, 6, 7], aps))), { lineDash: [12, 10] }),
    styles.outline(convert(TS.lineString(R.props([8, 9], aps))), { lineDash: [12, 10] }),
    styles.dashed(convert(line)),
    styles.handles(convert(point)),
    styles.handles(convert(TS.multiPoint(TS.linePoints(line)))),
    new Style({
      geometry: convert(TS.point(aps[3])),
      text: new Text({
        font,
        textAlign: flip(angle) ? 'start' : 'end',
        offsetX: flip(angle) ? -10 : 10,
        rotation: flip(angle) ? angle - Math.PI : angle,
        text: 'CATK'
      })
    }),
    new Style({
      geometry: convert(TS.polygon(R.props([10, 11, 12, 10], aps))),
      fill: new Fill({ color: 'black' })
    })
  ].flat()
}

// G_G_OLAGS with nasty crossing in first segment.
const G_G_OLAA = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowCoordinates(width, line)([
    [0, 0], [3/4, 1], [3/4, 1/2], [3/4, 0], [3/4, -1/2], [3/4, -1]
  ])

  const arrow = TS.polygon(R.props([0, 1, 5, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const linePoints = TS.coordinates([line])

  const cutpoint = linePoints.length === 2
    ? TS.point(linePoints[0])
    : TS.point(linePoints[linePoints.length - 2])

  const segments = R.aperture(2, linePoints).map(TS.lineSegment)
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
    const a = TS.lineString([p1, aps[2]])
    const b = TS.lineString([p2, aps[4]])
    if (a.intersects(b)) return TS.union([a, b])
    else return TS.union([
      TS.lineString([p1, aps[4]]),
      TS.lineString([p2, aps[2]])
    ])
  })()

  const cutout = TS
    .geometryCollection([cutline, TS.point(aps[2]), TS.point(aps[4])])
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

// AXIS OF ADVANCE - ATTACK, ROTARY WING
const G_G_OLAR = options => {
  const { width, line, point, convert, styles } = options
  const aps = arrowCoordinates(width, line)([
    [0, 0], [3/4, 1], [3/4, 1/2], [3/4, 0], [3/4, -1/2], [3/4, -1]
  ])

  const arrow = TS.polygon(R.props([0, 1, 5, 0], aps))
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[3]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const linePoints = TS.coordinates([line])

  const cutpoint = linePoints.length === 2
    ? TS.point(linePoints[0])
    : TS.point(linePoints[linePoints.length - 2])

  const segments = R.aperture(2, linePoints).map(TS.lineSegment)
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

  const [p1, p2] = TS.coordinates([TS.intersection([buffer.getBoundary(), cutline])])
  var a = TS.lineString([p1, aps[2]])
  var b = TS.lineString([p2, aps[4]])
  if (!a.intersects(b)) {
    a = TS.lineString([p1, aps[4]])
    b = TS.lineString([p2, aps[2]])
  }

  const crossing = TS.union([a, b])
  const intersection = a.intersection(b)

  const xyz = TS.lineSegment([aps[2], aps[4]])
  const mp = xyz.midPoint()
  const [tx, ty] = [
    mp.x - intersection.getCoordinate().x,
    mp.y - intersection.getCoordinate().y
  ]

  xyz.p0 = new TS.Coordinate(xyz.p0.x - tx, xyz.p0.y - ty)
  xyz.p1 = new TS.Coordinate(xyz.p1.x - tx, xyz.p1.y - ty)

  if (xyz.angle() < 0) xyz.reverse()
  const lineClone = line.copy()
  const abc_1 = xyz.toGeometry(TS.geometryFactory)
  const abc_x = TS.lineSegment([R.head(R.drop(1, lineClone.getCoordinates().reverse())), aps[3]]).toGeometry(TS.geometryFactory)
  const abc_2 = TS.translate(xyz.angle() + Math.PI / 2, abc_1)(abc_x.getLength() * 0.2)
  const abc_3 = TS.translate(xyz.angle() + Math.PI / 2, abc_1)(-abc_x.getLength() * 0.2)

  const acs = arrowCoordinates(width, xyz.toGeometry(TS.geometryFactory))([
    [5/26, 5/26], [0, 0], [5/26, -5/26],
    [1, 5/26], [1, -5/26]
  ])

  const cutout = TS
    .geometryCollection([cutline, TS.point(aps[2]), TS.point(aps[4])])
    .convexHull()

  const body = TS.union([buffer, arrow]).getBoundary()
  const opening = TS.pointBuffer(TS.startPoint(line))(width / 2)
  const corridor = TS.union([
    TS.difference([body, cutout, opening]),
    crossing,
    TS.union([
      abc_1,
      TS.lineString(R.props([0, 1, 2], acs)),
      TS.lineString(R.props([3, 4], acs)),
      TS.lineString((abc_2.intersection(crossing)).getCoordinates()),
      TS.lineString((abc_3.intersection(crossing)).getCoordinates())
    ])
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
  'G*G*PA----': style(G_G_PA),
  'G*G*OLAA--': style(G_G_OLAA),
  'G*G*OLAR--': style(G_G_OLAR),
  'G*T*K-----': style(G_T_K),
  'G*T*KF----': style(G_T_KF)
}

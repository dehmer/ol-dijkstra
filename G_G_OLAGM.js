/**
  2525C: 2.X.2.5.2.1.4.1
  TACGRP.C2GM.OFF.LNE.AXSADV.GRD.MANATK
*/

import * as R from 'ramda'
import * as TS from './ts'
import { transform } from './utm'
import { createDefaultStyle, createErrorStyle } from './style'

const defaultGeometry = options => {
  const { width, line, convert } = options

  { // geometry is considered invalid when last segment is too short (< width):
    const segments = R.aperture(2, TS.coordinates([line])).map(TS.lineSegment)
    const lastSegment = R.last(segments)
    if (lastSegment.getLength() < width) throw new Error('invalid geometry: last segment')
  }

  const buffers = [width / 2, width].map(TS.lineBuffer(line))
  const circles = (() => {
    const r1 = width / 2 / Math.cos(Math.atan(3 / 2))
    const r2 = width / Math.cos(Math.atan(3 / 4))
    return [r1, r2, r2 - r1].map(TS.circleBuffer(TS.endPoint(line)))
  })()

  const arrowPoints = TS.coordinates([
    TS.endPoint(line),
    TS.intersection(TS.boundaries([buffers[0], circles[0]])),
    TS.intersection(TS.boundaries([buffers[1], circles[1]])),
    TS.intersection([line, TS.boundary(circles[2])]),
  ])

  if (arrowPoints.length !== 6) throw new Error('invalid geometry: circle intersections')

  const arrowOuter = TS.polygon(R.props([1, 3, 0, 4, 2, 1], arrowPoints))
  const arrowInner = TS.lineString(R.props([1, 5, 2], arrowPoints))
  const corridor = TS.union([
    // NOTE: might lead to TopologyException for malformed arrow
    TS.geometry0(TS.difference([buffers[0], arrowOuter])),
    arrowOuter.buffer(1),
  ])

  // TODO: include center line and width point in edit mode
  const geometry = TS.geometryCollection([corridor, arrowInner])
  return createDefaultStyle({ geometry: convert(geometry) })
}

const backupGeometry = (err, options) => {
  console.error(err)
  const { line, point, convert } = options
  return createErrorStyle({ geometry: convert(TS.geometryCollection([line, point])) })
}

export const style = (feature, resolution) => {
  const geometry = feature.getGeometry().clone()
  const { toUTM, fromUTM } = transform(geometry.getGeometries()[1])
  const [line, point] = TS.geometries(TS.read(toUTM(geometry)))

  // Calculate corridor width:
  const width = 2 * TS.lineSegment([
    TS.startPoint(line),
    point
  ].map(TS.coordinate)).getLength()

  const options = { width, line, point, convert: R.compose(fromUTM, TS.write) }
  return R.tryCatch(defaultGeometry)(backupGeometry)(options)
}

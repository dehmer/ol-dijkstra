/**
  2525C: 2.X.2.5.2.1.4.1
  TACGRP.C2GM.OFF.LNE.AXSADV.GRD.MANATK
*/

import Feature from 'ol/Feature'
import * as R from 'ramda'
import * as TS from './ts'
import { zoneCode } from './utm'

const K = v => fn => { fn(v); return v }
const circleBuffer = TS.buffer()
const lineBuffer = TS.buffer({
  joinStyle: TS.BufferParameters.JOIN_BEVEL,
  endCapStyle: TS.BufferParameters.CAP_FLAT,
})

export const map = feature => {
  const utmCode = zoneCode(feature.getGeometry().getGeometries()[1].getCoordinates())
  const geometry = K(feature.getGeometry().clone())(geometry => {
    geometry.transform('EPSG:3857', utmCode)
  })

  const [line, point] = TS.geometries(TS.read(geometry))

  // Calculate corridor width:
  const width = 2 * TS.lineSegment([
    TS.startPoint(line),
    point
  ].map(TS.coordinate)).getLength()

  const buffers = [width / 2, width].map(lineBuffer(line))
  const circles = (() => {
    const r1 = width / 2 / Math.cos(Math.atan(3 / 2))
    const r2 = width / Math.cos(Math.atan(3 / 4))
    return [r1, r2, r2 - r1].map(circleBuffer(TS.endPoint(line)))
  })()

  const cs = TS.coordinates([
    TS.endPoint(line),
    TS.intersection(TS.boundaries([buffers[0], circles[0]])),
    TS.intersection(TS.boundaries([buffers[1], circles[1]])),
    TS.intersection([line, TS.boundary(circles[2])]),
  ])

  const arrow = TS.polygon(R.props([1, 3, 0, 4, 2, 1], cs))
  const corridor = TS.geometryCollection([
    TS.union([
      TS.geometry0(TS.difference([
        buffers[0],
        arrow
      ])),
      // TODO: add minimal buffer to form proper union with corridor
      arrow
    ]),
    TS.lineString(R.props([1, 5, 2], cs))
  ])

  return new Feature({ geometry: TS.write(corridor).transform(utmCode, 'EPSG:3857') })
}
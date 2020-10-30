/**
  2525C:
  TACGRP.C2GM.OFF.LNE.AXSADV.GRD.SUPATK
  2.X.2.5.2.1.4.2

  TACTICAL GRAPHICS
  COMMAND AND CONTROL AND GENERAL MANEUVER
  OFFENSE
  LINES
  AXIS OF ADVANCE
  GROUND
  SUPPORTING ATTACK
*/

import Feature from 'ol/Feature'
import * as R from 'ramda'
import * as TS from './ts'

const circleBuffer = TS.buffer()
const lineBuffer = TS.buffer({
  joinStyle: TS.BufferParameters.JOIN_BEVEL,
  endCapStyle: TS.BufferParameters.CAP_FLAT,
})

export const map = width => feature => {
  const r1 = width / 2 / Math.cos(Math.atan(3/2))
  const r2 = width / Math.cos(Math.atan(3/4))
  const geometry = feature.getGeometry()
  const line = TS.read(geometry)
  const buffer = [width / 2, width].map(lineBuffer(line))
  const circle = [r1, r2].map(circleBuffer(TS.endPoint(line)))
  const coordinates = TS.coordinates([
    TS.endPoint(line),
    TS.intersection(TS.boundaries([buffer[0], circle[0]])),
    TS.intersection(TS.boundaries([buffer[1], circle[1]]))
  ])

  const arrow = TS.polygon(R.props([1, 3, 0, 4, 2, 1], coordinates))
  const corridor = TS.union([
    TS.geometry0(TS.difference([
      buffer[0],
      arrow
    ])),
    // add minimal buffer to form proper union with corridor
    arrow.buffer(1)
  ])

  return new Feature({ geometry: TS.write(corridor) })
}
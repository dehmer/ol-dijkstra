import * as R from 'ramda'
import * as TS from '../ts'
import { arrowCoordinates } from './arrow'

export default options => {
  const { width, line, point, styles } = options
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
    styles.solidLine(corridor),
    styles.wireFrame(line),
    styles.handles(TS.multiPoint([point, ...TS.linePoints(line)]))
  ]
}

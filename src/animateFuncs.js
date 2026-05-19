import { Instance } from 'cooljs'
import { blockAction, blockPainter } from './block'
import {
  checkMoveDown,
  getMoveDownValue,
  drawYellowString,
  getAngleBase
} from './utils'
import { addFlight } from './flight'
import * as constant from './constant'

export const endAnimate = (engine) => {
  const gameStartNow = engine.getVariable(constant.gameStartNow)
  if (!gameStartNow) return
  const successCount = engine.getVariable(constant.successCount, 0)
  const failedCount = engine.getVariable(constant.failedCount)
  const gameScore = engine.getVariable(constant.gameScore, 0)
  const threeFiguresOffset = Number(successCount) > 99 ? engine.width * 0.1 : 0

  const { ctx } = engine
  const padding = engine.width * 0.015
  const boxW = engine.width * 0.22
  const boxH = engine.height * 0.1
  const topY = engine.height * 0.01
  const labelSize = engine.width * 0.045
  const numSize = engine.width * 0.085

  // Draw semi-transparent background boxes
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.strokeStyle = 'rgba(204, 255, 0, 0.4)'
  ctx.lineWidth = 1
  // Left box - floor
  ctx.beginPath()
  ctx.roundRect(padding, topY, boxW, boxH, 6)
  ctx.fill()
  ctx.stroke()
  // Right box - score
  ctx.beginPath()
  ctx.roundRect(engine.width - boxW - padding, topY, boxW, boxH, 6)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // Floor label + number
  drawYellowString(engine, {
    string: 'FLOOR',
    size: labelSize,
    x: padding + boxW * 0.5,
    y: topY + boxH * 0.38,
    textAlign: 'center',
    fontName: 'Arial',
    fontWeight: 'bold'
  })
  drawYellowString(engine, {
    string: successCount,
    size: numSize,
    x: padding + boxW * 0.5,
    y: topY + boxH * 0.92,
    textAlign: 'center',
    fontName: 'Arial',
    fontWeight: 'bold'
  })

  // Score label + number
  drawYellowString(engine, {
    string: 'SCORE',
    size: labelSize,
    x: engine.width - boxW * 0.5 - padding,
    y: topY + boxH * 0.38,
    textAlign: 'center',
    fontName: 'Arial',
    fontWeight: 'bold'
  })
  drawYellowString(engine, {
    string: gameScore,
    size: numSize,
    x: engine.width - boxW * 0.5 - padding,
    y: topY + boxH * 0.92,
    textAlign: 'center',
    fontName: 'Arial',
    fontWeight: 'bold'
  })
  
  // Draw hearts removed as requested
}

export const startAnimate = (engine) => {
  const gameStartNow = engine.getVariable(constant.gameStartNow)
  if (!gameStartNow) return
  const lastBlock = engine.getInstance(`block_${engine.getVariable(constant.blockCount)}`)
  if (!lastBlock || [constant.land, constant.out].indexOf(lastBlock.status) > -1) {
    if (checkMoveDown(engine) && getMoveDownValue(engine)) return
    if (engine.checkTimeMovement(constant.hookUpMovement)) return
    const angleBase = getAngleBase(engine)
    const initialAngle = (Math.PI
        * engine.utils.random(angleBase, angleBase + 5)
        * engine.utils.randomPositiveNegative()
    ) / 180
    engine.setVariable(constant.blockCount, engine.getVariable(constant.blockCount) + 1)
    engine.setVariable(constant.initialAngle, initialAngle)
    engine.setTimeMovement(constant.hookDownMovement, 500)
    const block = new Instance({
      name: `block_${engine.getVariable(constant.blockCount)}`,
      action: blockAction,
      painter: blockPainter
    })
    engine.addInstance(block)
  }
  const successCount = Number(engine.getVariable(constant.successCount, 0))
  switch (successCount) {
    case 2:
      addFlight(engine, 1, 'leftToRight')
      break
    case 6:
      addFlight(engine, 2, 'rightToLeft')
      break
    case 8:
      addFlight(engine, 3, 'leftToRight')
      break
    case 14:
      addFlight(engine, 4, 'bottomToTop')
      break
    case 18:
      addFlight(engine, 5, 'bottomToTop')
      break
    case 22:
      addFlight(engine, 6, 'bottomToTop')
      break
    case 25:
      addFlight(engine, 7, 'rightTopToLeft')
      break
    default:
      break
  }
}


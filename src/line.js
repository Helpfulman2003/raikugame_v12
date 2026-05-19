import { getMoveDownValue, getLandBlockVelocity } from './utils'
import * as constant from './constant'

export const lineAction = (instance, engine, time) => {
  const i = instance
  if (!i.ready) {
    let offset = engine.getVariable(constant.lineInitialOffset)
    if (!offset) offset = engine.height * 0.8
    i.y = offset
    i.lineStartY = offset  // anchor for move-down animation
    i.ready = true
    i.collisionX = engine.width - engine.getVariable(constant.blockWidth)
  }
  if (engine.checkTimeMovement(constant.moveDownMovement)) {
    // Animation running — use fixed anchor
    const moveDownDelta = getMoveDownValue(engine, { pixelsPerFrame: s => s / 2 })
    const lineAnchor = instance.lineStartY !== undefined ? instance.lineStartY : instance.y
    engine.getTimeMovement(
      constant.moveDownMovement,
      [[lineAnchor, lineAnchor + moveDownDelta]],
      (value) => {
        instance.y = value
      },
      {
        name: 'line'
      }
    )
  } else {
    // Animation ended — update anchor to current resting Y
    instance.lineStartY = instance.y
  }
  const landBlockVelocity = getLandBlockVelocity(engine, time)
  instance.x += landBlockVelocity
  instance.collisionX += landBlockVelocity
}

export const linePainter = (instance, engine) => {
  // Ground line removed during gameplay per user request
}


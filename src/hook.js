import { getSwingBlockVelocity } from './utils'
import * as constant from './constant'

export const hookAction = (instance, engine, time) => {
  const ropeHeight = engine.getVariable(constant.ropeHeight)
  if (!instance.ready) {
    instance.x = engine.width / 2
    instance.y = ropeHeight * 0.5
    instance.ready = true
  }
  
  // Raiku flies horizontally
  const amplitude = engine.width * 0.4
  instance.x = (engine.width / 2) + getSwingBlockVelocity(engine, time) * amplitude
  
  instance.weightX = instance.x
  instance.weightY = instance.y
}

export const hookPainter = (instance, engine) => {
  // Empty because the 3D Raiku is rendered in Three.js canvas instead
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// 滑动位移 → 高度/倾斜目标。dy 为两次 move 的纵向增量(上滑为负)
export function mapDrag(dy, sensitivity = 0.05) {
  const height = -dy * sensitivity
  const tilt = clamp(height * 0.12, -0.5, 0.5)
  return { height, tilt }
}

// 绑定单指滑动(用 Pointer Events,鼠标/触摸/笔通用);onMove(dy) 位移增量回调
// 页面滚动的阻止交给 CSS `touch-action: none`(见 style.css),这里不用 preventDefault
export class TouchControl {
  constructor(element, { onMove } = {}) {
    this.element = element
    this.onMove = onMove
    this.lastY = null
    this._down = this._onDown.bind(this)
    this._move = this._onMove.bind(this)
    this._up = this._onUp.bind(this)
    element.addEventListener('pointerdown', this._down)
    element.addEventListener('pointermove', this._move)
    element.addEventListener('pointerup', this._up)
    element.addEventListener('pointercancel', this._up)
  }

  _onDown(e) {
    if (this.lastY !== null) return // 已有指针按住,忽略多点
    this.lastY = e.clientY
    this.element.setPointerCapture?.(e.pointerId)
  }

  _onMove(e) {
    if (this.lastY === null) return
    const dy = e.clientY - this.lastY
    this.lastY = e.clientY
    if (this.onMove) this.onMove(dy)
  }

  _onUp() {
    this.lastY = null
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this._down)
    this.element.removeEventListener('pointermove', this._move)
    this.element.removeEventListener('pointerup', this._up)
    this.element.removeEventListener('pointercancel', this._up)
  }
}

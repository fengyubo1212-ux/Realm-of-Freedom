// 加载页 + 音乐开关按钮
export class Overlay {
  constructor({ musicEnabled = false, onToggleMusic = null } = {}) {
    this.loader = document.createElement('div')
    this.loader.className = 'overlay-loader'
    this.loader.textContent = '正在起飞…'
    document.body.appendChild(this.loader)

    if (musicEnabled && onToggleMusic) {
      this.musicBtn = document.createElement('button')
      this.musicBtn.className = 'overlay-music'
      this.musicBtn.textContent = '♪'
      this.musicBtn.addEventListener('click', onToggleMusic)
      document.body.appendChild(this.musicBtn)
    }
  }

  hide() {
    this.loader.classList.add('hidden')
  }
}

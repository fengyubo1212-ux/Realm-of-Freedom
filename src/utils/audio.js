// 背景音乐;src 为空时所有操作静默,不报错
export class MusicController {
  constructor(src) {
    this.audio = src ? new Audio(src) : null
    if (this.audio) {
      this.audio.loop = true
      this.audio.preload = 'auto'
    }
    this.playing = false
  }

  toggle() {
    if (!this.audio) return false
    if (this.playing) {
      this.audio.pause()
    } else {
      this.audio.play().catch(() => {})
    }
    this.playing = !this.playing
    return this.playing
  }
}

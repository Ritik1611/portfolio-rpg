import Phaser from 'phaser'
import { loadSave } from '../config'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  create() {
    this.registry.set('save', loadSave())
    this.scene.start('Preload')
  }
}

import { Tag } from './tag'

export class Defs extends Tag {
  constructor() {
    super('defs')
  }

  /**
   * @param {Tag} child
   */
  addDefinition(child) {
    return super.addChild(child)
  }
}

export function defs() {
  return new Defs()
}

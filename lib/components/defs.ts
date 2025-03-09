import { Tag } from './tag'

export class Defs extends Tag {
  constructor() {
    super('defs')
  }

  addDefinition(child: Tag) {
    return super.addChild(child)
  }
}

export function defs() {
  return new Defs()
}

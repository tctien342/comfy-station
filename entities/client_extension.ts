import { Collection, Entity, ManyToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import { v4 } from 'uuid'
import type { Client } from './client'

export interface IInputNumberConfig {
  default: number
  min: number
  max: number
  step?: number
  round?: number
}
export interface IInputStringConfig {
  default?: string
  multiline?: boolean
  dynamicPrompts?: boolean
}

export type TStringInput = ['STRING', IInputStringConfig]
export type TBoolInput = ['BOOLEAN', { default: boolean }]
export type TNumberInput = ['INT' | 'FLOAT', IInputNumberConfig]

@Entity()
@Unique({ properties: ['pythonModule', 'name'] })
export class Extension {
  @PrimaryKey({ type: 'string' })
  id = v4()

  @Property({ type: 'string' })
  name: string

  @Property({ type: 'string' })
  displayName: string

  @Property({ type: 'string', nullable: true })
  description?: string

  @Property({ type: 'string', index: true })
  pythonModule: string

  @Property({ type: 'string', index: true })
  category: string

  @Property({ type: 'boolean', default: false })
  outputNode!: boolean

  @Property({ type: 'json', nullable: true })
  inputConf?: { [key: string]: [string[]] | [string] | TBoolInput | TNumberInput }

  @Property({ type: 'json', nullable: true })
  outputConf?: { output: string; isList: boolean; name: string }[]

  @Property({ type: 'timestamp' })
  createdAt = new Date()

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updateAt = new Date()

  @ManyToMany('Client', 'extensions', { index: true })
  clients = new Collection<Client>(this)

  constructor(name: string, displayName: string, pythonModule: string, category: string) {
    this.name = name
    this.displayName = displayName
    this.pythonModule = pythonModule
    this.category = category
  }
}

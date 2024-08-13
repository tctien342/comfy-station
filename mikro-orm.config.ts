import { defineConfig } from '@mikro-orm/better-sqlite'
import { Node } from './entities/node'

export default defineConfig({
  entities: [Node],
  dbName: 'db.comfyui.manager'
})

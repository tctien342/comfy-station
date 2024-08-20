import { defineConfig } from '@mikro-orm/better-sqlite'
import { Client } from './entities/client'
import { ClientStatusEvent } from './entities/client_status_event'
import { ClientMonitorEvent } from './entities/client_monitor_event'
import { ClientMonitorGpu } from './entities/client_monitor_gpu'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { TokenPermission } from './entities/token_permission'
import { Token } from './entities/token'
import { User } from './entities/user'
import { WorkflowEditEvent } from './entities/workflow_edit_event'
import { Workflow } from './entities/workflow'
import { WorkflowTask } from './entities/workflow_task'
import { WorkflowTaskEvent } from './entities/workflow_task_event'
import { Extension } from './entities/extension'
import { ClientActionEvent } from './entities/client_action_event'
import { Job } from './entities/job'
import { JobItem } from './entities/job_item'
import { TokenShared } from './entities/token_shared'

export default defineConfig({
  entities: [
    ClientActionEvent,
    ClientMonitorGpu,
    ClientMonitorEvent,
    ClientStatusEvent,
    Client,
    Extension,
    Job,
    JobItem,
    User,
    Token,
    TokenShared,
    TokenPermission,
    Workflow,
    WorkflowTask,
    WorkflowTaskEvent,
    WorkflowEditEvent
  ],
  dbName: 'comfyui.manager.db',
  metadataProvider: TsMorphMetadataProvider
})

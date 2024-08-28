export enum EAuthMode {
  Basic = 'Basic',
  None = 'None'
}

export enum EWorkflowEditType {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Deactive = 'Deactive',
  Active = 'Active'
}

export enum ETaskStatus {
  Queuing = 'Queuing',
  Pending = 'Pending',
  Running = 'Running',
  Success = 'Success',
  Failed = 'Failed'
}

export enum ETokenType {
  Web = 'Web',
  Api = 'Api',
  Both = 'Both'
}

export enum EWorkflowActiveStatus {
  Deleted = 'Deleted',
  Activated = 'Activated',
  Deactivated = 'Deactivated'
}

export enum EUserRole {
  Admin = 5,
  Editor = 4,
  User = 3
}

export enum ETriggerBy {
  User = 'User',
  Token = 'Token',
  System = 'System',
  Job = 'Job'
}

export enum EValueType {
  File = 'File',
  /**
   * Seed is a value that is used to generate, change when re-run a task.
   */
  Seed = 'Seed',
  String = 'String',
  Number = 'Number',
  Image = 'Image',
  Boolean = 'Boolean'
}

export enum EValueSelectionType {
  Checkpoint = 'Checkpoint',
  Lora = 'Lora',
  Sampler = 'Sampler',
  Scheduler = 'Scheduler'
}

export enum EResourceType {
  Lora = 'Lora',
  Sampler = 'Sampler',
  Scheduler = 'Scheduler',
  Checkpoint = 'Checkpoint'
}

export enum EClientStatus {
  /**
   * Node is online and ready to execute tasks.
   */
  Online = 'Online',
  /**
   * Node is offline and cannot execute tasks.
   */
  Offline = 'Offline',
  /**
   * Node is currently executing
   * a task.
   */
  Executing = 'Executing',
  /**
   * Node is experiencing an error
   * and cannot execute tasks.
   */
  Error = 'Error'
}

export enum EClientFlags {
  /**
   * Client need to be restarted to function properly.
   */
  NEED_RESTART = 'NEED_RESTART',
  /**
   * Client's comfyui is outdated.
   */
  NEED_CORE_UPDATE = 'NEED_UPDATE',
  /**
   * Client's extension is outdated.
   */
  NEED_EXTENSION_UPDATE = 'NEED_EXTENSION_UPDATE',
  /**
   * Client is experiencing critical error.
   */
  CRITICAL_ERROR = 'CRITICAL_ERROR'
}

export enum EClientAction {
  UNINSTALL_EXTENSION,
  SET_PREVIEW_METHOD,
  INSTALL_EXTENSION,
  TOGGLE_EXTENSION,
  UPDATE_EXTENSION,
  UPDATE_COMFYUI,
  FIX_EXTENSION,
  FREE_MEMORY,
  UNKNOWN,
  RESTART
}

export enum EJobType {
  CLIENT_ACTION = 'CLIENT_ACTION',
  WORKFLOW_EXECUTE = 'WORKFLOW_EXECUTE'
}

export enum ENotificationType {
  Info = 'info',
  Warning = 'warning',
  Error = 'error'
}

export enum ENotificationTarget {
  Workflow = 'workflow',
  WorkflowTask = 'workflow_task',
  Client = 'client'
}

export enum EAttachmentStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  FAILED = 'FAILED'
}

export enum EStorageType {
  LOCAL = 'LOCAL',
  S3 = 'S3'
}

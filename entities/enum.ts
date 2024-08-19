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

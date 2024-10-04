import { adminChecker, authChecker, editorChecker } from './middlewares/user'
import { procedure } from './trpc'

/**
 * Public procedure
 */
export const publicProcedure = procedure

/**
 * Protected base procedure
 */
export const privateProcedure = procedure.use(authChecker)

/**
 * Protected editor procedure
 */
export const editorProcedure = procedure.use(editorChecker)

/**
 * Protected admin procedure
 */
export const adminProcedure = procedure.use(adminChecker)

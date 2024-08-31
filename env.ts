import { z } from 'zod'

const ENVBackendSchema = z.object({
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional()
})

export const BackendENV = ENVBackendSchema.parse(process.env)

import { z } from 'zod'

const ENVBackendSchema = z.object({
  NEXTAUTH_SECRET: z.string().optional().default('secret'),
  BACKEND_URL: z.string().optional().default('http://localhost:3001'),
  INTERNAL_SECRET: z.string().optional().default('internal-secret'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional()
})

export const BackendENV = ENVBackendSchema.parse(process.env)

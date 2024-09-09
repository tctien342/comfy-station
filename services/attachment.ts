import { Attachment } from '@/entities/attachment'
import { BackendENV } from '@/env'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Logger } from '@saintno/needed-tools'
import fs from 'fs'
import mime from 'mime'

const LOCAL_STORAGE_PATH = __dirname + '/../public/attachments/'

export enum EAttachmentType {
  S3 = 's3',
  LOCAL = 'local'
}

class AttachmentService {
  private static instance: AttachmentService
  private s3?: S3Client
  private logger: Logger

  static getInstance(): AttachmentService {
    if (!AttachmentService.instance) {
      AttachmentService.instance = new AttachmentService()
    }
    return AttachmentService.instance
  }

  private constructor() {
    this.logger = new Logger('AttachmentService')
    // Check if S3 config is set in environment variables
    if (!!BackendENV.S3_ENDPOINT && !!BackendENV.S3_ACCESS_KEY && !!BackendENV.S3_SECRET_KEY) {
      // Initialize S3 client with the provided config
      this.s3 = new S3Client({
        endpoint: BackendENV.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: BackendENV.S3_ACCESS_KEY,
          secretAccessKey: BackendENV.S3_SECRET_KEY
        },
        region: BackendENV.S3_REGION
      })
      this.logger.i('Init', 'Using S3 for file storage', {
        endpoint: BackendENV.S3_ENDPOINT,
        region: BackendENV.S3_REGION
      })
    } else {
      this.logger.i('Init', 'Using local storage for file storage')
    }
  }

  async getAttachmentURL(item: Attachment) {
    return this.getFileURL(item.fileName)
  }

  async getFileURL(fileName: string) {
    if (this.s3 && BackendENV.S3_BUCKET_NAME) {
      // Generate a file URL for the file in the S3 bucket
      const s3Url = await this.getSignedUrl(fileName)
      if (s3Url) {
        return {
          type: EAttachmentType.S3,
          url: s3Url
        }
      }
    }
    if (fs.existsSync(LOCAL_STORAGE_PATH + fileName)) {
      return {
        type: EAttachmentType.LOCAL,
        url: '/files/' + fileName
      }
    }
    return undefined
  }
  async getSignedUrl(fileName: string): Promise<string | undefined> {
    if (await this.existObject(fileName)) {
      if (this.s3 && BackendENV.S3_BUCKET_NAME) {
        // Generate a signed URL for the file in the S3 bucket
        const params = {
          Bucket: BackendENV.S3_BUCKET_NAME,
          Key: fileName
        }
        const command = new GetObjectCommand(params)
        return getSignedUrl(this.s3, command, { expiresIn: 3600 })
      }
    }
    return undefined
  }

  async uploadFile(file: Buffer, fileName: string) {
    try {
      if (this.s3) {
        const meta: Record<string, string> = {}
        const mimeType = mime.getType(fileName)
        if (mimeType) {
          meta['Content-Type'] = mimeType
        }
        // Upload file to S3 bucket
        const uploadParams: PutObjectCommandInput = {
          Bucket: BackendENV.S3_BUCKET_NAME,
          Key: fileName,
          Body: file,
          Metadata: meta
        }
        const command = new PutObjectCommand(uploadParams)
        await this.s3.send(command)
        return true
      } else {
        // Save file locally
        const filePath = `${LOCAL_STORAGE_PATH}${fileName}`
        fs.writeFileSync(filePath, file)
        return true
      }
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (this.s3) {
      // Delete file from S3 bucket
      const bucketName = process.env.S3_BUCKET_NAME
      const fileName = fileUrl.split('/').pop()
      const deleteParams = {
        Bucket: bucketName,
        Key: fileName
      }

      const command = new DeleteObjectCommand(deleteParams)
      await this.s3.send(command)
    } else {
      // Delete file from local storage
      fs.unlinkSync(fileUrl)
    }
  }

  /**
   * Checks if an object with the specified fileName exists in the Minio bucket.
   * @param fileName - The name of the object to check.
   * @returns A Promise that resolves to the object's information if it exists, or rejects if it doesn't exist.
   */
  existObject = async (fileName: string): Promise<Boolean> => {
    if (this.s3) {
      const result = await this.s3
        ?.send(new HeadObjectCommand({ Bucket: BackendENV.S3_BUCKET_NAME, Key: fileName }))
        .catch(() => false)
      if (!!result) {
        return true
      }
    }
    return fs.existsSync(LOCAL_STORAGE_PATH + fileName)
  }
}

export default AttachmentService

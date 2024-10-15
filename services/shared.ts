import { Logger } from '@saintno/needed-tools'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

interface Message {
  secret: string
}

export class SharedStorage {
  private static instance: SharedStorage
  private filePath: string
  private logger: Logger

  private constructor() {
    this.logger = new Logger('SharedStorage')
    this.filePath = path.join(process.cwd(), '.cache/shared_communication.json')
    // Ensure the file exists
    this.getSecret()
  }

  /**
   * Get the singleton instance of SharedStorage
   * @returns SharedStorage instance
   */
  public static getInstance(): SharedStorage {
    if (!SharedStorage.instance) {
      SharedStorage.instance = new SharedStorage()
    }
    return SharedStorage.instance
  }

  /**
   * Write a message to the shared file
   * @param message - The message to write
   */
  public writeMessage(message: Message): void {
    fs.writeFile(this.filePath, JSON.stringify(message), (err) => {
      if (err) {
        this.logger.w('writeMessage', 'Error writing to file:', err)
      } else {
        this.logger.i('writeMessage', 'Message written to file:', message)
      }
    })
  }

  /**
   * Read and parse the message from the shared file
   * @returns The parsed message or null if an error occurs
   */
  public readMessage(): Message | null {
    if (!fs.existsSync(this.filePath)) {
      this.logger.w('readMessage', 'File does not exist:', this.filePath)
      return null
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      this.logger.w('readMessage', 'Error reading file:', err)
      return null
    }
  }

  /**
   * Watch the shared file for changes and handle updates
   * @param callback - The callback function to handle file changes
   */
  public watchFile(callback: (message: Message) => void): void {
    fs.watchFile(this.filePath, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        const message = this.readMessage()
        if (message) {
          callback(message)
        }
      }
    })
  }

  public getSecret() {
    const current = this.readMessage()
    if (!current) {
      const newSecret = createHash('sha256').update(Math.random().toString()).digest('hex')
      this.writeMessage({ secret: newSecret })
      return newSecret
    }
    return current.secret
  }
}

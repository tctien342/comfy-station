import fs from 'fs'
import path from 'path'

interface Message {
  secret: string
}

export class SharedStorage {
  private static instance: SharedStorage
  private filePath: string

  private constructor() {
    this.filePath = path.join(process.cwd(), '.cache/shared_communication.json')
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
        console.error('Error writing to file:', err)
      } else {
        console.log('Message written to file:', message)
      }
    })
  }

  /**
   * Read and parse the message from the shared file
   * @returns The parsed message or null if an error occurs
   */
  public readMessage(): Message | null {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      console.error('Error reading from file:', err)
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
      const newSecret = Math.random().toString(36).substring(2, 15)
      this.writeMessage({ secret: newSecret })
      return newSecret
    }
    return current.secret
  }
}

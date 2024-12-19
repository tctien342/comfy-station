import { BackendENV } from '@/env'
import { ESupportedSnippetLanguage, SnippetOutput } from '@/types/snippet'
import { HTTPSnippet } from 'httpsnippet'

export const WorkflowSnippet = (id: string, input: object, token = 'REPLACE_API_TOKEN') => {
  return new HTTPSnippet({
    method: 'POST',
    url: `${BackendENV.BACKEND_URL}/ext/api/workflow/${id}/execute`,
    headers: [
      { name: 'Content-Type', value: 'application/json' },
      {
        name: 'Authorization',
        value: `Bearer ${token}`
      }
    ],
    postData: {
      mimeType: 'application/json',
      text: JSON.stringify({
        repeat: 1,
        input
      })
    }
  })
}

export const AttachmentSnippet = () => {
  return new HTTPSnippet({
    method: 'POST',
    url: `${BackendENV.BACKEND_URL}/ext/api/attachment/upload`,
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer REPLACE_API_TOKEN'
      }
    ],
    postData: {
      mimeType: 'multipart/form-data',
      params: [
        {
          name: 'files',
          fileName: 'example.png',
          contentType: 'image/png',
          value: '<file_content>'
        }
      ]
    }
  })
}

export const TaskStatusSnippet = (id: string, token = 'REPLACE_API_TOKEN') => {
  return new HTTPSnippet({
    method: 'GET',
    url: `${BackendENV.BACKEND_URL}/ext/api/task/${id}/status`,
    headers: [
      {
        name: 'Authorization',
        value: `Bearer ${token}`
      }
    ],
    postData: { mimeType: 'application/json' }
  })
}

export const TaskAttachmentSnippet = (id: string, token = 'REPLACE_API_TOKEN') => {
  return new HTTPSnippet({
    method: 'GET',
    url: `${BackendENV.BACKEND_URL}/ext/api/task/${id}/attachments`,
    headers: [
      {
        name: 'Authorization',
        value: `Bearer ${token}`
      }
    ],
    postData: { mimeType: 'application/json' }
  })
}

export const ConvertSnippet = (snippet: HTTPSnippet): SnippetOutput[] => {
  try {
    return Object.values(ESupportedSnippetLanguage).map((lang) => {
      const [target, clientId] = lang.split('_') as [any, string | undefined]
      const content = clientId ? (snippet.convert(target, clientId) as string) : (snippet.convert(target) as string)
      return {
        id: lang as ESupportedSnippetLanguage,
        mimeType: 'application/json',
        title: `${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
        content
      }
    })
  } catch (e) {
    console.log(e)
    return []
  }
}

export enum ESupportedSnippetLanguage {
  C = 'c',
  CSHARP = 'csharp',
  GO = 'go',
  JAVA_UNI = 'java_unirest',
  JAVA_ASYNC = 'java_asynchttp',
  JAVASCRIPT_XHR = 'javascript_xhr',
  JAVASCRIPT_FETCH = 'javascript_fetch',
  JAVASCRIPT_AXIOS = 'javascript_axios',
  JAVASCRIPT_JQUERY = 'javascript_jquery',
  KOTLIN = 'kotlin',
  PHP = 'php',
  PYTHON_3 = 'python_python3',
  PYTHON_REQUESTS = 'python_requests',
  RUBY = 'ruby',
  RUST = 'rust',
  CURL = 'shell_curl',
  SWIFT = 'swift'
}
export interface SnippetOutput {
  id: ESupportedSnippetLanguage
  mimeType: string
  title: string
  content: string
}

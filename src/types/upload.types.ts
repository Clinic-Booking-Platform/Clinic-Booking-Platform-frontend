export interface UploadSingleResponse {
  status: 'success' | 'error'
  data: {
    url: string
  }
  message?: string
}

export type UploadImageResponse = UploadSingleResponse

export interface UploadMultipleResponse {
  status: 'success' | 'error'
  data: {
    urls: string[]
  }
  message?: string
}

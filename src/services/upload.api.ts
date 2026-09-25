import api from './axios-clients'
import type {
  UploadSingleResponse,
  UploadMultipleResponse,
} from '@/types/upload.types'

export const uploadService = {
  /**
   * Upload một ảnh đơn lên server
   * Endpoint: POST /upload/single (field: file)
   * Content-Type: multipart/form-data
   */
  async uploadSingle(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post<UploadSingleResponse>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data.url
  },

  /**
   * Upload nhiều ảnh lên server
   * Endpoint: POST /upload/multiple (field: files)
   * Content-Type: multipart/form-data
   */
  async uploadMultiple(files: File[]): Promise<string[]> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const res = await api.post<UploadMultipleResponse>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data.urls
  },

  /**
   * Alias thuận tiện cho upload ảnh đơn
   */
  async uploadImage(file: File): Promise<string> {
    return this.uploadSingle(file)
  },
}

import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { specialtyService } from '@/services/specialty.api'
import { uploadService } from '@/services/upload.api'
import type { Specialty } from '@/types/specialty.types'

interface SpecialtyFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Specialty | null
  onSuccess: () => void
}

export const SpecialtyFormModal: React.FC<SpecialtyFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const isEdit = Boolean(initialData?.id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states initialized directly from initialData
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')

  // Validation & status states
  const [nameError, setNameError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isUploading) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSubmitting, isUploading, onClose])

  if (!isOpen) return null

  // Validate form
  const validate = (): boolean => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Vui lòng nhập tên chuyên khoa')
      return false
    }
    if (trimmedName.length > 255) {
      setNameError('Tên chuyên khoa không được vượt quá 255 ký tự')
      return false
    }
    setNameError(null)
    return true
  }

  // Xử lý upload ảnh
  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP, ...)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng hình ảnh không được vượt quá 5MB')
      return
    }

    try {
      setIsUploading(true)
      const uploadedUrl = await uploadService.uploadSingle(file)
      setImageUrl(uploadedUrl)
      toast.success('Tải ảnh chuyên khoa lên thành công!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const msg = err.response?.data?.message || 'Không thể upload ảnh, vui lòng thử lại!'
      toast.error(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setIsSubmitting(true)
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl || undefined,
      }

      if (isEdit && initialData?.id) {
        await specialtyService.updateSpecialty(initialData.id, payload)
        toast.success(`Cập nhật chuyên khoa "${payload.name}" thành công!`)
      } else {
        await specialtyService.createSpecialty(payload)
        toast.success(`Thêm mới chuyên khoa "${payload.name}" thành công!`)
      }

      onSuccess()
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const msg =
        err.response?.data?.message ||
        (isEdit ? 'Cập nhật chuyên khoa thất bại' : 'Thêm chuyên khoa mới thất bại')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting && !isUploading) onClose()
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {isEdit ? 'Chỉnh Sửa Chuyên Khoa' : 'Thêm Chuyên Khoa Mới'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? 'Cập nhật lại thông tin, ảnh đại diện và mô tả chuyên khoa'
                : 'Nhập thông tin chuyên khoa khám chữa bệnh mới vào hệ thống'}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting || isUploading}
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4.5 p-6 max-h-[75vh] overflow-y-auto">
            {/* Trường 1: Tên Chuyên Khoa (Bắt buộc) */}
            <div className="space-y-1.5">
              <label
                htmlFor="specialty-name"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>
                  Tên chuyên khoa <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {name.length}/255
                </span>
              </label>
              <input
                id="specialty-name"
                type="text"
                value={name}
                maxLength={255}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                placeholder="VD: Chuyên khoa Tim mạch, Nhi khoa, Da liễu..."
                disabled={isSubmitting}
                className={`w-full h-10 rounded-lg border bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${nameError
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
              />
              {nameError && (
                <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                  <AlertCircle className="size-3.5" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Trường 2: Ảnh Chuyên Khoa (Upload & Preview) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Ảnh đại diện chuyên khoa
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />

              {imageUrl ? (
                /* Preview Container */
                <div className="relative flex items-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                    <img
                      src={imageUrl}
                      alt="Xem trước ảnh chuyên khoa"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Đã tải ảnh lên</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {imageUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || isUploading}
                      className="h-8 text-xs px-2.5"
                    >
                      Thay ảnh
                    </Button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      disabled={isSubmitting || isUploading}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Drag & Drop Area */
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isUploading && !isSubmitting) {
                      fileInputRef.current?.click()
                    }
                  }}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${isDragOver
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                    : 'border-border/80 hover:border-teal-500/60 bg-muted/10 hover:bg-muted/30'
                    }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-8 animate-spin text-teal-600 dark:text-teal-400" />
                      <p className="text-xs font-medium text-foreground">
                        Đang tải ảnh lên máy chủ...
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Vui lòng chờ trong giây lát
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="size-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        <span className="text-teal-600 dark:text-teal-400 font-semibold underline underline-offset-2">
                          Nhấn để chọn ảnh
                        </span>{' '}
                        hoặc kéo thả tệp vào đây
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Hỗ trợ PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Trường 3: Mô tả chuyên khoa */}
            <div className="space-y-1.5">
              <label
                htmlFor="specialty-description"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Mô tả chi tiết</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Tùy chọn
                </span>
              </label>
              <textarea
                id="specialty-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu về phạm vi điều trị, các bệnh lý tiếp nhận, thế mạnh kỹ thuật..."
                disabled={isSubmitting}
                className="w-full rounded-lg border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="text-xs"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : (
                <span>{isEdit ? 'Lưu thay đổi' : 'Tạo chuyên khoa'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

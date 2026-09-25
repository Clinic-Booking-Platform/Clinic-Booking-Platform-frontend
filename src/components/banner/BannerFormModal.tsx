import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  Link as LinkIcon,
  Layers,
  Sparkles,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { bannerApi } from '@/services/banner.api'
import { uploadService } from '@/services/upload.api'
import {
  createBannerSchema,
  updateBannerSchema,
  extractErrorMessage,
} from './banner.utils'
import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/types/banner.types'

interface BannerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  banner?: Banner | null
}

interface FormState {
  title: string
  image_url: string
  link_url: string
  sort_order: number | ''
  is_active: boolean
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  banner,
}) => {
  const isEdit = Boolean(banner)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form State
  const [formData, setFormData] = useState<FormState>({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: '',
    is_active: true,
  })

  // Errors state (Strictly inline errors, NO validation toasts)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Loading states
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data when modal opens or banner changes
  useEffect(() => {
    if (!isOpen) return

    setErrors({})
    if (banner) {
      setFormData({
        title: banner.title || '',
        image_url: banner.image_url || '',
        link_url: banner.link_url || '',
        sort_order: banner.sort_order || 1,
        is_active: Boolean(banner.is_active),
      })
    } else {
      setFormData({
        title: '',
        image_url: '',
        link_url: '',
        sort_order: '',
        is_active: true,
      })
    }
  }, [isOpen, banner])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isUploadingImage) {
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
  }, [isOpen, isSubmitting, isUploadingImage, onClose])

  if (!isOpen) return null

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }

    if (name === 'sort_order') {
      const parsed = parseInt(value, 10)
      setFormData((prev) => ({
        ...prev,
        sort_order: isNaN(parsed) ? '' : Math.max(1, parsed),
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image_url: 'Vui lòng chọn tệp định dạng hình ảnh hợp lệ (PNG, JPG, WEBP)!',
      }))
      return
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image_url: 'Dung lượng ảnh không được vượt quá 5MB!',
      }))
      return
    }

    setIsUploadingImage(true)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.image_url
      return next
    })

    try {
      const uploadedUrl = await uploadService.uploadImage(file)
      setFormData((prev) => ({ ...prev, image_url: uploadedUrl }))
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        image_url: extractErrorMessage(err, 'Tải ảnh lên thất bại, vui lòng thử lại!'),
      }))
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const clientErrors: Record<string, string> = {}

    if (isEdit) {
      const updateData = {
        title: formData.title.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        link_url: formData.link_url.trim() || undefined,
        sort_order: formData.sort_order === '' ? undefined : Number(formData.sort_order),
      }

      const parseResult = updateBannerSchema.safeParse(updateData)
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          const path = issue.path[0] as string
          if (path && !clientErrors[path]) {
            clientErrors[path] = issue.message
          }
        }
      }

      if (Object.keys(clientErrors).length > 0) {
        setErrors(clientErrors)
        return
      }

      setIsSubmitting(true)
      try {
        const payload: UpdateBannerDto = {
          title: formData.title.trim(),
          image_url: formData.image_url.trim(),
          link_url: formData.link_url.trim() || undefined,
          sort_order: formData.sort_order === '' ? undefined : Number(formData.sort_order),
        }
        await bannerApi.updateBanner(banner!.id, payload)
        toast.success(`Cập nhật banner "${formData.title}" thành công!`)
        onSuccess()
        onClose()
      } catch (err: unknown) {
        toast.error(extractErrorMessage(err, 'Cập nhật banner thất bại!'))
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Create mode
      const createData = {
        title: formData.title.trim(),
        image_url: formData.image_url.trim(),
        link_url: formData.link_url.trim() || undefined,
        is_active: formData.is_active,
      }

      const parseResult = createBannerSchema.safeParse(createData)
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          const path = issue.path[0] as string
          if (path && !clientErrors[path]) {
            clientErrors[path] = issue.message
          }
        }
      }

      if (Object.keys(clientErrors).length > 0) {
        setErrors(clientErrors)
        return
      }

      setIsSubmitting(true)
      try {
        const payload: CreateBannerDto = {
          title: formData.title.trim(),
          image_url: formData.image_url.trim(),
          link_url: formData.link_url.trim() || undefined,
          is_active: formData.is_active,
        }
        await bannerApi.createBanner(payload)
        toast.success(`Tạo banner mới "${formData.title}" thành công!`)
        onSuccess()
        onClose()
      } catch (err: unknown) {
        toast.error(extractErrorMessage(err, 'Thêm mới banner thất bại!'))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting && !isUploadingImage) onClose()
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-foreground">
                {isEdit ? 'Chỉnh sửa banner quảng cáo' : 'Thêm banner quảng cáo mới'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? `Cập nhật thông tin và thứ tự cho banner #${banner?.id}`
                  : 'Cấu hình banner hiển thị trên Slider trang chủ và chiến dịch marketing'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || isUploadingImage}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <form id="banner-form" onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Tiêu đề banner (Bắt buộc) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  Tiêu đề chiến dịch banner <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {formData.title.length}/255 ký tự
                </span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Ưu đãi khám sức khỏe tổng quát mùa hè - Giảm 20%..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  errors.title
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* 2. Ảnh Banner (Bắt buộc) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Hình ảnh banner quảng cáo <span className="text-rose-500">*</span>
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Khuyến nghị tỉ lệ 16:9 hoặc 21:9
                </span>
              </label>

              {/* Khung xem trước / Upload ảnh */}
              <div
                className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all bg-muted/20 ${
                  errors.image_url
                    ? 'border-rose-500/80 bg-rose-500/5'
                    : 'border-border/80 hover:border-teal-500/60'
                } aspect-21/9 min-h-[160px] flex items-center justify-center`}
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-teal-600">
                    <Loader2 className="size-8 animate-spin" />
                    <span className="text-xs font-medium">Đang tải ảnh lên máy chủ...</span>
                  </div>
                ) : formData.image_url ? (
                  <div className="relative group size-full">
                    <img
                      src={formData.image_url}
                      alt="Banner Preview"
                      className="size-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/95 text-foreground hover:bg-white text-xs cursor-pointer shadow-md"
                      >
                        Đổi ảnh khác
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                        className="text-xs cursor-pointer shadow-md"
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        <span>Xóa ảnh</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer size-full hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 mb-2">
                      <UploadCloud className="size-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      Bấm để chọn ảnh tải lên
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Định dạng PNG, JPG, WEBP tối đa 5MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploadingImage || isSubmitting}
              />

              {/* Nhập URL ảnh thủ công */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Hoặc dán URL ảnh trực tiếp nếu đã có sẵn:
                </span>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/banner-summer-sale.jpg"
                    className="w-full rounded-lg border border-border/70 bg-background pl-8.5 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {errors.image_url && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.image_url}</span>
                </p>
              )}
            </div>

            {/* 3. Đường dẫn liên kết (Tùy chọn) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Đường dẫn liên kết đích (link_url)</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Không bắt buộc</span>
              </label>
              <input
                type="text"
                name="link_url"
                value={formData.link_url}
                onChange={handleInputChange}
                placeholder="Ví dụ: /packages/1 hoặc https://clinic.vn/uu-dai"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  errors.link_url
                    ? 'border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              />
              <p className="text-[11px] text-muted-foreground">
                Khi người dùng nhấp vào banner trên website sẽ được điều hướng đến đường dẫn này
              </p>
              {errors.link_url && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.link_url}</span>
                </p>
              )}
            </div>

            {/* 4. Thứ tự hiển thị (sort_order - CHỈ HIỂN THỊ KHI SỬA) */}
            {isEdit && (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="size-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Thứ tự xuất hiện trên Slider</span>
                  </label>
                  <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                    Hiện tại: #{banner?.sort_order}
                  </span>
                </div>
                <input
                  type="number"
                  name="sort_order"
                  min="1"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  placeholder="Nhập số thứ tự (ví dụ: 1, 2, 3...)"
                  className={`w-full rounded-lg border px-3 py-2 text-xs sm:text-sm bg-background text-foreground outline-none focus:border-teal-500 ${
                    errors.sort_order ? 'border-rose-500' : 'border-border/80'
                  }`}
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  * <strong>Lưu ý:</strong> Hệ thống sẽ tự động hoán đổi vị trí (swap) nếu trùng
                  thứ tự với banner khác đang có.
                </p>
                {errors.sort_order && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errors.sort_order}</span>
                  </p>
                )}
              </div>
            )}

            {/* 5. Trạng thái hiển thị (is_active) */}
            {!isEdit && (
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4">
                <div>
                  <label className="text-xs font-semibold text-foreground cursor-pointer">
                    Kích hoạt hiển thị ngay
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Banner sẽ xuất hiện công khai trên Slider trang chủ ngay sau khi tạo
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-3.5 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting || isUploadingImage}
            className="cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="banner-form"
            size="sm"
            disabled={isSubmitting || isUploadingImage}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer shadow-xs min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>{isEdit ? 'Lưu thay đổi' : 'Tạo banner'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

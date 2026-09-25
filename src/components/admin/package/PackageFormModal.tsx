import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  UploadCloud,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { packageApi } from '@/services/package.api'
import { uploadService } from '@/services/upload.api'
import { RichTextEditor } from './RichTextEditor'
import { formatCurrency, calculateDiscountPercent } from './package.utils'
import type { MedicalPackage } from '@/types/package.types'

interface PackageFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: MedicalPackage | null
  onSuccess: () => void
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
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
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined ? String(initialData.price) : ''
  )
  const [discountPrice, setDiscountPrice] = useState<string>(
    initialData?.discount_price !== undefined && initialData?.discount_price !== null
      ? String(initialData.discount_price)
      : ''
  )
  const [htmlContent, setHtmlContent] = useState(
    initialData?.package_detail?.html_content || ''
  )

  // Errors state
  const [nameError, setNameError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)

  // Status states
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(isEdit)

  // Fetch detailed package info (including package_detail.html_content) when editing
  useEffect(() => {
    let isCancelled = false

    if (isOpen && isEdit && initialData?.id) {
      packageApi
        .getPackageById(initialData.id)
        .then((fullPkg) => {
          if (isCancelled) return
          setName(fullPkg.name || '')
          setDescription(fullPkg.description || '')
          setThumbnailUrl(fullPkg.thumbnail_url || '')
          setPrice(fullPkg.price !== undefined ? String(fullPkg.price) : '')
          setDiscountPrice(
            fullPkg.discount_price !== undefined && fullPkg.discount_price !== null
              ? String(fullPkg.discount_price)
              : ''
          )
          const content =
            fullPkg.package_detail?.html_content ||
            (fullPkg as unknown as { html_content?: string }).html_content ||
            ''
          setHtmlContent(content)
        })
        .catch((err) => {
          if (isCancelled) return
          console.error('Lỗi khi tải chi tiết gói khám:', err)
          toast.error('Không thể tải chi tiết nội dung gói khám!')
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingDetail(false)
          }
        })
    }

    return () => {
      isCancelled = true
    }
  }, [isOpen, isEdit, initialData?.id])

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

  // Real-time validation
  const validateForm = (): boolean => {
    let isValid = true

    // 1. Validate Tên
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Vui lòng nhập tên gói khám')
      isValid = false
    } else if (trimmedName.length > 255) {
      setNameError('Tên gói khám không được vượt quá 255 ký tự')
      isValid = false
    } else {
      setNameError(null)
    }

    // 2. Validate Giá gốc
    const numPrice = Number(price)
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setPriceError('Giá gốc bắt buộc phải là số lớn hơn 0')
      isValid = false
    } else {
      setPriceError(null)
    }

    // 3. Validate Giá khuyến mãi: discount_price < price
    if (discountPrice.trim() !== '') {
      const numDiscount = Number(discountPrice)
      if (isNaN(numDiscount) || numDiscount < 0) {
        setDiscountError('Giá khuyến mãi phải là số hợp lệ không âm')
        isValid = false
      } else if (numPrice > 0 && numDiscount >= numPrice) {
        setDiscountError('Giá khuyến mãi phải nhỏ hơn giá gốc')
        isValid = false
      } else {
        setDiscountError(null)
      }
    } else {
      setDiscountError(null)
    }

    return isValid
  }

  // Handle Upload Thumbnail
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
      setThumbnailUrl(uploadedUrl)
      toast.success('Tải ảnh đại diện gói khám thành công!')
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

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const numPrice = Number(price)
    const numDiscount = discountPrice.trim() !== '' ? Number(discountPrice) : null

    try {
      setIsSubmitting(true)
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        price: numPrice,
        discount_price: numDiscount,
        html_content: htmlContent,
      }

      if (isEdit && initialData?.id) {
        await packageApi.updatePackage(initialData.id, payload)
        toast.success(`Cập nhật gói khám "${payload.name}" thành công!`)
      } else {
        await packageApi.createPackage(payload)
        toast.success(`Tạo mới gói khám "${payload.name}" thành công!`)
      }

      onSuccess()
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const msg =
        err.response?.data?.message ||
        (isEdit ? 'Cập nhật gói khám thất bại' : 'Thêm mới gói khám thất bại')
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preview discount calculation
  const numP = Number(price)
  const numD = Number(discountPrice)
  const previewDiscountPercent =
    numP > 0 && numD > 0 && numD < numP ? calculateDiscountPercent(numP, numD) : 0

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
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {isEdit ? 'Chỉnh Sửa Gói Khám & Dịch Vụ' : 'Tạo Gói Khám & Dịch Vụ Mới'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? 'Cập nhật bảng giá, mô tả và nội dung chi tiết danh mục khám'
                : 'Nhập thông tin bảng giá và danh mục dịch vụ khám chữa bệnh vào hệ thống'}
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
          <div className="space-y-5 p-6 max-h-[75vh] overflow-y-auto">
            {/* 1. Tên Gói Khám (Bắt buộc) */}
            <div className="space-y-1.5">
              <label
                htmlFor="package-name"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>
                  Tên gói khám / Dịch vụ y tế <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {name.length}/255
                </span>
              </label>
              <input
                id="package-name"
                type="text"
                value={name}
                maxLength={255}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                placeholder="VD: Gói khám sức khỏe tổng quát VIP, Tầm soát tim mạch chuyên sâu..."
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

            {/* 2. Ảnh Thumbnail Đại Diện */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Ảnh đại diện gói khám (Thumbnail)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />

              {thumbnailUrl ? (
                /* Preview Container */
                <div className="relative flex items-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                    <img
                      src={thumbnailUrl}
                      alt="Xem trước ảnh gói khám"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Đã tải ảnh lên thành công</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {thumbnailUrl}
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
                      onClick={() => setThumbnailUrl('')}
                      disabled={isSubmitting || isUploading}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Drag & Drop Box */
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
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${isDragOver
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                      : 'border-border/80 hover:border-teal-500/60 bg-muted/10 hover:bg-muted/30'
                    }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-7 animate-spin text-teal-600 dark:text-teal-400" />
                      <p className="text-xs font-medium text-foreground">
                        Đang tải ảnh đại diện lên máy chủ...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1.5 group-hover:scale-105 transition-transform">
                        <UploadCloud className="size-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        <span className="text-teal-600 dark:text-teal-400 font-semibold underline underline-offset-2">
                          Nhấn để chọn ảnh
                        </span>{' '}
                        hoặc kéo thả tệp vào đây
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Hỗ trợ PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 3. Khối Bảng Giá (Giá gốc & Giá khuyến mãi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border/70 bg-muted/15 p-4">
              {/* Giá Gốc (Bắt buộc) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="package-price"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>
                    Giá gốc (VNĐ) <span className="text-rose-500">*</span>
                  </span>
                  {numP > 0 && (
                    <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
                      {formatCurrency(numP)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="package-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value)
                      if (priceError) setPriceError(null)
                      if (discountError) setDiscountError(null)
                    }}
                    placeholder="VD: 2500000"
                    disabled={isSubmitting}
                    className={`w-full h-10 rounded-lg border bg-background/80 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${priceError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                  />
                </div>
                {priceError && (
                  <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                    <AlertCircle className="size-3.5" />
                    <span>{priceError}</span>
                  </div>
                )}
              </div>

              {/* Giá Khuyến Mãi (Tùy chọn, validate < giá gốc) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="package-discount-price"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>Giá khuyến mãi (VNĐ)</span>
                  {previewDiscountPercent > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <Tag className="size-3" />
                      Giảm {previewDiscountPercent}%
                    </span>
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="package-discount-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={discountPrice}
                    onChange={(e) => {
                      setDiscountPrice(e.target.value)
                      if (discountError) setDiscountError(null)
                    }}
                    placeholder="VD: 2000000 (để trống nếu không giảm)"
                    disabled={isSubmitting}
                    className={`w-full h-10 rounded-lg border bg-background/80 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${discountError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                  />
                </div>
                {discountError && (
                  <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                    <AlertCircle className="size-3.5" />
                    <span>{discountError}</span>
                  </div>
                )}
                {numD > 0 && !discountError && (
                  <p className="text-[11px] text-muted-foreground">
                    Giá hiển thị: <strong className="text-foreground">{formatCurrency(numD)}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Mô Tả Tóm Tắt */}
            <div className="space-y-1.5">
              <label
                htmlFor="package-description"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Mô tả tóm tắt</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Hiển thị trên danh sách thẻ
                </span>
              </label>
              <textarea
                id="package-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu nhanh về mục đích của gói khám (phù hợp độ tuổi, đối tượng, giới tính...)"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* 5. Nội Dung Chi Tiết (Rich Text Editor) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground block">
                  Nội dung chi tiết danh mục khám (`html_content`)
                </label>
                {isLoadingDetail && (
                  <span className="flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium animate-pulse">
                    <Loader2 className="size-3 animate-spin" />
                    Đang tải nội dung chi tiết...
                  </span>
                )}
              </div>
              <RichTextEditor
                value={htmlContent}
                onChange={setHtmlContent}
                disabled={isSubmitting || isLoadingDetail}
                placeholder="Nhập chi tiết các hạng mục xét nghiệm, nội soi, chẩn đoán hình ảnh..."
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
              disabled={isSubmitting || isUploading || isLoadingDetail}
              className="text-xs"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploading || isLoadingDetail}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : (
                <span>{isEdit ? 'Lưu thay đổi' : 'Tạo gói khám'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

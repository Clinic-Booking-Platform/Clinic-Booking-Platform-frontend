import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  UploadCloud,
  Loader2,
  Trash2,
  AlertCircle,
  Stethoscope,
  DollarSign,
  Phone,
  User,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { doctorApi } from '@/services/doctor.api'
import { specialtyService } from '@/services/specialty.api'
import { uploadService } from '@/services/upload.api'
import {
  updateDoctorSchema,
  formatCurrency,
  getDoctorInitials,
  extractErrorMessage,
} from './doctor.utils'
import type { Doctor } from '@/types/doctor.types'
import type { Specialty } from '@/types/specialty.types'

interface DoctorEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  doctor: Doctor | null
  specialties?: Specialty[]
}

export const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  doctor,
  specialties,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Specialty options state (all: true & status: 'active')
  const [fetchedSpecialties, setFetchedSpecialties] = useState<Specialty[]>([])
  const specialtyOptions =
    specialties && specialties.length > 0 ? specialties : fetchedSpecialties
  const isLoadingSpecialties =
    isOpen && (!specialties || specialties.length === 0) && fetchedSpecialties.length === 0

  // Fetch all active specialties if needed when modal opens
  useEffect(() => {
    if (!isOpen || (specialties && specialties.length > 0)) return

    let isMounted = true
    specialtyService
      .getSpecialties({ status: 'active', all: true })
      .then((res) => {
        if (isMounted) {
          const list = res.specialties || res.data?.specialties || []
          setFetchedSpecialties(list)
        }
      })
      .catch((err) => {
        console.error('Không thể tải chuyên khoa cho modal sửa bác sĩ:', err)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, specialties])

  // Form states initialized directly from doctor prop
  const [fullName, setFullName] = useState(doctor?.user?.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState(doctor?.user?.phone_number || '')
  const [avatar, setAvatar] = useState(doctor?.user?.avatar || '')
  const [specialtyId, setSpecialtyId] = useState<string>(
    doctor?.specialty_id ? String(doctor.specialty_id) : ''
  )
  const [price, setPrice] = useState<string>(
    doctor?.price !== undefined ? String(doctor.price) : ''
  )
  const [description, setDescription] = useState(doctor?.description || '')

  // UI states
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  if (!isOpen || !doctor) return null

  // Handle avatar upload
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
      setAvatar(uploadedUrl)
      toast.success('Tải ảnh đại diện bác sĩ thành công!')
    } catch (error: unknown) {
      const msg = extractErrorMessage(error, 'Không thể upload ảnh đại diện, vui lòng thử lại!')
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

  // Validate form with Zod
  const validate = (): boolean => {
    const parsedSpecialtyId = specialtyId ? Number(specialtyId) : 0
    const parsedPrice = price.trim() !== '' ? Number(price) : NaN

    const result = updateDoctorSchema.safeParse({
      full_name: fullName,
      phone_number: phoneNumber.trim() || undefined,
      avatar: avatar.trim() || undefined,
      specialty_id: parsedSpecialtyId,
      price: parsedPrice,
      description: description.trim() || undefined,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setIsSubmitting(true)
      const payload = {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
        avatar: avatar.trim() || null,
        specialty_id: Number(specialtyId),
        price: Number(price),
        description: description.trim() || null,
      }

      await doctorApi.updateDoctor(doctor.id, payload)
      toast.success(`Cập nhật thông tin Bác sĩ "${payload.full_name}" thành công!`)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const msg = extractErrorMessage(
        error,
        'Không thể cập nhật thông tin bác sĩ, vui lòng thử lại!'
      )
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const numPrice = Number(price)

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
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Chỉnh Sửa Hồ Sơ & Chuyên Môn Bác Sĩ
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cập nhật hình ảnh, thông tin liên lạc, chuyên khoa và giá dịch vụ khám
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
        <form onSubmit={handleSubmit} className="flex max-h-[calc(85vh-80px)] flex-col">
          <div className="flex-1 space-y-4.5 overflow-y-auto p-6">
            {/* 1. Upload Avatar */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Ảnh đại diện Bác sĩ (Avatar)
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-border/80 bg-muted/50 flex items-center justify-center shadow-xs">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-lg">
                      {getDoctorInitials(fullName)}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="size-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Action Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex-1 rounded-xl border border-dashed p-3 transition-colors text-center ${isDragOver
                      ? 'border-teal-500 bg-teal-500/5'
                      : 'border-border/80 bg-muted/20 hover:bg-muted/40'
                    }`}
                >
                  <p className="text-xs text-muted-foreground">
                    Kéo thả ảnh hoặc chọn từ máy tính (PNG, JPG, WEBP &lt; 5MB)
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isSubmitting}
                      className="text-xs gap-1"
                    >
                      <UploadCloud className="size-3" />
                      <span>{avatar ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                    </Button>
                    {avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setAvatar('')}
                        disabled={isUploading || isSubmitting}
                        className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                      >
                        <Trash2 className="size-3" />
                        <span>Xóa ảnh</span>
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading || isSubmitting}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* 2. Họ và tên Bác sĩ */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-doctor-name"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>
                    Họ và tên Bác sĩ <span className="text-rose-500">*</span>
                  </span>
                </span>
              </label>
              <input
                id="edit-doctor-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.full_name) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.full_name
                      return next
                    })
                  }
                }}
                placeholder="VD: BS. Nguyễn Văn A"
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${errors.full_name
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
              />
              {errors.full_name && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.full_name}</span>
                </div>
              )}
            </div>

            {/* 3. Số điện thoại & Giá khám */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-doctor-phone"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Số điện thoại</span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground">10 chữ số</span>
                </label>
                <input
                  id="edit-doctor-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                    if (errors.phone_number) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.phone_number
                        return next
                      })
                    }
                  }}
                  placeholder="0912345678"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${errors.phone_number
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                />
                {errors.phone_number && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errors.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Giá khám */}
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-doctor-price"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-muted-foreground" />
                    <span>
                      Giá khám niêm yết (VNĐ) <span className="text-rose-500">*</span>
                    </span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="edit-doctor-price"
                    type="number"
                    min="0"
                    step="10000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value)
                      if (errors.price) {
                        setErrors((prev) => {
                          const next = { ...prev }
                          delete next.price
                          return next
                        })
                      }
                    }}
                    placeholder="VD: 350000"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-background/60 p-2.5 pr-10 text-sm font-semibold text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${errors.price
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                      }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    ₫
                  </span>
                </div>
                {errors.price && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errors.price}</span>
                  </div>
                )}
                {numPrice >= 0 && !errors.price && price.trim() !== '' && (
                  <p className="text-[11px] text-muted-foreground">
                    Định dạng: <strong className="text-foreground">{formatCurrency(numPrice)}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Chuyên khoa phụ trách */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-doctor-specialty"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-muted-foreground" />
                  <span>
                    Chuyên khoa phụ trách <span className="text-rose-500">*</span>
                  </span>
                </span>
              </label>
              <select
                id="edit-doctor-specialty"
                value={specialtyId}
                onChange={(e) => {
                  setSpecialtyId(e.target.value)
                  if (errors.specialty_id) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.specialty_id
                      return next
                    })
                  }
                }}
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 ${errors.specialty_id
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
              >
                <option value="">
                  {isLoadingSpecialties && specialtyOptions.length === 0
                    ? '-- Đang tải danh sách chuyên khoa... --'
                    : '-- Chọn chuyên khoa --'}
                </option>
                {specialtyOptions.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
              {errors.specialty_id && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.specialty_id}</span>
                </div>
              )}
            </div>

            {/* 5. Tiểu sử & Kinh nghiệm */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-doctor-description"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>Tiểu sử, bằng cấp & Quá trình công tác</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">Tùy chọn</span>
              </label>
              <textarea
                id="edit-doctor-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Bác sĩ Chuyên khoa II, hơn 15 năm kinh nghiệm điều trị tại Bệnh viện Tim Hà Nội..."
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
                <span>Lưu thay đổi</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

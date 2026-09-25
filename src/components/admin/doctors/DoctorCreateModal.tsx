import React, { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Stethoscope,
  DollarSign,
  Mail,
  Lock,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { doctorApi } from '@/services/doctor.api'
import { createDoctorSchema, formatCurrency, extractErrorMessage } from './doctor.utils'
import type { Specialty } from '@/types/specialty.types'

interface DoctorCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  specialties: Specialty[]
}

export const DoctorCreateModal: React.FC<DoctorCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  specialties,
}) => {
  // Form fields
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [specialtyId, setSpecialtyId] = useState<string>('')
  const [price, setPrice] = useState<string>('')

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Errors state mapped from Zod
  const [errors, setErrors] = useState<Record<string, string>>({})


  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
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
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  // Validate form using Zod schema
  const validate = (): boolean => {
    const parsedSpecialtyId = specialtyId ? Number(specialtyId) : 0
    const parsedPrice = price.trim() !== '' ? Number(price) : NaN

    const result = createDoctorSchema.safeParse({
      fullname,
      email,
      password,
      confirmPassword,
      specialty_id: parsedSpecialtyId,
      price: parsedPrice,
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
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        specialty_id: Number(specialtyId),
        price: Number(price),
      }

      const created = await doctorApi.createDoctor(payload)
      const doctorName = created?.user?.full_name || payload.fullname
      toast.success(`Cấp tài khoản cho Bác sĩ "${doctorName}" thành công!`)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const msg = extractErrorMessage(
        error,
        'Không thể tạo tài khoản bác sĩ, vui lòng thử lại!'
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
          if (!isSubmitting) onClose()
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Cấp Tài Khoản Bác Sĩ Mới
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nhập thông tin cá nhân, phân quyền chuyên khoa và mức giá khám
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
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
            {/* 1. Họ và tên */}
            <div className="space-y-1.5">
              <label
                htmlFor="doctor-fullname"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5 text-muted-foreground" />
                  <span>
                    Họ và tên Bác sĩ <span className="text-rose-500">*</span>
                  </span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  VD: BS. Nguyễn Văn A
                </span>
              </label>
              <input
                id="doctor-fullname"
                type="text"
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value)
                  if (errors.fullname) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.fullname
                      return next
                    })
                  }
                }}
                placeholder="Nhập họ và tên đầy đủ của bác sĩ..."
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                  errors.fullname
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                }`}
              />
              {errors.fullname && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.fullname}</span>
                </div>
              )}
            </div>

            {/* 2. Email đăng nhập */}
            <div className="space-y-1.5">
              <label
                htmlFor="doctor-email"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>
                    Địa chỉ Email (Tài khoản) <span className="text-rose-500">*</span>
                  </span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Dùng để đăng nhập hệ thống
                </span>
              </label>
              <input
                id="doctor-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.email
                      return next
                    })
                  }
                }}
                placeholder="doctor.name@clinic.vn"
                disabled={isSubmitting}
                className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* 3. Mật khẩu & Xác nhận mật khẩu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <label
                  htmlFor="doctor-password"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span>
                      Mật khẩu <span className="text-rose-500">*</span>
                    </span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground">Tối thiểu 6 ký tự</span>
                </label>
                <div className="relative">
                  <input
                    id="doctor-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors((prev) => {
                          const next = { ...prev }
                          delete next.password
                          return next
                        })
                      }
                    }}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-background/60 p-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1.5">
                <label
                  htmlFor="doctor-confirm-password"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span>
                      Xác nhận mật khẩu <span className="text-rose-500">*</span>
                    </span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="doctor-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const next = { ...prev }
                          delete next.confirmPassword
                          return next
                        })
                      }
                    }}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border bg-background/60 p-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Chuyên khoa & Giá khám */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chọn chuyên khoa */}
              <div className="space-y-1.5">
                <label
                  htmlFor="doctor-specialty"
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
                  id="doctor-specialty"
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
                  className={`w-full rounded-lg border bg-background/60 p-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 ${
                    errors.specialty_id
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-input focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {specialties.map((spec) => (
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

              {/* Giá khám */}
              <div className="space-y-1.5">
                <label
                  htmlFor="doctor-price"
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
                    id="doctor-price"
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
                    className={`w-full rounded-lg border bg-background/60 p-2.5 pr-10 text-sm font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal transition-colors focus:outline-none focus:ring-2 ${
                      errors.price
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
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Đang khởi tạo...
                </>
              ) : (
                <span>Tạo tài khoản Bác sĩ</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

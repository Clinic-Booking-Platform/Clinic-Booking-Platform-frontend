import React, { useState, useEffect } from 'react'
import {
  X,
  Users,
  FileText,
  Calendar,
  Mail,
  Phone,
  Stethoscope,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { specialtyService } from '@/services/specialty.api'
import type { Specialty } from '@/types/specialty.types'

interface SpecialtyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  specialtyId: number | null
}

export const SpecialtyDetailModal: React.FC<SpecialtyDetailModalProps> = ({
  isOpen,
  onClose,
  specialtyId,
}) => {
  const [data, setData] = useState<Specialty | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(specialtyId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    if (isOpen && specialtyId) {
      specialtyService
        .getSpecialtyById(specialtyId)
        .then((res) => {
          if (!ignore) {
            setData(res)
            setError(null)
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err?.response?.data?.message || 'Không thể tải chi tiết chuyên khoa!')
            setIsLoading(false)
          }
        })
    }

    return () => {
      ignore = true
    }
  }, [isOpen, specialtyId])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  const doctors = data?.doctors || []
  const doctorCount = data?._count?.doctors ?? doctors.length
  const articleCount = data?._count?.articles ?? 0
  const isDeleted = Boolean(data?.deleted_at)

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // Get initial letters for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'BS'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Stethoscope className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Hồ Sơ Chi Tiết Chuyên Khoa
              </h2>
              <p className="text-xs text-muted-foreground">
                Thông tin tổng quan và đội ngũ bác sĩ trực thuộc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs text-muted-foreground">
                Đang tải dữ liệu chuyên khoa và danh sách bác sĩ...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center">
              <AlertTriangle className="size-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (specialtyId) {
                    setIsLoading(true)
                    specialtyService
                      .getSpecialtyById(specialtyId)
                      .then(setData)
                      .catch((e) => setError(e?.message))
                      .finally(() => setIsLoading(false))
                  }
                }}
                className="mt-4 text-xs"
              >
                Thử tải lại
              </Button>
            </div>
          ) : data ? (
            <>
              {/* 1. Phần Tổng Quan Chuyên Khoa */}
              <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                {/* Ảnh lớn chuyên khoa */}
                <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted flex items-center justify-center">
                  {data.image_url ? (
                    <img
                      src={data.image_url}
                      alt={data.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="size-10 text-teal-600 dark:text-teal-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {data.name}
                    </h3>
                    {isDeleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Đã vô hiệu hóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Đang hoạt động
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.description || 'Chưa có thông tin mô tả chi tiết cho chuyên khoa này.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      <span>Ngày xóa: {formatDate(data!.deleted_at!)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Thẻ Thống Kê Nhanh */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Đội ngũ Bác sĩ</div>
                    <div className="text-lg font-bold text-foreground">
                      {doctorCount} <span className="text-xs font-normal text-muted-foreground">bác sĩ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Bài viết y khoa</div>
                    <div className="text-lg font-bold text-foreground">
                      {articleCount} <span className="text-xs font-normal text-muted-foreground">bài viết</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Danh Sách Bác Sĩ Trực Thuộc */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <UserCheck className="size-4 text-teal-600" />
                    <span>Danh sách Bác sĩ trực thuộc ({doctors.length})</span>
                  </h4>
                </div>

                {doctors.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                    <Users className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Chưa có bác sĩ nào được phân công vào chuyên khoa này.
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                      Bạn có thể phân công bác sĩ trong mục Quản lý Bác sĩ.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden">
                    {doctors.map((doc, idx) => {
                      const doctorName = doc.user?.full_name || doc.full_name || 'Bác sĩ'
                      const doctorAvatar = doc.user?.avatar || doc.avatar
                      const doctorEmail = doc.user?.email || doc.email || 'Chưa cập nhật email'
                      const doctorPhone = doc.user?.phone_number || doc.phone_number || 'Chưa cập nhật SĐT'

                      return (
                        <div
                          key={doc.id || idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar size="default" className="size-10 border border-border/60">
                              {doctorAvatar && <AvatarImage src={doctorAvatar} alt={doctorName} />}
                              <AvatarFallback className="bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold text-xs">
                                {getInitials(doctorName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {doctorName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: #{doc.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-13 sm:pl-0">
                            <div className="flex items-center gap-1.5" title="Email liên hệ">
                              <Mail className="size-3.5 text-muted-foreground/70" />
                              <span className="truncate max-w-[180px]">{doctorEmail}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Số điện thoại">
                              <Phone className="size-3.5 text-muted-foreground/70" />
                              <span>{doctorPhone}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-border/60 bg-muted/20 px-6 py-3.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs px-4"
          >
            Đóng lại
          </Button>
        </div>
      </div>
    </div>
  )
}

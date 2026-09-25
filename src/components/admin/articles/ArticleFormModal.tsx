import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Stethoscope,
  UserCheck,
  FileText,
  AlertCircle,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { ArticleRichTextEditor } from './ArticleRichTextEditor'
import { articleApi } from '@/services/article.api'
import { uploadService } from '@/services/upload.api'
import {
  createArticleSchema,
  updateArticleSchema,
  extractErrorMessage,
  slugify,
  fetchAllDoctors,
  fetchAllSpecialties,
} from './article.utils'
import type { Article, CreateArticleDto, UpdateArticleDto } from '@/types/article.types'
import type { Specialty } from '@/types/specialty.types'
import type { Doctor } from '@/types/doctor.types'

interface ArticleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  article?: Article | null // Nếu có là edit, không có là create
}

interface FormState {
  title: string
  thumbnail_url: string
  short_description: string
  html_content: string
  specialty_id: number | ''
  author_id: number | ''
}

export const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  article,
}) => {
  const isEdit = Boolean(article)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form State
  const [formData, setFormData] = useState<FormState>({
    title: '',
    thumbnail_url: '',
    short_description: '',
    html_content: '',
    specialty_id: '',
    author_id: '',
  })

  // Errors state (strictly inline errors, NO toast for validation)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Dropdown options
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  // Loading states
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [isFetchingDetail, setIsFetchingDetail] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetch dropdown options (specialties & doctors) once when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setIsLoadingOptions(true)

    Promise.all([
      fetchAllSpecialties('active'),
      fetchAllDoctors('all'),
    ])
      .then(([specList, docList]) => {
        if (!isMounted) return
        setSpecialties(specList)
        setDoctors(docList)
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptions(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // 2. Fetch full article detail if editing (to populate html_content)
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    if (article) {
      setIsFetchingDetail(true)
      setErrors({})

      // Cập nhật các trường cơ bản từ article hiện có
      setFormData({
        title: article.title || '',
        thumbnail_url: article.thumbnail_url || '',
        short_description: article.short_description || '',
        html_content: article.article_detail?.html_content || '',
        specialty_id: article.specialty_id || '',
        author_id: article.author_id || '',
      })

      // Fetch detail API để lấy nội dung HTML mới nhất & đầy đủ nhất
      articleApi
        .getArticleById(article.id)
        .then((detail) => {
          if (!isMounted) return
          setFormData({
            title: detail.title || '',
            thumbnail_url: detail.thumbnail_url || '',
            short_description: detail.short_description || '',
            html_content: detail.article_detail?.html_content || '',
            specialty_id: detail.specialty_id || '',
            author_id: detail.author_id || '',
          })
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Lỗi khi tải chi tiết bài viết:', err)
        })
        .finally(() => {
          if (isMounted) setIsFetchingDetail(false)
        })
    } else {
      // Create mode: reset form
      setFormData({
        title: '',
        thumbnail_url: '',
        short_description: '',
        html_content: '',
        specialty_id: '',
        author_id: '',
      })
      setErrors({})
      setIsFetchingDetail(false)
    }

    return () => {
      isMounted = false
    }
  }, [isOpen, article])

  // Close modal on Escape
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

  // Xử lý thay đổi input text/textarea
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Khi chọn Bác sĩ, tự động gán chuyên khoa của bác sĩ đấy
    if (name === 'author_id') {
      const docId = value ? Number(value) : ''
      const matchedDoc = doctors.find((d) => d.id === docId)
      const autoSpecialtyId = matchedDoc?.specialty_id || ''

      setFormData((prev) => ({
        ...prev,
        author_id: docId,
        specialty_id: autoSpecialtyId,
      }))

      setErrors((prev) => {
        const next = { ...prev }
        delete next.author_id
        delete next.specialty_id
        return next
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'specialty_id' ? (value ? Number(value) : '') : value,
    }))

    // Xóa lỗi inline của trường này nếu người dùng bắt đầu sửa
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  // Xử lý upload ảnh qua uploadService
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, thumbnail_url: 'Vui lòng chọn tệp định dạng hình ảnh hợp lệ (PNG, JPG, WEBP).' }))
      return
    }

    // Kiểm tra dung lượng tối đa 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail_url: 'Kích thước ảnh không được vượt quá 5MB.' }))
      return
    }

    try {
      setIsUploadingImage(true)
      const uploadedUrl = await uploadService.uploadSingle(file)
      setFormData((prev) => ({ ...prev, thumbnail_url: uploadedUrl }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.thumbnail_url
        return next
      })
    } catch (err) {
      setErrors((prev) => ({ ...prev, thumbnail_url: extractErrorMessage(err) || 'Upload ảnh thất bại.' }))
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Xử lý Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Client-side Zod validation
    // Lưu ý: User quy định nghiêm ngặt: "phần form không cần toast chỉ cần error dưới input đủ rồi"
    if (isEdit) {
      const payload: UpdateArticleDto = {
        title: formData.title.trim(),
        thumbnail_url: formData.thumbnail_url.trim(),
        short_description: formData.short_description.trim() || undefined,
        html_content: formData.html_content.trim(),
      }

      const result = updateArticleSchema.safeParse(payload)
      if (!result.success) {
        const newErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const path = issue.path[0] as string
          if (!newErrors[path]) {
            newErrors[path] = issue.message
          }
        }
        setErrors(newErrors)
        return
      }

      // 2. Gửi API Cập nhật
      try {
        setIsSubmitting(true)
        await articleApi.updateArticle(article!.id, payload)
        toast.success('Cập nhật bài viết y tế thành công!')
        onSuccess()
        onClose()
      } catch (err) {
        toast.error(extractErrorMessage(err))
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Create mode
      const selectedDoc = doctors.find((d) => d.id === Number(formData.author_id))
      const autoSpecialtyId =
        selectedDoc?.specialty_id ||
        (formData.specialty_id ? Number(formData.specialty_id) : undefined)

      const payload: CreateArticleDto = {
        title: formData.title.trim(),
        thumbnail_url: formData.thumbnail_url.trim(),
        short_description: formData.short_description.trim() || undefined,
        html_content: formData.html_content.trim(),
        specialty_id: autoSpecialtyId,
        author_id: Number(formData.author_id),
      }

      const result = createArticleSchema.safeParse(payload)
      if (!result.success) {
        const newErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const path = issue.path[0] as string
          if (!newErrors[path]) {
            newErrors[path] = issue.message
          }
        }
        setErrors(newErrors)
        return
      }

      // Gửi API Tạo mới
      try {
        setIsSubmitting(true)
        await articleApi.createArticle(payload)
        toast.success('Xuất bản bài viết y khoa mới thành công!')
        onSuccess()
        onClose()
      } catch (err) {
        toast.error(extractErrorMessage(err))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const slug = slugify(formData.title)

  // Bác sĩ đang chọn & Chuyên khoa tự động gán
  const selectedDoctor = doctors.find((d) => d.id === Number(formData.author_id))
  const autoSpecialtyName =
    selectedDoctor?.specialty?.name ||
    specialties.find((s) => s.id === (selectedDoctor?.specialty_id || Number(formData.specialty_id)))?.name ||
    (isEdit ? article?.specialty?.name : undefined)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting && !isUploadingImage) onClose()
        }}
      />

      {/* Modal Dialog Box */}
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {isEdit ? 'Chỉnh sửa bài viết y tế' : 'Thêm mới bài viết y khoa'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? 'Cập nhật nội dung, tiêu đề và hình ảnh cho bài viết hiện tại'
                  : 'Soạn thảo kiến thức chuyên khoa, tin tức y tế cho cổng thông tin phòng khám'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || isUploadingImage}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isFetchingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin text-teal-600" />
              <p className="text-sm text-muted-foreground">
                Đang tải đầy đủ nội dung bài viết...
              </p>
            </div>
          ) : (
            <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CỘT CHÍNH (Trái - 8 cols trên desktop) */}
                <div className="lg:col-span-8 space-y-5">
                  {/* 1. Tiêu đề bài viết */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>
                        Tiêu đề bài viết <span className="text-rose-500">*</span>
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
                      placeholder="Ví dụ: 7 Dấu hiệu sớm cảnh báo bệnh tiểu đường type 2..."
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                        errors.title
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-border/80 focus:border-teal-500'
                      }`}
                    />
                    {/* Slug preview */}
                    {slug && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-mono truncate">
                        <span>Đường dẫn dự kiến:</span>
                        <span className="text-teal-600 dark:text-teal-400">/bai-viet/{slug}</span>
                      </div>
                    )}
                    {errors.title && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3 shrink-0" />
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. Mô tả tóm tắt (Short description) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Mô tả ngắn gọn (Sapo)</span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        {formData.short_description.length}/500 ký tự
                      </span>
                    </label>
                    <textarea
                      name="short_description"
                      rows={3}
                      value={formData.short_description}
                      onChange={handleInputChange}
                      placeholder="Tóm tắt ngắn gọn 1-3 câu để hiển thị trên thẻ bài viết và danh sách tin tức..."
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-background text-foreground transition-all outline-none resize-none focus:ring-2 focus:ring-teal-500/20 ${
                        errors.short_description
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-border/80 focus:border-teal-500'
                      }`}
                    />
                    {errors.short_description && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3 shrink-0" />
                        <span>{errors.short_description}</span>
                      </p>
                    )}
                  </div>

                  {/* 3. Soạn thảo Nội dung bài viết (Rich Text Editor) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>
                        Nội dung chi tiết bài viết <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Hỗ trợ định dạng Tiêu đề, In đậm, Danh sách, Trích dẫn y khoa
                      </span>
                    </label>

                    <ArticleRichTextEditor
                      value={formData.html_content}
                      onChange={(newHtml) => {
                        setFormData((prev) => ({ ...prev, html_content: newHtml }))
                        if (errors.html_content) {
                          setErrors((prev) => {
                            const next = { ...prev }
                            delete next.html_content
                            return next
                          })
                        }
                      }}
                      error={errors.html_content}
                    />
                  </div>
                </div>

                {/* CỘT PHỤ (Phải - 4 cols trên desktop) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* 1. Ảnh bìa / Thumbnail */}
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>
                        Ảnh bìa bài viết <span className="text-rose-500">*</span>
                      </span>
                      {isUploadingImage && (
                        <span className="text-[11px] text-teal-600 flex items-center gap-1">
                          <Loader2 className="size-3 animate-spin" /> Đang tải lên...
                        </span>
                      )}
                    </label>

                    {/* Preview box */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-dashed border-border/80 bg-card flex flex-col items-center justify-center group shadow-2xs">
                      {formData.thumbnail_url ? (
                        <>
                          <img
                            src={formData.thumbnail_url}
                            alt="Ảnh bìa"
                            className="size-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-lg bg-white/90 p-2 text-foreground hover:bg-white text-xs font-medium shadow-md transition-colors"
                            >
                              Đổi ảnh
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: '' }))}
                              className="rounded-lg bg-rose-600/90 p-2 text-white hover:bg-rose-600 text-xs font-medium shadow-md transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-muted/50 size-full transition-colors"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 mb-2">
                            <UploadCloud className="size-5" />
                          </div>
                          <p className="text-xs font-medium text-foreground">
                            Bấm để tải ảnh lên
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PNG, JPG, WEBP tối đa 5MB
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
                      disabled={isUploadingImage}
                    />

                    {/* Hoặc nhập URL thủ công */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Hoặc dán URL ảnh trực tiếp:</span>
                      </div>
                      <div className="relative">
                        <ImageIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                        <input
                          type="url"
                          name="thumbnail_url"
                          value={formData.thumbnail_url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full rounded-lg border border-border/70 bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                    </div>

                    {errors.thumbnail_url && (
                      <p className="text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="size-3 shrink-0" />
                        <span>{errors.thumbnail_url}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. Tác giả / Bác sĩ phụ trách (Bước 1: Chọn bác sĩ) */}
                  <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-teal-600 dark:text-teal-400" />
                        <span>
                          Bác sĩ tác giả {!isEdit && <span className="text-rose-500">*</span>}
                        </span>
                      </span>
                      {!isEdit && (
                        <span className="text-[11px] text-teal-600 font-normal">
                          Chọn bác sĩ viết bài
                        </span>
                      )}
                    </label>

                    {isEdit ? (
                      <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        <span className="font-medium text-foreground">
                          {article?.author?.user?.full_name || 'Bác sĩ phụ trách'}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          * Tác giả được cố định sau khi bài viết được khởi tạo
                        </p>
                      </div>
                    ) : (
                      <>
                        <select
                          name="author_id"
                          value={formData.author_id}
                          onChange={handleInputChange}
                          disabled={isLoadingOptions}
                          className={`w-full rounded-xl border px-3 py-2 text-xs bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                            errors.author_id
                              ? 'border-rose-500'
                              : 'border-border/80 focus:border-teal-500'
                          }`}
                        >
                          <option value="">-- Chọn bác sĩ viết bài --</option>
                          {doctors
                            .filter((doc) => !doc.deleted_at || doc.id === formData.author_id)
                            .map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.user?.full_name || `Bác sĩ #${doc.id}`}
                                {doc.specialty ? ` — CK: ${doc.specialty.name}` : ''}
                              </option>
                            ))}
                        </select>
                        {errors.author_id && (
                          <p className="text-xs text-rose-500 flex items-center gap-1">
                            <AlertCircle className="size-3 shrink-0" />
                            <span>{errors.author_id}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* 3. Chuyên khoa liên quan (Tự động gán theo Bác sĩ) */}
                  <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="size-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Chuyên khoa bài viết</span>
                      </span>
                      {autoSpecialtyName && (
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>Tự động gán</span>
                        </span>
                      )}
                    </label>

                    {isEdit ? (
                      <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                        {article?.specialty?.name ? (
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            {article.specialty.name}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">Chưa phân chuyên khoa</span>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          * Chuyên khoa được cố định theo tác giả bài viết
                        </p>
                      </div>
                    ) : autoSpecialtyName ? (
                      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-teal-500 inline-block animate-pulse" />
                          <span>{autoSpecialtyName}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Hệ thống tự động liên kết bài viết vào chuyên khoa của bác sĩ đã chọn.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <Stethoscope className="size-4 text-muted-foreground/60 shrink-0" />
                        <span>Vui lòng chọn Bác sĩ ở trên để tự động gán chuyên khoa.</span>
                      </div>
                    )}
                  </div>

                  {/* Tips Box */}
                  <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 space-y-1.5">
                    <h5 className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                      <ExternalLink className="size-3" />
                      <span>Chuẩn bài viết Y tế (SEO & Y đức)</span>
                    </h5>
                    <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
                      <li>Tiêu đề ngắn gọn, tập trung vào thắc mắc thực tế của bệnh nhân.</li>
                      <li>Nội dung chia rõ các mục H2, H3 theo triệu chứng & phòng ngừa.</li>
                      <li>Luôn khuyến cáo bệnh nhân thăm khám trực tiếp tại phòng khám.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="flex items-center justify-between border-t border-border/80 px-6 py-3.5 bg-muted/30 shrink-0">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {isEdit ? 'Đang chỉnh sửa bài viết' : 'Bài viết mới sẽ hiển thị tức thì trên cổng bệnh nhân'}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting || isUploadingImage}
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              form="article-form"
              size="sm"
              disabled={isSubmitting || isUploadingImage || isFetchingDetail}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                'Lưu thay đổi'
              ) : (
                'Xuất bản bài viết'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

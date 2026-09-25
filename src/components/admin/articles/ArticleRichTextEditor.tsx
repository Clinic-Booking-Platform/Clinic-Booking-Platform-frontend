import React, { useState, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
  FileText,
  RotateCcw,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export const ArticleRichTextEditor: React.FC<ArticleRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết y khoa, kiến thức sức khỏe tại đây...',
  disabled = false,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'preview'>('visual')
  const contentEditableRef = useRef<HTMLDivElement>(null)

  // Đồng bộ value vào contentEditable khi tab visual active hoặc khi dữ liệu được load từ API
  useEffect(() => {
    if (activeTab === 'visual' && contentEditableRef.current) {
      const isFocused = document.activeElement === contentEditableRef.current
      if (!isFocused || !contentEditableRef.current.innerHTML) {
        if (contentEditableRef.current.innerHTML !== value) {
          contentEditableRef.current.innerHTML = value || ''
        }
      }
    }
  }, [value, activeTab])

  // Lệnh format document.execCommand
  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (disabled) return
    document.execCommand(command, false, arg)
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML)
    }
  }

  // Chèn hình ảnh qua đường dẫn URL
  const insertImagePrompt = () => {
    if (disabled) return
    const url = window.prompt('Nhập đường dẫn URL hình ảnh muốn chèn:')
    if (url && url.trim()) {
      execCmd('insertImage', url.trim())
    }
  }

  // Chèn mẫu bài viết y khoa chuẩn
  const insertArticleTemplate = () => {
    const template = `
<h2>1. Tổng quan & Dấu hiệu nhận biết sớm</h2>
<p>Mô tả tổng quan về bệnh lý, các triệu chứng lâm sàng ban đầu mà người bệnh thường gặp phải...</p>

<h2>2. Nguyên nhân & Các yếu tố nguy cơ</h2>
<p>Những nguyên nhân chính gây bệnh và đối tượng có nguy cơ mắc bệnh cao (độ tuổi, lối sống, tiền sử gia đình):</p>
<ul>
  <li>Chế độ dinh dưỡng không hợp lý (nhiều muối, chất béo bão hòa...)</li>
  <li>Thói quen ít vận động thể lực và căng thẳng kéo dài</li>
  <li>Các yếu tố bệnh lý nền liên quan</li>
</ul>

<h2>3. Phương pháp chẩn đoán & Phác đồ điều trị</h2>
<p>Bác sĩ sẽ tiến hành thăm khám lâm sàng kết hợp các xét nghiệm cận lâm sàng cần thiết:</p>
<ul>
  <li>Khám chuyên khoa và đo chỉ số sinh hiệu</li>
  <li>Chẩn đoán hình ảnh và xét nghiệm chuyên sâu</li>
</ul>
<blockquote>"Việc phát hiện sớm và tuân thủ đúng phác đồ điều trị đóng vai trò quyết định đến hiệu quả phục hồi sức khỏe."</blockquote>

<h2>4. Lời khuyên phòng ngừa từ Bác sĩ chuyên khoa</h2>
<p>Để bảo vệ sức khỏe và chủ động phòng ngừa, mỗi người nên duy trì thói quen thăm khám sức khỏe định kỳ 6 tháng/lần và xây dựng lối sống lành mạnh.</p>
`
    onChange((value ? value + '<br/>' : '') + template)
  }

  return (
    <div className="space-y-1">
      <div
        className={`rounded-xl border bg-background overflow-hidden transition-all ${
          error
            ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
            : 'border-border/80 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20'
        }`}
      >
        {/* Toolbar & Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/60 bg-muted/30 p-2">
        {/* Formatting Buttons (chỉ hiển thị khi ở tab visual) */}
        {activeTab === 'visual' ? (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('bold')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('italic')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('underline')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('formatBlock', '<h2>')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Tiêu đề chính (H2)"
            >
              <Heading2 className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('formatBlock', '<h3>')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Tiêu đề phụ (H3)"
            >
              <Heading3 className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('insertUnorderedList')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Danh sách gạch đầu dòng"
            >
              <List className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('insertOrderedList')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Danh sách đánh số"
            >
              <ListOrdered className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('formatBlock', '<blockquote>')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Khối trích dẫn (Quote)"
            >
              <Quote className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={insertImagePrompt}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Chèn ảnh minh họa qua URL"
            >
              <ImageIcon className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={insertArticleTemplate}
              className="hidden sm:inline-flex text-[11px] gap-1 h-7 border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              title="Chèn cấu trúc bài viết y khoa chuẩn"
            >
              <FileText className="size-3 text-teal-600 dark:text-teal-400" />
              <span>Chèn mẫu bài viết</span>
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-medium px-1">
            {activeTab === 'html'
              ? 'Chế độ chỉnh sửa trực tiếp mã HTML'
              : 'Xem trước giao diện người đọc thực tế'}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg ml-auto">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'visual'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="size-3" />
            <span className="hidden sm:inline">Soạn thảo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'html'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="size-3" />
            <span>HTML</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="size-3" />
            <span className="hidden sm:inline">Xem trước</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3">
        {activeTab === 'visual' && (
          <div
            ref={contentEditableRef}
            contentEditable={!disabled}
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            data-placeholder={placeholder}
            className="min-h-[220px] max-h-[460px] overflow-y-auto text-sm text-foreground outline-none leading-relaxed prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none"
          />
        )}

        {activeTab === 'html' && (
          <textarea
            rows={10}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="<p>Nhập mã nguồn HTML tại đây...</p>"
            className="w-full font-mono text-xs text-foreground bg-transparent border-0 outline-none resize-y"
          />
        )}

        {activeTab === 'preview' && (
          <div className="min-h-[220px] max-h-[460px] overflow-y-auto text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <span className="text-xs text-muted-foreground/60 italic">
                Chưa có nội dung để xem trước.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>Định dạng HTML an toàn cho người đọc tin tức y tế</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-rose-500 hover:text-rose-600 inline-flex items-center gap-1"
          >
            <RotateCcw className="size-2.5" />
            <span>Xóa nội dung</span>
          </button>
        )}
      </div>
    </div>
    {error && (
      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
        <AlertCircle className="size-3 shrink-0" />
        <span>{error}</span>
      </p>
    )}
  </div>
  )
}

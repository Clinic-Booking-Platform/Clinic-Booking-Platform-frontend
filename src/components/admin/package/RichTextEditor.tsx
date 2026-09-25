import React, { useState, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Eye,
  Edit3,
  FileCheck2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập chi tiết các danh mục khám, xét nghiệm, siêu âm...',
  disabled = false,
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

  // Chèn mẫu danh mục khám bệnh viện chuẩn
  const insertTemplate = () => {
    const template = `
<h4>1. Khám chuyên khoa tổng quát</h4>
<ul>
  <li>Khám Nội tổng quát & tư vấn tiền sử bệnh</li>
  <li>Đo chỉ số sinh hiệu (Huyết áp, Mạch, BMI)</li>
  <li>Khám Mắt, Tai Mũi Họng, Răng Hàm Mặt</li>
</ul>
<h4>2. Xét nghiệm huyết học & sinh hóa</h4>
<ul>
  <li>Tổng phân tích tế bào máu ngoại vi (24 thông số)</li>
  <li>Định lượng Glucose máu & HbA1c (Tầm soát tiểu đường)</li>
  <li>Chức năng gan (AST, ALT, GGT) & Thận (Ure, Creatinin)</li>
  <li>Bộ mỡ máu (Cholesterol toàn phần, Triglyceride, HDL, LDL)</li>
</ul>
<h4>3. Chẩn đoán hình ảnh & Thăm dò chức năng</h4>
<ul>
  <li>Chụp X-quang tim phổi thẳng kỹ thuật số</li>
  <li>Siêu âm bụng tổng quát màu Doppler</li>
  <li>Điện tâm đồ (ECG) kiểm tra nhịp tim</li>
</ul>
`
    onChange((value ? value + '<br/>' : '') + template)
  }

  return (
    <div className="rounded-xl border border-border/80 bg-background overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
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
              title="In đậm (Bold)"
            >
              <Bold className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('italic')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="In nghiêng (Italic)"
            >
              <Italic className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('formatBlock', '<h3>')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Tiêu đề mục (H2)"
            >
              <Heading2 className="size-3.5" />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => execCmd('formatBlock', '<h4>')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              title="Tiêu đề con (H3)"
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
              title="Danh sách số thứ tự"
            >
              <ListOrdered className="size-3.5" />
            </button>

            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={insertTemplate}
              className="hidden sm:inline-flex text-[11px] gap-1 h-7 border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              title="Chèn khung danh mục khám mẫu"
            >
              <FileCheck2 className="size-3 text-teal-600 dark:text-teal-400" />
              <span>Chèn mẫu khám y tế</span>
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-medium px-1">
            {activeTab === 'html' ? 'Chế độ chỉnh sửa mã HTML trực tiếp' : 'Xem trước định dạng hiển thị'}
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
            className="min-h-[160px] max-h-[320px] overflow-y-auto text-sm text-foreground outline-none leading-relaxed prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none"
          />
        )}

        {activeTab === 'html' && (
          <textarea
            rows={8}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="<p>Nhập mã nguồn HTML tại đây...</p>"
            className="w-full font-mono text-xs text-foreground bg-transparent border-0 outline-none resize-y"
          />
        )}

        {activeTab === 'preview' && (
          <div className="min-h-[160px] max-h-[320px] overflow-y-auto text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <span className="text-xs text-muted-foreground/60 italic">
                Chưa có nội dung để hiển thị xem trước.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>Định dạng HTML an toàn cho người dùng xem chi tiết gói khám</span>
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
  )
}

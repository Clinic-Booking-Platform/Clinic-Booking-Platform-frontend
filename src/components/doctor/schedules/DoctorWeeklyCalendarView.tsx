import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Lock,
  Users,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import {
  TIME_SLOTS,
  getWeekDays,
  getWeekRangeDisplay,
  normalizeDateStringToYMD,
  getOccupancyPercentage,
  getProgressBarColor,
} from '@/components/schedule/schedule.utils'
import type { Schedule, TimeSlotKey } from '@/types/schedule.types'

interface DoctorWeeklyCalendarViewProps {
  schedules: Schedule[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onAddSchedule: (dateString: string, timeSlotKey: TimeSlotKey) => void
  onSelectSchedule: (schedule: Schedule) => void
  isLoading?: boolean
}

export const DoctorWeeklyCalendarView: React.FC<DoctorWeeklyCalendarViewProps> = ({
  schedules,
  selectedDate,
  onDateChange,
  onAddSchedule,
  onSelectSchedule,
  isLoading = false,
}) => {
  const weekDays = getWeekDays(selectedDate)
  const weekRangeText = getWeekRangeDisplay(selectedDate)

  // Điều hướng tuần
  const handlePrevWeek = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 7)
    onDateChange(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 7)
    onDateChange(next)
  }

  const handleCurrentWeek = () => {
    onDateChange(new Date())
  }

  // Tra cứu ca làm việc theo ngày và mã ca
  const findSchedule = (dateString: string, slotKey: TimeSlotKey): Schedule | undefined => {
    return schedules.find(
      (s) =>
        normalizeDateStringToYMD(s.date) === dateString &&
        s.time_type === slotKey
    )
  }

  const morningSlots = TIME_SLOTS.filter((s) => s.period === 'morning')
  const afternoonSlots = TIME_SLOTS.filter((s) => s.period === 'afternoon')

  return (
    <div className="space-y-4">
      {/* 1. Header điều hướng tuần & Chú thích (Legend) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-4 shadow-2xs">
        {/* Nút lùi/tiến tuần */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border/80 bg-muted/40 p-1 shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              className="h-8 w-8 p-0 cursor-pointer hover:bg-background"
              title="Tuần trước"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCurrentWeek}
              className="h-8 px-3 text-xs font-semibold cursor-pointer hover:bg-background text-teal-700 dark:text-teal-300"
            >
              <span>Tuần này</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className="h-8 w-8 p-0 cursor-pointer hover:bg-background"
              title="Tuần sau"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-border/80">
            <CalendarIcon className="size-4 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-sm tracking-tight text-foreground">
              {weekRangeText}
            </span>
          </div>
        </div>

        {/* Chú thích màu sắc */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>Đang mở nhận</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>Đã đầy ca</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>Đã hủy ca</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-dashed border-border" />
            <span>Chưa đăng ký</span>
          </div>
        </div>
      </div>

      {/* 2. Ma trận Lịch tuần (Weekly Matrix Table) */}
      <div className="relative overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-20 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-md text-sm font-medium text-foreground">
              <span className="size-2 rounded-full bg-teal-600 animate-ping" />
              <span>Đang tải lịch làm việc...</span>
            </div>
          </div>
        )}

        <table className="w-full min-w-[980px] border-collapse text-left">
          {/* Header các ngày trong tuần */}
          <thead>
            <tr className="border-b border-border/80 bg-muted/40">
              <th className="w-32 p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center border-r border-border/60">
                Khung giờ
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.dateString}
                  className={cn(
                    'p-3 text-center border-r border-border/60 last:border-r-0 transition-colors',
                    day.isToday && 'bg-teal-500/10'
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      {day.dayName}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        day.isToday
                          ? 'text-teal-700 dark:text-teal-300'
                          : day.isPast
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      )}
                    >
                      {day.shortDate}
                    </span>
                    {day.isToday && (
                      <span className="mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-teal-600 text-white">
                        Hôm nay
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── SECTION BUỔI SÁNG ── */}
            <tr className="bg-muted/20 border-b border-border/60">
              <td
                colSpan={8}
                className="px-4 py-2 text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider bg-teal-500/5"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-teal-600" />
                  <span>Ca khám Buổi Sáng (T1 - T4: 08:00 - 12:00)</span>
                </div>
              </td>
            </tr>

            {morningSlots.map((slot) => (
              <tr key={slot.key} className="border-b border-border/60 last:border-b-0">
                {/* Cột thời gian bên trái */}
                <td className="p-3 text-center border-r border-border/60 bg-muted/10 align-middle">
                  <div className="font-bold text-xs text-foreground">{slot.key}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{slot.time}</div>
                </td>

                {/* 7 cột cho 7 ngày */}
                {weekDays.map((day) => {
                  const schedule = findSchedule(day.dateString, slot.key)
                  return (
                    <td
                      key={`${day.dateString}-${slot.key}`}
                      className={cn(
                        'p-2 border-r border-border/60 last:border-r-0 align-top transition-colors',
                        day.isToday && 'bg-teal-500/5'
                      )}
                    >
                      {renderSlotContent(day, slot.key, schedule, onAddSchedule, onSelectSchedule)}
                    </td>
                  )
                })}
              </tr>
            ))}

            {/* ── SECTION BUỔI CHIỀU ── */}
            <tr className="bg-muted/20 border-b border-border/60">
              <td
                colSpan={8}
                className="px-4 py-2 text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider bg-cyan-500/5"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-cyan-600" />
                  <span>Ca khám Buổi Chiều (T5 - T8: 13:00 - 17:00)</span>
                </div>
              </td>
            </tr>

            {afternoonSlots.map((slot) => (
              <tr key={slot.key} className="border-b border-border/60 last:border-b-0">
                {/* Cột thời gian bên trái */}
                <td className="p-3 text-center border-r border-border/60 bg-muted/10 align-middle">
                  <div className="font-bold text-xs text-foreground">{slot.key}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{slot.time}</div>
                </td>

                {/* 7 cột cho 7 ngày */}
                {weekDays.map((day) => {
                  const schedule = findSchedule(day.dateString, slot.key)
                  return (
                    <td
                      key={`${day.dateString}-${slot.key}`}
                      className={cn(
                        'p-2 border-r border-border/60 last:border-r-0 align-top transition-colors',
                        day.isToday && 'bg-teal-500/5'
                      )}
                    >
                      {renderSlotContent(day, slot.key, schedule, onAddSchedule, onSelectSchedule)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Helper render ô Slot: Đã có ca hoặc Ô trống
 */
function renderSlotContent(
  day: ReturnType<typeof getWeekDays>[number],
  slotKey: TimeSlotKey,
  schedule: Schedule | undefined,
  onAddSchedule: (dateString: string, timeSlotKey: TimeSlotKey) => void,
  onSelectSchedule: (schedule: Schedule) => void
) {
  // 1. Nếu ĐÃ CÓ CA LÀM VIỆC
  if (schedule) {
    const isCancelled = schedule.status === 'CANCELLED'
    const isFull = schedule.status === 'FULL'
    const isAvailable = schedule.status === 'AVAILABLE'

    const percentage = getOccupancyPercentage(schedule.current_number, schedule.max_number)
    const progressBarColor = getProgressBarColor(percentage)

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectSchedule(schedule)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelectSchedule(schedule)
          }
        }}
        className={cn(
          'w-full p-2.5 rounded-xl border transition-all text-left group cursor-pointer relative overflow-hidden',
          isAvailable &&
            'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 hover:shadow-xs hover:border-emerald-500',
          isFull &&
            'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 hover:shadow-xs hover:border-amber-500',
          isCancelled &&
            'bg-muted/40 dark:bg-muted/20 border-border/80 opacity-75 line-through hover:opacity-100'
        )}
      >
        {/* Top: Status Badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block',
              isAvailable && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
              isFull && 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
              isCancelled && 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
            )}
          >
            {isAvailable && 'Đang nhận'}
            {isFull && 'Đã đầy'}
            {isCancelled && 'Đã hủy'}
          </span>

          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
            {schedule.time_type}
          </span>
        </div>

        {/* Patient Count */}
        <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
          <Users className="size-3 text-muted-foreground shrink-0" />
          <span>
            {schedule.current_number}/{schedule.max_number}{' '}
            <span className="text-[10px] font-normal text-muted-foreground">khách</span>
          </span>
        </div>

        {/* Mini Progress Bar */}
        {!isCancelled && (
          <div className="mt-2 w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', progressBarColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // 2. Ô TRỐNG (CHƯA CÓ CA)
  // Nếu là ngày trong quá khứ -> Disable
  if (day.isPast) {
    return (
      <div className="h-18 rounded-xl border border-dashed border-border/40 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground/50 p-2 cursor-not-allowed">
        <Lock className="size-3.5 mb-0.5" />
        <span className="text-[10px]">Đã qua</span>
      </div>
    )
  }

  // Nếu là ngày hôm nay hoặc tương lai -> Cho phép click tạo nhanh
  return (
    <button
      type="button"
      onClick={() => onAddSchedule(day.dateString, slotKey)}
      className="w-full h-18 rounded-xl border border-dashed border-border/70 hover:border-teal-500 hover:bg-teal-500/5 flex flex-col items-center justify-center text-muted-foreground hover:text-teal-600 transition-all p-2 group cursor-pointer"
      title={`Đăng ký ca ${slotKey} ngày ${day.dayName} (${day.shortDate})`}
    >
      <Plus className="size-4 group-hover:scale-125 transition-transform text-muted-foreground group-hover:text-teal-600" />
      <span className="text-[10px] font-medium mt-1 group-hover:font-semibold">Đăng ký ca</span>
    </button>
  )
}

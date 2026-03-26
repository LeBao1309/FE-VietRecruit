import { APPLICATION_STATUS, type ApplicationStatus } from '@/core/constants/enums'

export interface StageConfig {
  status: ApplicationStatus
  label: string
  labelShort: string
  color: string
  textColor: string
  dotColor: string
  order: number
  isTerminal: boolean
}

export const PIPELINE_STAGE_CONFIG: StageConfig[] = [
  { status: APPLICATION_STATUS.NEW,        label: 'Mới',        labelShort: 'Mới',       color: '#64748B', textColor: '#64748B', dotColor: '#64748B', order: 1, isTerminal: false },
  { status: APPLICATION_STATUS.SCREENING,  label: 'Sàng lọc',   labelShort: 'Sàng lọc',  color: '#009898', textColor: '#009898', dotColor: '#009898', order: 2, isTerminal: false },
  { status: APPLICATION_STATUS.INTERVIEW,  label: 'Phỏng vấn',  labelShort: 'Phỏng vấn', color: '#3B82F6', textColor: '#3B82F6', dotColor: '#3B82F6', order: 3, isTerminal: false },
  { status: APPLICATION_STATUS.OFFER,      label: 'Đề xuất',    labelShort: 'Đề xuất',   color: '#D97706', textColor: '#D97706', dotColor: '#D97706', order: 4, isTerminal: false },
  { status: APPLICATION_STATUS.HIRED,      label: 'Đã tuyển',   labelShort: 'Đã tuyển',  color: '#059669', textColor: '#059669', dotColor: '#059669', order: 5, isTerminal: true },
  { status: APPLICATION_STATUS.REJECTED,   label: 'Từ chối',    labelShort: 'Từ chối',   color: '#DC2626', textColor: '#DC2626', dotColor: '#DC2626', order: 6, isTerminal: true },
]

export const PIPELINE_STAGES_ORDERED = [...PIPELINE_STAGE_CONFIG].sort((a, b) => a.order - b.order)
export const PIPELINE_STAGES_ACTIVE = PIPELINE_STAGES_ORDERED.filter((s) => !s.isTerminal)

export function getStageConfig(status: ApplicationStatus): StageConfig {
  return PIPELINE_STAGE_CONFIG.find((s) => s.status === status) || PIPELINE_STAGE_CONFIG[0]!
}

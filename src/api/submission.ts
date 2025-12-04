import { http } from '@/http/http'

// 课题上报接口类型定义
export interface ISubmissionProject {
  id?: number
  workType: string // 上报类型：1-精益生产课题上报，2-最多报一次流程上报，3-网格走听转
  createId?: number
  createBy?: string
  projectType: string // 课题类型
  projectName: string // 课题名称
  projectTarget: string // 课题目标
  solution: string // 解决方式：1-自行解决，2-转交协助解决
  solutionDept?: number // 协助解决部门ID
  isSolve?: string // 是否解决：是/否
  effect?: string // 成效
  fileInfoList?: Array<{
    name: string
    url: string
  }>
  workStatus?: string // 工作状态：01-草稿，02-部门审批，03-公司审批，04-协助部门审批，05-完成，06-驳回
  isSubmit?: number // 是否提交：0-提交审核，1-保存草稿
  passCode?: string // 审批结果：1-通过，0-拒绝，2-转协办部门
  comment?: string // 审批意见
}

export interface ISubmissionQueryParams {
  pageNum?: number
  pageSize?: number
  createBy?: string
  projectName?: string
  workStatus?: string
  solution?: string
}

export interface ISubmissionListResponse {
  rows: ISubmissionProject[]
  total: number
}

// 查询课题上报列表
export function listSubmissionProject(query: ISubmissionQueryParams) {
  return http.get<ISubmissionListResponse>('/moveHome/project/list', query)
}

// 查询课题上报详细
export function getSubmissionProject(id: number) {
  return http.get<ISubmissionProject>(`/moveHome/project/${id}`)
}

// 根据流程主键获取课题上报详细信息
export function selectSubmissionProjectByProcessKey(processKey: string) {
  return http.post<ISubmissionProject>(`/moveHome/project/selectSubmissionProjectByProcessKey/${processKey}`)
}

// 新增课题上报
export function addSubmissionProject(data: ISubmissionProject) {
  return http.post<any>('/moveHome/project/add', data)
}

// 修改课题上报
export function updateSubmissionProject(data: ISubmissionProject) {
  return http.post<any>('/moveHome/project/edit', data)
}

// 删除课题上报
export function delSubmissionProject(ids: { ids: number | number[] }) {
  return http.post<any>('/moveHome/project/remove', ids)
}

// 导出课题上报
export function exportSubmissionProject(query: ISubmissionQueryParams) {
  return http.post<any>('/moveHome/project/export', {}, query)
}

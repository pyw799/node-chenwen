import type * as API from './types'
import type { CustomRequestOptions } from '@/http/types'
import request from '@/http/vue-query'

// 上传文件
export async function uploadFile({ formData, options }: { formData: any; options?: CustomRequestOptions }) {
  return request<unknown>('/file/uploadFile', {
    method: 'POST',
    // headers: {
    //     'Content-Type': 'multipart/form-data',
    // },
    data: formData,
    ...(options || {}),
  })
}

export interface NewsItem {
  bulletinType: string
  contentIns: string
  createBy: string
  createTime: string
  delFlag: string
  endTime: string
  id: number
  isShow: number
  remark: string
  reviewType: number
  startTime: string
  title: string
  updateBy: string
  updateTime: string
  visitNum: number
}

export interface BannerItem {
  contentIns: string
  createBy: string
  createTime: string
  delFlag: string
  endTime: string
  id: number
  isShow: number
  photoUrl: string
  remark: string
  reviewType: number
  startTime: string
  title: string
  updateBy: string
  updateTime: string
  visitNum: number
}

export interface NoticeItem {
  bulletinType: string
  contentIns: string
  createBy: string
  createTime: string
  delFlag: string
  endTime: string
  id: number
  isPinTop: number
  isShow: number
  remark: string
  reviewType: number
  startTime: string
  title: string
  updateBy: string
  updateTime: string
  visitNum: number
}

export interface FileItem {
  createBy: string
  createTime: string
  deleteFlag: string
  endTime: string
  fileName: string
  filePath: string
  fileSize: number
  fileSubclass: string
  fileType: string
  fileUrl: string
  id: number
  moduleName: string
  moduleRecordId: number
  remark: string
  startTime: string
  updateBy: string
  updateTime: string
  uploadTime: string
  uploaderId: number
}

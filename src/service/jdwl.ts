import type * as API from './types'
import type { CustomRequestOptions } from '@/http/types'

import request from '@/http/vue-query'
/**
 * 调用后端接口：根据用户经纬度匹配营业厅
 * @param params - { latitude: number, longitude: number } 用户当前经纬度
 */
export function getShopByLocation(params: { latitude: number; longitude: number }) {
  console.log('开始请求，参数：', params) // 确认参数

  return request<unknown>('/jdwl/hall/match-shop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...{},
  })
}
export async function addjdwlOrderProcessForXQ({ body, options }: { body: API.User; options?: CustomRequestOptions }) {
  return request<unknown>('/jdwl/orderProcess/addForXQ', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
export async function addjdwlOrderProcess({ body, options }: { body: API.User; options?: CustomRequestOptions }) {
  return request<unknown>('/jdwl/orderProcess/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

// 获取字典数据
export async function userUsernameUsingGet({ params, options }: { params: API.userDictGetParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/system/dict/data/type/${params.dictType}`, {
    method: 'GET',
    ...(options || {}),
  })
}

// 获取降档挽留列表
export async function orderProcessList({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/jdwl/orderProcess/list`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

// 获取降档挽留详情
export async function orderProcessDetail({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/jdwl/orderProcess/${params.id}`, {
    method: 'GET',
    ...(options || {}),
  })
}

export async function editjdwlOrderProcess({ body, options }: { body: API.User; options?: CustomRequestOptions }) {
  return request<unknown>('/jdwl/orderProcess/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

// 获取装维人员列表
export async function getjdwlTeamList({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/jdwl/orderProcess/getApproceUser`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

// 获取待办列表
export async function getTodoList({ params, options }: { params: API.workflowProcessTodoListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/workflow/process/todoList`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

// 获取已办列表
export async function getDoneList({ params, options }: { params: API.workflowProcessTodoListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/workflow/process/finishedList`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

// 待办已办详情
export async function getTodoDoneDetail({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/jdwl/orderProcess/selectOrderProcessByProcessKey/${params.processKey}`, {
    method: 'POST',
    ...(options || {}),
  })
}

// 流转记录详情
export async function getTodoDoneDetailRecord({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/workflow/process/detail`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

// 获取装维团队列表
export async function getChannel({ params, options }: { params: API.orderProcessListParams; options?: CustomRequestOptions }) {
  return request<API.User>(`/jdwl/orderProcess/getChannel`, {
    method: 'GET',
    ...(options || {}),
    params,
  })
}

import type { CustomRequestOptions } from '@/http/types'
import request from '@/http/vue-query'

// 待办事项列表参数类型
export interface TodoListParams {
  pageNum: number
  pageSize: number
}

export async function getTodoList({ params, options }: { params: TodoListParams; options?: CustomRequestOptions }) {
  return request('/workflow/process/todoList', {
    method: 'GET',
    params,
    ...(options || {}),
  })
}

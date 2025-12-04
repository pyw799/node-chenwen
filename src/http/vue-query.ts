/*
 * @Author: pangyawei
 * @Date: 2025-08-25 15:07:18
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-02 10:40:22
 * @Description: 文件内容描述
 * @filePath: Do not edit
 */
import type { CustomRequestOptions } from '@/http/types'
import { http } from './http'

/*
 * openapi-ts-request 工具的 request 跨客户端适配方法
 */
export default function request<T = unknown>(
  url: string,
  options: Omit<CustomRequestOptions, 'url'> & {
    params?: Record<string, unknown>
    headers?: Record<string, unknown>
  },
) {
  const requestOptions = {
    url,
    ...options,
  }

  console.log('requestOptions: ', requestOptions)

  if (options.params) {
    requestOptions.query = requestOptions.params
    delete requestOptions.params
  }

  if (options.headers) {
    requestOptions.header = options.headers
    delete requestOptions.headers
  }

  return http<T>(requestOptions)
}

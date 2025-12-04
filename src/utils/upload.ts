import { useTokenStore } from '@/store/token'

// 文件上传配置接口
export interface IUploadConfig {
  // 上传地址
  uploadUrl?: string
  // 文件数量限制
  maxCount?: number
  // 文件大小限制（MB）
  maxFileSize?: number
  // 允许的文件类型
  allowedTypes?: string[]
  // 是否支持多选
  multiple?: boolean
  // 自定义请求头
  headers?: Record<string, string>
}

// 文件信息接口
export interface IFileInfo {
  filePath: string
  fileSize: number
  fileName: string
  id: number | string
  url?: string
  name?: string
}

// 上传结果接口
export interface IUploadResult {
  success: boolean
  files: IFileInfo[]
  errors: string[]
}

// 默认配置
const DEFAULT_CONFIG: Required<IUploadConfig> = {
  uploadUrl: import.meta.env.VITE_APP_PROXY_PREFIX + `/file/uploadFile`,
  maxCount: 5,
  maxFileSize: 50,
  allowedTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
  multiple: true,
  headers: {},
}

/**
 * 文件上传工具函数
 * @param config 上传配置
 * @returns Promise<IUploadResult>
 */
export async function chooseAndUploadFiles(config: IUploadConfig = {}): Promise<IUploadResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const tokenStore = useTokenStore()
  const result: IUploadResult = {
    success: true,
    files: [],
    errors: [],
  }

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = finalConfig.multiple
    input.accept = finalConfig.allowedTypes.map((type) => `.${type}`).join(',')

    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[]
      console.log('选择文件:', files)

      // 检查文件数量限制
      if (files.length > finalConfig.maxCount) {
        result.errors.push(`最多只能上传${finalConfig.maxCount}个文件`)
        result.success = false
        resolve(result)
        return
      }

      for (const file of files) {
        try {
          // 文件类型验证
          const fileName = file.name.split('.')
          const fileExt = fileName[fileName.length - 1].toLowerCase()
          if (!finalConfig.allowedTypes.includes(fileExt)) {
            result.errors.push(`文件格式不正确, 请上传${finalConfig.allowedTypes.join('/')}格式文件!`)
            continue
          }

          // 文件大小验证
          const isLt = file.size / 1024 / 1024 < finalConfig.maxFileSize
          if (!isLt) {
            result.errors.push(`上传文件大小不能超过 ${finalConfig.maxFileSize} MB!`)
            continue
          }

          // 显示加载提示
          uni.showLoading({ title: '正在上传...' })

          // 准备上传数据
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)

          // 准备请求头
          const headers = {
            Authorization: `Bearer ${tokenStore.getToken() || ''}`,
            ...finalConfig.headers,
          }

          // 执行上传
          const response = await fetch(finalConfig.uploadUrl, {
            method: 'POST',
            headers,
            body: uploadFormData,
          })

          const uploadResult = await response.json()

          if (uploadResult.code === 200) {
            // 上传成功，添加到结果中
            result.files.push({
              filePath: uploadResult.data.fileUrl || uploadResult.data.filePath,
              fileSize: uploadResult.data.fileSize || 0,
              fileName: uploadResult.data.fileName || file.name,
              id: uploadResult.data.id || 0,
              url: uploadResult.data.fileUrl || uploadResult.data.filePath,
              name: uploadResult.data.fileName || file.name,
            })
          } else {
            result.errors.push(uploadResult.msg || '上传失败')
          }
        } catch (error: any) {
          console.error('文件上传失败:', error)
          result.errors.push(error.message || '上传文件失败，请重试')
        } finally {
          uni.hideLoading()
        }
      }

      // 如果有错误，标记为失败
      if (result.errors.length > 0) {
        result.success = false
      }

      resolve(result)
    }

    input.click()
  })
}

/**
 * 单文件上传工具函数
 * @param file 要上传的文件
 * @param config 上传配置
 * @returns Promise<IFileInfo | null>
 */
export async function uploadSingleFile(file: File, config: IUploadConfig = {}): Promise<IFileInfo | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const tokenStore = useTokenStore()

  try {
    // 文件类型验证
    const fileName = file.name.split('.')
    const fileExt = fileName[fileName.length - 1].toLowerCase()
    if (!finalConfig.allowedTypes.includes(fileExt)) {
      throw new Error(`文件格式不正确, 请上传${finalConfig.allowedTypes.join('/')}格式文件!`)
    }

    // 文件大小验证
    const isLt = file.size / 1024 / 1024 < finalConfig.maxFileSize
    if (!isLt) {
      throw new Error(`上传文件大小不能超过 ${finalConfig.maxFileSize} MB!`)
    }

    // 显示加载提示
    uni.showLoading({ title: '正在上传...' })

    // 准备上传数据
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    // 准备请求头
    const headers = {
      Authorization: `Bearer ${tokenStore.getToken() || ''}`,
      ...finalConfig.headers,
    }

    // 执行上传
    const response = await fetch(finalConfig.uploadUrl, {
      method: 'POST',
      headers,
      body: uploadFormData,
    })

    const result = await response.json()

    if (result.code === 200) {
      return {
        filePath: result.data.fileUrl || result.data.filePath,
        fileSize: result.data.fileSize || 0,
        fileName: result.data.fileName || file.name,
        id: result.data.id || 0,
        url: result.data.fileUrl || result.data.filePath,
        name: result.data.fileName || file.name,
      }
    } else {
      throw new Error(result.msg || '上传失败')
    }
  } catch (error: any) {
    console.error('文件上传失败:', error)
    uni.showToast({
      title: error.message || '上传文件失败，请重试',
      icon: 'none',
    })
    return null
  } finally {
    uni.hideLoading()
  }
}

/**
 * 批量上传文件工具函数
 * @param files 要上传的文件列表
 * @param config 上传配置
 * @returns Promise<IUploadResult>
 */
export async function uploadMultipleFiles(files: File[], config: IUploadConfig = {}): Promise<IUploadResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const result: IUploadResult = {
    success: true,
    files: [],
    errors: [],
  }

  // 检查文件数量限制
  if (files.length > finalConfig.maxCount) {
    result.errors.push(`最多只能上传${finalConfig.maxCount}个文件`)
    result.success = false
    return result
  }

  for (const file of files) {
    const uploadResult = await uploadSingleFile(file, config)
    if (uploadResult) {
      result.files.push(uploadResult)
    } else {
      result.errors.push(`文件 ${file.name} 上传失败`)
    }
  }

  // 如果有错误，标记为失败
  if (result.errors.length > 0) {
    result.success = false
  }

  return result
}

/**
 * 显示上传错误提示
 * @param errors 错误信息数组
 */
export function showUploadErrors(errors: string[]) {
  if (errors.length > 0) {
    uni.showToast({
      title: errors[0], // 只显示第一个错误
      icon: 'none',
    })
  }
}

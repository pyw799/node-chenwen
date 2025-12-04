/*
 * @Author: pangyawei
 * @Date: 2025-09-16 15:01:41
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-16 15:20:41
 * @Description: 文件内容描述
 * @filePath: Do not edit
 */
/**
 * 合并用户数据和部门数据，生成包含完整部门路径的用户列表
 */

// 部门树节点类型
interface DeptNode {
  id: number
  label: string
  children?: DeptNode[]
}

// 用户数据类型
interface UserData {
  userId: number
  nickName: string
  deptId: number
  dept: {
    deptId: number
    deptName: string
  } | null
}

// 结果类型
interface MergedUser {
  userId: string
  nickName: string
}

/**
 * 递归查找部门路径
 * @param deptTree 部门树
 * @param targetDeptId 目标部门ID
 * @param path 当前路径
 * @returns 部门路径数组，如果找不到返回null
 */
function findDeptPath(deptTree: DeptNode[], targetDeptId: number, path: string[] = []): string[] | null {
  for (const dept of deptTree) {
    const currentPath = [...path, dept.label]

    // 找到目标部门
    if (dept.id === targetDeptId) {
      return currentPath
    }

    // 递归查找子部门
    if (dept.children && dept.children.length > 0) {
      const result = findDeptPath(dept.children, targetDeptId, currentPath)
      if (result) {
        return result
      }
    }
  }

  return null
}

/**
 * 合并用户数据，生成包含完整部门路径的用户列表
 * @param userList 用户列表数据
 * @param deptTree 部门树数据
 * @returns 合并后的用户列表
 */
export function mergeUserData(userList: any, deptTree: any): MergedUser[] {
  const users = userList.rows || []
  const depts = deptTree.data || []

  return users.map((user: UserData) => {
    let nickName = user.nickName

    // 如果用户有部门信息，构建完整的部门路径
    if (user.deptId) {
      const deptPath = findDeptPath(depts, user.deptId)
      if (deptPath && deptPath.length > 0) {
        // 将部门路径和用户昵称合并，用"/"分隔
        nickName = `${deptPath.join('/')}/${user.nickName}`
      }
    }

    return {
      userId: user.userId.toString(),
      nickName: nickName,
    }
  })
}

/**
 * 使用示例：
 *
 * import { mergeUserData } from '@/utils/mergeUserData'
 *
 * const mergedUsers = mergeUserData(userList, deptList)
 * console.log(mergedUsers)
 *
 * 输出示例：
 * [
 *   { userId: "109", nickName: "开封/本部/综合部/张大大" },
 *   { userId: "110", nickName: "开封/本部/综合部/站" },
 *   ...
 * ]
 */

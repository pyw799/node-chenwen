/*
 * @Author: pangyawei
 * @Date: 2025-08-25 15:07:18
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-09 16:06:04
 * @Description: 文件内容描述
 * @filePath: Do not edit
 */
import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoApi } from '@/api/login'

// 初始化状态
const userInfoState: IUserInfoRes = {
  userId: 0,
  username: '',
  nickname: '',
  avatar: '/static/images/default-avatar.png',
  permissions: [],
  roles: [],
  user: {},
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      userInfo.value = val
    }

    const getUserInfo = () => {
      return userInfo.value
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const removeUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
      try {
        const res = await getUserInfoApi()
        if (res.code === 200) {
          setUserInfo(res)
          return res
        } else {
          throw new Error('获取用户信息失败：返回数据为空')
        }
      } catch (error) {
        throw error
      }
    }

    return {
      userInfo,
      removeUserInfo,
      fetchUserInfo,
      setUserInfo,
      getUserInfo,
      setUserAvatar,
    }
  },
  {
    persist: true,
  },
)

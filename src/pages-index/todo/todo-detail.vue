<!--
 * @Author: pangyawei
 * @Date: 2025-09-25 14:30:00
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-29 15:43:06
 * @Description: 待办事项详情页面
 * @filePath: Do not edit
-->
<route lang="jsonc" type="page">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "需求处理详情",
    "navigationStyle": "custom"
  }
}
</route>

<script lang="ts" setup>
import BottomBtn from '@/components/bottomBtn.vue'
import TopHeader from '@/components/TopHeader.vue'
import { editjdwlOrderProcess, getChannel, getjdwlTeamList, getTodoDoneDetail, getTodoDoneDetailRecord, userUsernameUsingGet } from '@/service/jdwl'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const title = ref(userStore.userInfo.channelName)
const subtitle = ref(userStore.userInfo.user.nickName)
const customerInfo = ref({})
const passCode = ref('1')
const comment = ref('')
const approveUserId = ref('')
const showProcessRecord = ref(false)
const staffOptions = ref([])
const processRecord = ref([])
const needTypeOptions = ref([])
const type = ref('my')
const teamName = ref('')
const esopArea = ref('')
const channelOptions = ref([])
const sopOptions = ref([])

onLoad((options: any) => {
  type.value = options.type
  getChannelOptions()
  getNeedTypeOptions()
  getTodoDoneDetail({ params: { processKey: options.procInsId } }).then((res) => {
    console.log(res, 'res')
    if (res.code === 200) {
      customerInfo.value = res.data
      teamName.value = res.data.approveChannelName
    }
  })
  // userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } }).then(res => {
  //   console.log(res, "res");
  //   if (res.code === 200) {
  //     needTypeOptions.value = res.rows
  //   }
  // })
  getTeamOptions()
})

watch([() => teamName.value, () => esopArea.value], async (newVal) => {
  console.log(newVal, 'newVal')
  if (newVal[0]) {
    const res = await getChannel({ params: { channelName: newVal[0] } })
    sopOptions.value = res.rows
  }
  if (newVal[1]) {
    const res = await getjdwlTeamList({ params: { teamName: newVal[0], esopArea: newVal[1], orderType: '1' } })
    staffOptions.value = res.rows
  }
})

async function getNeedTypeOptions() {
  const res = await userUsernameUsingGet({ params: { dictType: 'jdwl_need_type' } })
  needTypeOptions.value = res.data
}

function getItemTitle(needType: string) {
  const item = needTypeOptions.value?.find(item => item.dictValue === needType)
  return item ? item.dictLabel : needType
}

async function getChannelOptions() {
  const res = await getChannel({ params: { channelName: '' } })
  channelOptions.value = res.rows
}

function handleSubmit() {
  if (!passCode.value) {
    uni.showToast({
      title: '请选择处理方式',
      icon: 'none',
    })
    return
  }
  if (!comment.value.trim()) {
    uni.showToast({
      title: `请输入处理说明`,
      icon: 'none',
    })
    return
  }
  if (passCode.value === '2' && !approveUserId.value) {
    uni.showToast({
      title: '请选择转派人员',
      icon: 'none',
    })
    return
  }
  submitProcess()
}

function submitProcess() {
  uni.showLoading({
    title: '提交中...',
  })
  const submitData = {
    ...customerInfo.value,
    passCode: passCode.value,
    comment: comment.value,
    approveUserId: approveUserId.value,
  }
  editjdwlOrderProcess({ body: submitData }).then((res) => {
    console.log(res, 'res')
    if (res.code === 200) {
      uni.showToast({
        title: '提交成功',
        icon: 'success',
      })
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages-index/todo/todo',
        })
      }, 1500)
    }
  })
}

function showFlowRecord() {
  showProcessRecord.value = true
  getTodoDoneDetailRecord({ params: { procInsId: customerInfo.value.processKey, taskId: customerInfo.value.taskId } }).then((res) => {
    console.log(res, 'res')
    if (res.code === 200) {
      processRecord.value = res.data.historyProcNodeList
    }
  })
}

function getCommentType(val: string) {
  switch (val) {
    case '1':
      return '通过'
    case '2':
      return '退回'
    case '3':
      return '驳回'
    case '4':
      return '委派'
    case '5':
      return '转办'
    case '6':
      return '终止'
    case '7':
      return '撤回'
    default:
      return '-'
  }
}

function getApproveTypeTag(val: string) {
  switch (val) {
    case '1':
      return 'success'
    case '2':
      return 'warning'
    case '3':
      return 'danger'
    case '4':
      return 'primary'
    case '5':
      return 'success'
    case '6':
      return 'danger'
    case '7':
      return 'info'
    default:
      return 'info'
  }
}

function getProcessNotePlaceholder() {
  switch (passCode.value) {
    case 'onsite':
      return '请输入通过意见'
    case 'door':
      return '请输入转派原因及处理意见'
    case 'reject':
      return '请输入驳回原因'
    default:
      return '请输入处理说明'
  }
}

function handleBack() {
  uni.navigateTo({
    url: '/pages-index/todo/todo?type=done',
  })
}
</script>

<template>
  <view class="todo-detail-page min-h-screen bg-[#f5f5f5]">
    <!-- 顶部组件 -->
    <TopHeader :title="title" :subtitle="subtitle" />

    <!-- 主要内容区域 -->
    <view class="content-container">
      <!-- 需求类型信息 -->
      <view class="info-section">
        <view class="info-title">
          {{ getItemTitle(customerInfo.needType) }}
        </view>

        <!-- 客户信息 -->
        <view class="customer-info">
          <view class="info-row">
            <text class="info-label">客户姓名：</text>
            <text class="info-value">{{ customerInfo.customerName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">客户电话：</text>
            <text class="info-value">{{ customerInfo.customerPhone }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">所在地址：</text>
            <text class="info-value">{{ customerInfo.address }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">提交时间：</text>
            <text class="info-value">{{ customerInfo.createTime }}</text>
          </view>
        </view>
      </view>

      <!-- 处理详情卡片 -->
      <view v-if="type === 'my'" class="process-detail-card">
        <!-- 处理方式选择 -->
        <view class="form-row" style="align-items: center;">
          <view class="form-label">
            <span style="color: red;">*</span>处理方式：
          </view>
          <view class="form-content">
            <wd-radio-group v-model="passCode" inline shape="dot">
              <wd-radio value="1">
                通过
              </wd-radio>
              <wd-radio value="2">
                转派
              </wd-radio>
              <wd-radio value="0">
                驳回
              </wd-radio>
            </wd-radio-group>
          </view>
        </view>

        <!-- 处理说明 -->
        <view class="form-row">
          <view class="form-label">
            <span style="color: red;">*</span>处理说明：
          </view>
          <view class="form-content">
            <wd-textarea
              v-model="comment" :placeholder="getProcessNotePlaceholder()" :rows="3" :maxlength="500"
              show-word-limit
            />
          </view>
        </view>
        <template v-if="passCode === '2'">
          <!-- <view class="form-label"><span style="color: red;">*</span>选择转派人员</view>
          <view class="form-content">
            <wd-picker v-model="approveUserId" :columns="staffOptions" value-key="userId" label-key="nickName"
              placeholder="请选择转派人员" />
          </view> -->
          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择装维团队
            </view>
            <view class="form-content">
              <wd-picker
                v-model="teamName" :columns="channelOptions" value-key="resultField" label-key="resultField"
                placeholder="请选择装维团队" disabled
              />
            </view>
          </view>

          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择sop小区
            </view>
            <view class="form-content">
              <wd-picker
                v-model="esopArea" :columns="sopOptions" placeholder="请选择sop小区" label-key="resultField"
                value-key="resultField" :disabled="!teamName"
              />
            </view>
          </view>

          <view class="form-row">
            <view class="form-label">
              <span style="color: red;">*</span>选择装维人员
            </view>
            <view class="form-content">
              <wd-picker
                v-model="approveUserId" :columns="staffOptions" value-key="userId" label-key="nickName"
                placeholder="请选择装维人员" :disabled="!esopArea"
              />
            </view>
          </view>
        </template>
      </view>
    </view>
    <BottomBtn
      v-if="type === 'my'" submit-text="提交" save-draft-text="流转记录" @submit="handleSubmit"
      @save-draft="showFlowRecord"
    />
    <BottomBtn
      v-if="type === 'done'" submit-text="返回" save-draft-text="流转记录" @submit="handleBack"
      @save-draft="showFlowRecord"
    />
    <wd-popup v-model="showProcessRecord" position="bottom" custom-style="height: 70%; border-radius: 20rpx 20rpx 0 0;">
      <view class="process-popup">
        <view class="popup-header">
          <text class="popup-title">流转记录</text>
          <wd-icon name="close" size="20px" @click="showProcessRecord = false" />
        </view>
        <scroll-view scroll-y class="popup-content">
          <wd-steps :active="processRecord.length - 1" vertical custom-class="p-5">
            <wd-step
              v-for="(item, index) in processRecord" :key="index" :title="item.activityName"
              :status="item.endTime ? 'finished' : 'process'"
            >
              <template #description>
                <view class="step-content">
                  <!-- 开始事件 -->
                  <view v-if="item.activityType === 'startEvent'" class="step-card">
                    <text>{{ item.assigneeName }} 在 {{ item.createTime }} 发起流程</text>
                  </view>

                  <!-- 用户任务 -->
                  <view v-if="item.activityType === 'userTask'" class="step-card">
                    <view class="card-row">
                      <text class="label">实际办理：</text>
                      <text>{{ item.assigneeName || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">候选办理：</text>
                      <text>{{ item.candidate || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">接收时间：</text>
                      <text>{{ item.createTime || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">办结时间：</text>
                      <text>{{ item.endTime || "-" }}</text>
                    </view>
                    <view class="card-row">
                      <text class="label">耗时：</text>
                      <text>{{ item.duration || "-" }}</text>
                    </view>

                    <!-- 审批意见 -->
                    <view v-if="item.commentList && item.commentList.length > 0" class="comments">
                      <view
                        v-for="(comment, commentIndex) in item.commentList" :key="commentIndex"
                        class="comment-item"
                      >
                        <view class="comment-header">
                          <wd-tag :type="getApproveTypeTag(comment.type)" size="small">
                            {{ getCommentType(comment.type) }}
                          </wd-tag>
                          <wd-tag type="primary" size="small">
                            {{ comment.time }}
                          </wd-tag>
                        </view>
                        <text class="comment-text">{{ comment.fullMessage }}</text>
                      </view>
                    </view>
                  </view>

                  <!-- 结束事件 -->
                  <view v-if="item.activityType === 'endEvent'" class="step-card">
                    <text>{{ item.createTime }} 结束流程</text>
                  </view>
                </view>
              </template>
            </wd-step>
          </wd-steps>
        </scroll-view>
      </view>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.todo-detail-page {
  .content-container {
    padding: 20rpx;
    padding-bottom: 160rpx;
  }

  .info-section {
    margin-bottom: 20rpx;
    background: white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .info-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    padding-bottom: 24rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 24rpx;
  }

  .customer-info {
    .info-row {
      display: flex;
      margin-bottom: 16rpx;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .info-label {
      font-size: 30rpx;
      color: #666;
      min-width: 140rpx;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 30rpx;
      color: #333;
      flex: 1;
      word-break: break-all;
      font-weight: 500;
    }
  }

  .process-detail-card {
    background: white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 40rpx;
  }

  .form-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    min-width: 160rpx;
    flex-shrink: 0;
    padding-top: 12rpx; // 与表单控件对齐
    line-height: 1.4;
  }

  .form-content {
    flex: 1;
    margin-left: 24rpx;
  }

  .radio-group {
    :deep(.wd-radio) {
      margin-right: 40rpx;
      margin-bottom: 16rpx;

      .wd-radio__label {
        font-size: 30rpx;
        color: #333;
      }
    }
  }

  // 流转记录弹出层样式
  .process-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #eee;

      .popup-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .popup-content {
      flex: 1;
    }

    .step-content {
      margin-top: 12rpx;
    }

    .step-card {
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .card-row {
        display: flex;
        margin-bottom: 12rpx;
        font-size: 26rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          color: #666;
          width: 160rpx;
          flex-shrink: 0;
        }
      }

      .comments {
        margin-top: 20rpx;

        .comment-item {
          margin-bottom: 16rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .comment-header {
            display: flex;
            gap: 12rpx;
            margin-bottom: 8rpx;
          }

          .comment-text {
            font-size: 26rpx;
            color: #333;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

// 覆盖textarea样式
:deep(.wd-textarea) {
  padding: 0;

  .wd-textarea__inner {
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 30rpx;
    line-height: 1.5;
  }

  .wd-textarea__count {
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
  }
}

// 覆盖radio样式
:deep(.wd-radio-group) {
  .wd-radio {
    margin-right: 40rpx;
    margin-bottom: 0;

    .wd-radio__label {
      font-size: 30rpx;
      color: #333;
    }
  }
}

// 覆盖picker样式
:deep(.wd-picker) {
  .wd-picker__field {
    border: 1rpx solid #e5e5e5;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    font-size: 30rpx;
    background-color: #fafafa;

    &.is-focus {
      border-color: #4a90e2;
      background-color: #fff;
    }
  }

  .wd-picker__placeholder {
    color: #999;
    font-size: 30rpx;
  }

  .wd-picker__value {
    color: #333;
    font-size: 30rpx;
  }
}
</style>

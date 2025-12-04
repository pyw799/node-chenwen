<!--
 * @Author: pangyawei
 * @Date: 2025-08-29 11:01:16
 * @LastEditors: pangyawei
 * @LastEditTime: 2025-09-10 15:03:56
 * @Description: 文件内容描述
 * @filePath: Do not edit
-->
<script lang="ts" setup>
const props = defineProps({
  submitText: {
    type: String,
    default: '提交',
  },
  saveDraftText: {
    type: String,
    default: '保存草稿',
  },
})
const emit = defineEmits(['submit', 'saveDraft'])
const saving = ref(false)
const submitting = ref(false)
function submitForm() {
  emit('submit')
}
function saveDraft() {
  emit('saveDraft')
}
</script>

<template>
  <view class="bottom-buttons flex justify-between">
    <wd-button size="medium" block :loading="submitting" class="submit-btn" custom-style="border-radius: 12rpx;"
      @click="submitForm">
      {{ submitText }}
    </wd-button>
    <wd-button type="info" size="medium" block :loading="saving" class="save-btn" custom-style="border-radius: 12rpx;"
      @click="saveDraft">
      {{ saveDraftText }}
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>
// 底部按钮
.bottom-buttons {
  z-index: 2;
  gap: 20rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);

  .submit-btn {
    width: 100%;
  }

  .save-btn {
    background: #f8f9fa;
    color: #666;
    width: 100%;
  }
}
</style>

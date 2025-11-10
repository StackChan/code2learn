import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
import { UserGrade } from '@/types';
import { createApp } from 'vue'
import MarkdownEditorHidePicker from '@/components/MarkdownEditorHidePicker.vue'

/**
 * 隐藏内容插件（未实现）
 * @param availableTag 编辑器允许使用标签
 * @param userGradeList 用户等级
 * @returns 
 */
export function hideContent(availableTag: Array<string>, userGradeList: Array<UserGrade>): BytemdPlugin {

 
  return {
    
  }
}
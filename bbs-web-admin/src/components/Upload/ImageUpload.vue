<!-- 图片上传组件 -->
<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :class="
      fileList.length >= props.limit || !props.showUploadBtn ? 'hide' : 'show'
    "
    :before-upload="handleBeforeUpload"
    :action="props.action"
    :headers="props.headers"
    :data="props.data"
    :name="props.name"
    :on-success="handleSuccessFile"
    :on-error="handleError"
    :accept="props.accept"
    :limit="props.limit"
    :disabled="props.disabled"
  >
    <i-ep-plus />
    <template #file="{ file }">
      <div style="width: 100%">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="previewImg(file)">
            <el-icon><ZoomIn /></el-icon>
          </span>
          <span
            v-if="props.showDelBtn"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <el-icon><Delete /></el-icon>
          </span>
          <!-- 添加下载按钮 -->
          <span>
            <a :href="file.url" download :class="{ 'el-upload-list__item-download': true }">
              <el-icon><Download /></el-icon>
            </a>
          </span>
        </span>
      </div>
    </template>
  </el-upload>

  <el-image-viewer
    v-if="viewVisible"
    :zoom-rate="1.2"
    @close="closePreview"
    :initialIndex="initialIndex"
    :url-list="viewFileList"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  UploadRawFile,
  UploadUserFile,
  UploadFile,
  UploadProps,
} from "element-plus";
import FileAPI from "@/api/file";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<string>,
    default: () => [],
  },
  /**
   * 上传地址
   */
  action: {
    type: String,
    default: FileAPI.uploadUrl,
  },
  /**
   * 请求头
   */
  headers: {
    type: Object,
    default: () => {
      return {
        Authorization: 'Bearer '+window.sessionStorage.getItem('oauth2Token'),
      };
    },
  },
  /**
   * 请求携带的额外参数
   */
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /**
   * 上传文件的参数名
   */
  name: {
    type: String,
    default: "file",
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10,
  },
  /**
   * 是否显示删除按钮
   */
  showDelBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否显示上传按钮
   */
  showUploadBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 单张图片最大大小
   */
  uploadMaxSize: {
    type: Number,
    default: 5 * 1024 * 1024,
  },
  /**
   * 上传文件类型
   */
  accept: {
    type: String,
    default: "image/*",
  },
  /**
   * 是否禁用上传组件
   */
  disabled: {
    type: Boolean,
    default: false,
  },
});

const viewVisible = ref(false);
const initialIndex = ref(0);

const fileList = ref([] as UploadUserFile[]);
const valFileList = ref([] as string[]);
const viewFileList = ref([] as string[]);

watch(
    () => props.modelValue,
    (newVal) => {
      // 处理空值情况：当传入 null/undefined 时转为空数组
      const normalizedValue = Array.isArray(newVal) ? [...newVal] : newVal ? [newVal] : [];

      // 获取当前文件路径列表（排除无效值）
      const currentPaths = fileList.value
      .map(file => file?.url)
      .filter(url => url !== undefined);

      // 深度比较新旧值是否相同（避免无意义更新）
      if (
          currentPaths.length === normalizedValue.length &&
          currentPaths.every((url, index) => url === normalizedValue[index])
      ) {
        return;
      }

      // 同步更新 fileList（保持响应式引用不变）
      fileList.value = normalizedValue.map(url => {
        if (!url) {
          return {
            uid: `${Date.now()}-${Math.random()}`, // 生成唯一标识
            url: '',
            name: '图片', // 如果 url 为空，则设置默认名称
            status: 'success' // 标记为上传成功
          };
        }
        return {
          uid: `${Date.now()}-${Math.random()}`, // 生成唯一标识
          url,
          name: url.split('/').pop() || '图片', // 提取文件名，确保 url 存在
          status: 'success' // 标记为上传成功
        };
      });

      // 更新内部管理的数据副本（如果需要）
      valFileList.value = [...normalizedValue];
    },
    {
      immediate: true,
      deep: true // 添加深度监听确保数组变化能触发
    }
);


/**
 * 上传成功回调
 *
 * @param options
 */
const handleSuccessFile = (response: any, file: UploadFile) => {
  console.log("response", response);
  if (response.error === 0) {
    ElMessage.success("上传成功");
    valFileList.value.push(response.url);
    emit("update:modelValue", valFileList.value);
    console.log("上传成功", valFileList.value);
    return;
  } else {
    ElMessage.error(response.msg || "上传失败");
  }
};

const handleError = (error: any) => {
  ElMessage.error("上传失败");
};

/**
 * 删除图片
 */
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url;
  console.log("filePath",filePath)
  if (filePath) {
    FileAPI.deleteByPath(filePath).then(() => {
      valFileList.value = valFileList.value.filter((x) => x !== filePath);
      // 删除成功回调
      emit("update:modelValue", valFileList.value);
    });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.uploadMaxSize) {
    ElMessage.warning(
      "上传图片不能大于" + Math.trunc(props.uploadMaxSize / 1024 / 1024) + "M"
    );
    return false;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps["onPreview"] = (uploadFile: UploadFile) => {
  viewFileList.value = fileList.value.map((file) => file.url!);
  initialIndex.value = fileList.value.findIndex(
    (file) => file.url === uploadFile.url
  );
  viewVisible.value = true;
};

/**
 * 关闭预览
 */
const closePreview = () => {
  viewVisible.value = false;
};
</script>

<style lang="scss" scoped>
.hide {
  :deep(.el-upload--picture-card) {
    display: none;
  }
}

.show {
  :deep(.el-upload--picture-card) {
    display: flex;
  }
}

/* 确保图标可见 */
.el-upload-list__item-actions .el-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>

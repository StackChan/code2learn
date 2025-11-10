<!-- 添加日记页（基于添加话题功能修改） -->
<template>
    <div class="main">
        <div class="main-container">
            <!-- title="写日记" left-text="返回" -->
            <van-nav-bar title="写日记" :left-text="'返回'" left-arrow @click-left="onBack" @click-right="router.push({path: '/diary'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="form.isRefreshing" :success-text="'刷新成功'" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="addDiaryModule" v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                    <van-form ref="formRef" :scroll-to-error="true" class="form-container">
                        <van-cell-group inset>
                            <!-- label="标题" placeholder="请输入标题" -->
                            <van-field v-model.trim="form.title" label="标题" placeholder="请输入标题（可选）" maxlength="90" clearable/>
                            
                            <van-field center :error-message="error.content">
                                <template #input>
                                    <div style="width: 100%;" :style="form.editorIconCount < 10 ? 'margin-left:0px;' : ''">
                                        <van-sticky :z-index="1">
                                            <div ref="diaryContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 5px;margin-left: -12px;"></div>
                                        </van-sticky>
                                        <div :editorId="'addDiary'" ref="diaryContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                    </div>
                                </template>
                            </van-field>
                            
                            <div class="submitButton">
                                <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit" :loading="form.submitForm_disabled">
                                    保存日记
                                </van-button>
                            </div>
                        </van-cell-group>
                    </van-form>
                </div>
            </van-pull-refresh>
        </div>
        
        <BottomTabbar/>
    </div>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, ref, reactive, onMounted, watchEffect, onUnmounted, nextTick} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { useI18n } from 'vue-i18n';
    import BottomTabbar from '@/components/BottomTabbar.vue';
    import { createEditor, destroyEditor } from '@/utils/editor';
    
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
    
    const formRef = ref();
    const diaryContentEditorToolbarRef = ref();
    const diaryContentEditorTextRef = ref();

    const form = reactive({
        title: '',
        isRefreshing: false,
        submitForm_disabled: false,
        allowSubmit: false,
        editorIconCount: 0,
        content: '',
        editor: null as any
    });

    const error = reactive({
        content: ''
    });

    // 初始化编辑器
    const initEditor = async () => {
        await nextTick();
        if(diaryContentEditorToolbarRef.value && diaryContentEditorTextRef.value){
            form.editor = createEditor('addDiary', diaryContentEditorToolbarRef.value, diaryContentEditorTextRef.value, (content: string) => {
                form.content = content;
                form.allowSubmit = content.trim() != '';
            });
        }
    }

    // 不再需要查询标签，日记不需要标签

    // 下拉刷新
    const onRefresh = () => {
        form.isRefreshing = false;
    }

    // 验证标题
    const validatorTitle = () => {
        return true;
    }

    // 提交表单
    const submitForm = () => {
        form.submitForm_disabled = true;
        form.allowSubmit = false;
        error.content = '';

        let formData = new FormData();
        if(form.title != null && form.title != ''){
            formData.append('title', form.title);
        }
        
        if(form.content != null && form.content != ''){
            formData.append('content', form.content);
        }

        proxy?.$axios({
            url: '/user/control/diary/add',
            method: 'post',
            data: formData,
            loadingMask: false,
        })
        .then((response: AxiosResponse) => {
            const result = response?.data;
            if(result && result.success){
                proxy?.$toast.success("保存成功");
                setTimeout(() => {
                    router.push({path: '/diary'});
                }, 1000);
            } else {
                proxy?.$toast.fail(result?.error?.content || "保存失败");
                form.submitForm_disabled = false;
                form.allowSubmit = true;
            }
        })
        .catch((error: any) => {
            console.log(error);
            proxy?.$toast.fail("保存失败");
            form.submitForm_disabled = false;
            form.allowSubmit = true;
        });
    }

    const onSubmit = () => {
        submitForm();
    }

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = '写日记 - ' + titleValue;
        }
    }, {
        flush: 'post'
    })

    onMounted(async () => {
        store.setCacheComponents(String(router.currentRoute.value.name))
        await initEditor();
    })

    onUnmounted(() => {
        if(form.editor){
            destroyEditor(form.editor);
        }
    })
</script>

<style scoped lang="scss">
.addDiaryModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    
    .form-container{
        .editor-toolbar{
            background: #fff;
        }
        
        .content{
            min-height: 300px;
            padding: 12px;
            border: 1px solid var(--van-gray-4);
            border-radius: var(--van-border-radius-md);
        }
        
        .submit-button{
            margin: 20px 0;
        }
    }
}
</style>


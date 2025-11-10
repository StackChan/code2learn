<!-- Markdown编辑器帮助弹出层 -->
<template>
    <van-popup v-model:show="show_popup" class="markdownEditorHelpPopup" position="bottom" :close-on-popstate="true" close-icon="close" :round="true" :closeable="true"  @closed="closed()">
        <div ref="contentRef" class="container" ></div>
    </van-popup>
</template>
<script lang="ts" setup>
    import { definePropType } from '@/utils/tool';
    import { nextTick, onMounted, ref, render } from 'vue'
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const show_popup = ref(false);
    const contentRef = ref();


    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: HTMLElement,
            default: ''
        },
       
        close: {
            type: definePropType<() => void>(Function),
            required: true,
        }
    })

    //渲染内容
    const renderMessage = () => {
        show_popup.value = props.show;
        nextTick(()=>{
            contentRef.value.appendChild(props.message);
        })
       
    };

    //关闭弹出层且动画结束后触发。
    const closed = () => {
        render(null,contentRef.value);
        props.close();
    }

    onMounted(() => {
        renderMessage();
    }) 

</script>
<style scoped lang="scss">

</style>

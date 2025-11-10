<!-- 头部弹出消息提示 -->
<template>
    <van-popup v-model:show="show" class="notifyHtml" position="top" :overlay="false" :lock-scroll="false" :close-on-popstate="true" :closeable="true"  @closed="closed()">
        <div ref="contentRef" class="container" ></div>
    </van-popup>
</template>
<script lang="ts" setup>
    import { definePropType } from '@/utils/tool';
    import { VNode, onMounted, ref, render } from 'vue'
    const contentRef = ref();

    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: definePropType<string | VNode>([String, Object]),
            default: ''
        },
       
        close: {
            type: definePropType<() => void>(Function),
            required: true,
        }
    })

    //渲染内容
    const renderMessage = () => {
        let type = typeof props.message;
        if (type == 'object') {
            render(props.message as VNode,contentRef.value);
        }else{
            contentRef.value = props.message as string;
        }
        
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

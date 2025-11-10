<!-- emoji表情选择器 -->
<template>
    <van-popup v-model:show="show_popup" class="markdownEditorEmojiPicker" :lock-scroll="false" position="bottom" :close-on-popstate="true" close-icon="close" :round="true" :closeable="true"  @closed="closed()">
        
        <van-loading v-if="show_loading" type="spinner" color="#1989fa" style="height: 100%;  display: flex;flex-direction: column;justify-content: center;align-items: center;"/>
       
        <div ref="emojiPickerRef" class="container"></div>
    </van-popup>
</template>

<script setup lang="ts">
    import { nextTick, onMounted, ref, watchEffect} from 'vue'
    import { Picker } from 'emoji-mart'
    import { definePropType } from '@/utils/tool';
    import i18n_zh from "@emoji-mart/data/i18n/zh.json";
    import i18n_en from "@emoji-mart/data/i18n/en.json";
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';


    const store = useStore(pinia);
    const {currentLanguage:store_currentLanguage} = storeToRefs(store)



    // Emoji picker
    const emojiPickerRef = ref<HTMLElement | null>(null);

    const show_popup = ref(false);

    const show_loading = ref(false);
   
    //接收父组件消息
    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        },
        theme: {//主题
            type: String,
            default: 'auto'
        },
        onEmojiSelect: {//表情符号选择
            type: Function,
            default: null
        },
        close: {
            type: definePropType<() => void>(Function),
            required: true,
        }
      //  onClickOutside: {//在选取器外部发生单击时回调
      //      type: Function,
      //      default: null
      //  },
    })  
    
    /**
     * 设置语言
     */
     const setLanguage = () => {
        if(store_currentLanguage.value == 'zh'){//语言 zh,en
            return i18n_zh;
        }
        return i18n_en;
    }
    const handleCreateEmojiPicker = () => {
        show_popup.value = props.show;
       
        nextTick(()=>{
            const emojiPicker = new Picker({
                data: async () => {
                    show_loading.value = true;
                    const data = await import("@emoji-mart/data");
                    show_loading.value = false
                    return Object.assign({}, data);
                },
                dynamicWidth:true,//动态宽度
                autoFocus: false,//自动焦点
                skinTonePosition:'none',//肤色选择器的位置
                i18n: setLanguage,//用于选取器的本地化数据
                onEmojiSelect: onEmojiSelect,//表情符号选择
            // onClickOutside: onClickOutside,//在选取器外部发生单击时回调
            // ...props,
            });
            emojiPickerRef.value?.appendChild(emojiPicker as unknown as Node);
                
            
        })

       


    };


    //表情符号选择
    const onEmojiSelect = (emoji: { native: string }) => {
        props.onEmojiSelect(emoji);
    };


    //关闭弹出层且动画结束后触发。
    const closed = () => {
        props.close();
    }

    onMounted(() => {
        handleCreateEmojiPicker();
    }) 
   
</script>

<style scoped lang="scss">
//参考https://github.com/missive/emoji-mart/blob/main/packages/emoji-mart-website/example-custom-styles.html
//源代码https://github.com/missive/emoji-mart/blob/d29728f7b4e295e46f9b64aa80335aa4a3c15b8e/packages/emoji-mart/src/components/Picker/PickerStyles.scss#L4
:deep(em-emoji-picker) {
    width: 100%;
    height: 100%;

    --rgb-accent: 64,158,255;//图标、输入框边框颜色
   // --rgb-background: 262, 240, 283;//面板背景颜色
    --rgb-color: 39,46,59;//字体颜色
    --rgb-input: 255,255,255;//输入框焦点背景颜色

    --color-border:rgb(247,248,250);//输入框背景颜色

    --shadow:none;//边框阴影



}
</style>

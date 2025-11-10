<!-- AI对话图片展示 -->
<template>
    <div class="aiChatImageViewModule">

        <div class="image-container">
            <van-image ref="aiChatImageView" width="60vw" height="60vw" @click="openImagePreview" :src="props.src" lazy-load fit="contain">
                <template v-slot:loading><!-- 加载中 -->
                    <van-loading size="8vh" color="#dcdee0"/>
                </template>
                <template v-slot:error><!-- 加载失败 -->
                    <van-icon name="photo-fail" size="10vh" color="#dcdee0"/>
                </template>
            </van-image>
        </div>
        <div class="action-container">
            <!-- 复制 -->
            <van-button plain type="primary" block class="copy" @click="handleCopyImage()">{{t('aiChatImageView.10')}}</van-button>
            <!-- 插入 -->
            <van-button plain type="primary" block @click="handleInsertImage(props.src)">{{t('aiChatImageView.20')}}</van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ImagePreview, Notify } from 'vant';
    import { reactive, ref} from 'vue'
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    //AI对话图片展示
    const aiChatImageView = ref();

    const emit = defineEmits(['insertImage'])
   
    //接收父组件消息
    const props = defineProps({
        src: {//图片地址
            type: String,
            default: ''
        }
    })  



    //打开图片预览
    const openImagePreview = (event: MouseEvent) => {

        ImagePreview([props.src]);
    }
    
    //处理插入图片
    const handleInsertImage = (url: string) => {
        //传递给父组件
        emit('insertImage',30,url);//传递给 @insert-image="..."
    };


    //处理复制图片
    const handleCopyImage = () => {
        const imgElement = aiChatImageView.value.$el.querySelector("img");

        //const response = await fetch(imgElement.src);
        //const blob = await response.blob();

        fetch(imgElement.src)
            .then(response => response.blob())
            .then(async blob => {
                const data = [         
                    new ClipboardItem({// 注意：new ClipboardItem()非https域名下（localhost|127.0.0.1除外）会报错
                        [blob.type]: blob,         
                    }),       
                ];
                // https://w3c.github.io/clipboard-apis/#dom-clipboard-write     
                await navigator.clipboard.write(data)        
                .then(           
                    () => {  
                        Notify({ type: 'success', message: t('aiChatImageView.30') });//复制成功
                    },           
                    () => {
                        Notify({ type: 'danger', message: t('aiChatImageView.40')});//无法写入剪贴板
                    }        
                );       
            }
        );

        /**
        const canvas:any = document.createElement('canvas');
        const ctx:any = canvas.getContext('2d');
        const img = new Image();
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        img.crossOrigin = "Anonymous";
        img.src = imgElement.src;
        img.onload = () =>{
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(img, 0, 0); // 将canvas转为blob     
            canvas.toBlob(async (blob:any) => {      
                const data = [         
                    new ClipboardItem({// 注意：new ClipboardItem()非https域名下（localhost|127.0.0.1除外）会报错
                        [blob.type]: blob,         
                    }),       
                ];
                // https://w3c.github.io/clipboard-apis/#dom-clipboard-write     
                await navigator.clipboard.write(data)        
                .then(           
                    () => {            
                        ElMessage({
                            showClose: true,
                            message: '复制成功',
                            type: 'success',
                            onClose: ()=>{
                                
                            }
                        })        
                    },           
                    () => {
                        ElMessage({
                            showClose: true,
                            message: '无法写入剪贴板',
                            type: 'error',
                            onClose: ()=>{
                                
                            }
                        })      
                    }        
                );       
            });   
        }**/
    };
    
</script>

<style scoped lang="scss">
.aiChatImageViewModule {
    display: flex;
    flex-direction: row;
    align-items: stretch;

    .image-container{
        flex: 1;
    }
    .action-container{
        align-self:center;
        .copy{
            margin-bottom: 10px;
        }
    }
}




</style>

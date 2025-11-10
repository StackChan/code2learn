<!-- 更新头像 -->
<template>
    <div class="updateAvatar-container" >
        <ul>
            <li>
                <div class="screenshot">
                    <img ref="originalImage" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"/>
                </div>
            </li>
            <li>
                <div class="button-container">
                    <div>
                        <van-uploader v-model="fileList" :preview-image="false" :before-read="beforeRead" :after-read="afterRead" :accept="'image/*'">
                            <template #default>
                                <!--选择图片-->
                                <van-button icon="plus" type="primary" plain round>{{t('updateAvatar.10')}}</van-button>
                            </template>
                        </van-uploader>
                    </div>
                    <div>
                        <!--上传-->
                        <van-button block round type="primary" native-type="submit" @mousedown="uploadAvatar" :disabled="form.allowSubmit" class="upload">{{t('updateAvatar.20')}}</van-button>
                    </div>
                </div>
            </li>
            <li v-if="form.progressPercent >0 ">
                <div class="progress">
                    <van-progress :percentage="form.progressPercent" />
                </div>
            </li>
        </ul>	
    </div>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance,nextTick, onUnmounted, reactive, ref, onMounted } from 'vue';
    import Cropper from "cropperjs";
    import "cropperjs/dist/cropper.css";
    import { AxiosResponse } from 'axios';
    import { processErrorInfo } from '@/utils/tool';
    import { Notify, UploaderFileListItem, UploaderInstance } from 'vant';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const originalImage = ref<HTMLImageElement>()//原图
    const selectImage =  ref<UploaderInstance>()//选择图片
    const fileList = ref<UploaderFileListItem[]>()//图片列表

    //传递消息给父组件
    const emit = defineEmits(['updateAvatar'])

    //表单
    const form = reactive({ 
        avatarCropper:null as any,//头像Cropper
		progressPercent: 0, // 进度条默认为0
        allowSubmit:false,//提交按钮disabled状态
    })

    //错误
    const error = reactive({
    })


    //创建Cropper
    const createCropper = () => {
        if(originalImage.value){
            form.avatarCropper = new Cropper(originalImage.value, {	
                viewMode: 1,//视图模式
                dragMode: 'move',//移动画布
                initialAspectRatio: 1,//定义裁切框的初始宽高比。默认情况下，它与画布（图像包装器）的纵横比相同。这个值只有在aspectRatio值不进行设置的时候生效
                aspectRatio: 1,//裁剪框的宽高比
                background: true,//显示容器的网格背景
                autoCropArea: 0.6,//定义自动裁剪面积大小(百分比)和图片进行对比。 就是裁剪框显示的大小
                zoomOnWheel: false,//是否可以通过移动鼠标来放大图像
                minContainerWidth:300,
                minContainerHeight:300,
               // cropBoxMovable:false,//是否允许通过拖动来移动裁剪框
                toggleDragModeOnDblclick:false,//是否允许双击切换图片容器拖拽模式(​​"crop"​​和​​"move"​​)
            });
        }
        
    }
    //上传图片前处理
    const beforeRead = (file:any):boolean => {
        if(fileList.value){
            fileList.value!.length = 0;
        }

        return true;
    };
    

    //上传图片后处理
    const afterRead = (file:any) => {
        if(file.content){
            //将img的src改为刚上传的文件的转换格式
            originalImage.value?.setAttribute("src",file.content);
        }
        // form.avatarCropper.reset();
        if(form.avatarCropper != null){
            form.avatarCropper.destroy();//销毁裁剪器并从图像中删除实例。
            form.avatarCropper = null;
        }
        
        nextTick(()=>{
            createCropper();
        })
	}

    //上传头像
    const uploadAvatar = () => {
        let formData = new FormData();
        form.allowSubmit = true;

        if(form.avatarCropper == null || originalImage.value?.getAttribute("src") == "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"){
            Notify({ 
                type: 'danger', 
                message: t('updateAvatar.30')//请选择图片
            });
            form.allowSubmit = false;
            return;
        }

        if(fileList.value != null && fileList.value.length >0){
            formData.append('imgFile', fileList.value[0].file!);
        }

        // - x裁切框距离左边的距离 
        // - y裁切框距离顶部的距离 
        // - width裁切框的宽度 
        // - height裁切框的高度 
        // - rotate裁切框的旋转的角度 
        // - scaleX缩放图像的横坐标 
        // - scaleY缩放图像的纵坐标 
        let dataObject = form.avatarCropper.getData(true);//返回裁剪区域基于原图片!原尺寸!的位置和尺寸 rounded默认为false 表示是否显示四舍五入后的数据
        formData.append('width', dataObject.width);
        formData.append('height', dataObject.height);
        formData.append('x', dataObject.x); 
        formData.append('y', dataObject.y);


        
        proxy?.$axios({
            url: '/user/control/updateAvatar',
            method: 'post',
            data: formData,
            timeout: 0,// 定义请求超时时间
            onUploadProgress: (progressEvent:any) => {
                if (progressEvent.lengthComputable) {
                    
                    let rate = progressEvent.loaded / progressEvent.total;  //已上传的比例
                    if (rate < 1) {
                        //这里的进度只能表明文件已经上传到后台，但是后台有没有处理完还不知道
                        //因此不能直接显示为100%，不然用户会误以为已经上传完毕，关掉浏览器的话就可能导致上传失败
                        //等响应回来时，再将进度设为100%
                        // progressEvent.loaded:已上传文件大小
                        // progressEvent.total:被上传文件的总大小
                        form.progressPercent = parseFloat((progressEvent.loaded / progressEvent.total * 100).toFixed(2));
                    }
                }
            }
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                const data = JSON.parse(result)
                if(JSON.parse(data.success)){
                    form.progressPercent = 100;
                    
                    //传递消息给父组件
                    emit('updateAvatar',true);
                    Notify({ 
                        type: 'success', 
                        message: t('updateAvatar.40')//上传头像成功
                    });
                    init();
                    
                }else{
                    //处理错误信息
                    processErrorInfo(data.error as Map<string,string> , error,()=>{});
                    
                }
                form.allowSubmit = false;
            }
        })
        .catch((error: any) =>{
            console.log(error);
            form.allowSubmit = false;
        });
    }


    //卸载组件实例后调用
    onUnmounted (()=>{
       if(form.avatarCropper != null){
            form.avatarCropper.destroy();//销毁裁剪器并从图像中删除实例。
            form.avatarCropper = null;
        }
    })
    
    onMounted(() => {
        init();

    }) 

    //初始化
    const init = () => {
		form.progressPercent= 0; // 进度条默认为0
	   
        if(form.avatarCropper != null){
            form.avatarCropper.destroy();//销毁裁剪器并从图像中删除实例。
            form.avatarCropper = null;
        
            //清理上传列表
            if(fileList.value){
                fileList.value!.length = 0;
            }
        }
        originalImage.value?.setAttribute("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");//空白1像素图片

	}
    

</script>

<style scoped lang="scss">
.updateAvatar-container{
    .screenshot{
        height: 50vh;
        margin: 50px 8px 20px 8px;
        background: var(--van-gray-1);
    }
    .button-container{
        margin-top: 15px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;
        .upload{
            margin-left: 10px;
            width: 110px;
        }
    }
    .progress{
        margin: 10px 8px 30px 8px;
    }
}


</style>
<!-- 第三方重定向登录 -->
<template>
    
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance,reactive, watchEffect, onActivated} from 'vue'
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { processErrorInfo} from '@/utils/tool';
    import { processJumpAttribute} from '@/utils/jumpProcess';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { Notify, Toast } from 'vant';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const store = useStore(pinia);

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 

    
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('loginRedirect.10')+' - ' + titleValue;//第三方重定向登录
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    //登录错误
    const error = reactive({
    })


    
    /**
    let loadingInstance :LoadingInstance = ElLoading.service({
        lock:true,//加载时全屏幕锁定
        text: '正在跳转...',
        fullscreen: true,//全屏遮罩
        background: 'rgba(255, 255, 255, 0.5)',
    }); */

    let loadingInstance = Toast.loading({
        duration:0,
        message: t('loginRedirect.20'),//正在跳转...
        forbidClick: true,//禁用背景点击
        //className:  mask ? '' :'custom-toastLoading',
        overlay:true,//是否显示背景遮罩层
        // loadingType:'spinner',
    });

 
    //第三方登录重定向后获取信息
    proxy?.$axios({
        url: '/thirdParty/loginRedirect',
        method: 'get',
        params:  {  
            code:(router.currentRoute.value.query.code != undefined ? router.currentRoute.value.query.code :''),
            state:(router.currentRoute.value.query.state != undefined ? router.currentRoute.value.query.state :''),
            jumpUrl:(router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl :'')
        },
        showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
    })
    .then((response: AxiosResponse) => {
        if(response){
            const result: any = response.data;
            loadingInstance.clear();//关闭遮罩层
            if(JSON.parse(result.success)){//登录成功
                if(result.userAuthorization != null){
                    
                    let jumpUrl = router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl as string :'' ;
                    let accessUser = result.userAuthorization.accessUser;
                    let accessToken = result.userAuthorization.accessToken;
                    let refreshToken = result.userAuthorization.refreshToken;
                    
                    //访问令牌和刷新令牌存储到localStorage
                    window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));

                    store_systemUser.value = accessUser
                    if (jumpUrl != null && jumpUrl != '') {

                        let decryptObject = processJumpAttribute(jumpUrl);
                        if(decryptObject.path == "/login"){
                            router.push("index");
                        }else{
                            router.push({
                                path : decryptObject.path,
                                query: decryptObject.query
                            });
                        }
                        

                    } else {
                        router.push("index");
                    }
                }else{
                    //userAuthorization属性内容为空
                    Notify({message: t('loginRedirect.30') ,background: 'var(--van-red-100)'});
                }
            }else{
                //处理错误信息
                processErrorInfo(result.error as Map<string,string> , error,()=>{});
            }

        }
    }).catch((error: any) =>{
        console.log(error);
    });

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('loginRedirect.10')+' - ' + titleValue;//第三方重定向登录
        }
    })
</script>
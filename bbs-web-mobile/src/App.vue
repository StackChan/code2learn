<template>
    <!--html页元信息
    <metainfo>
        <template v-slot:title="{ content }">{{ content }}</template>
    </metainfo>-->

    <router-view v-slot="{ Component }" v-if="supportAccessDevice == 1 || supportAccessDevice == 3">
        <!--:max 缓存组件最大数量-->
        <keep-alive :include="cacheComponents" :max="200">
            <component :is="Component" :key="store.getCacheKey" v-if="state.isRouterAlive"/>
        </keep-alive>
    </router-view>
    <!--手机端浏览入口已关闭，请尝试使用电脑端浏览器访问本站-->
    <van-empty v-if="supportAccessDevice != 1 && supportAccessDevice != 3" image="error" image-size="180" :description="i18n.t('app.10')">
        <!--访问电脑端网站-->
        <van-button round type="primary" @click="setAccessMobile">{{i18n.t('app.20')}}</van-button>
    </van-empty>          
<div style="position: absolute;top: 100px;"></div>
</template>

<script setup lang="ts">
    import { onMounted, getCurrentInstance, ComponentInternalInstance, watch, reactive, computed, onUnmounted,} from 'vue'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBrowserback } from './utils/history';
    import { onBeforeRouteUpdate } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { Locale } from 'vant';
    // 引入英文语言包
    import en_US from 'vant/es/locale/lang/en-US';
    // 引入英文语言包
    import zh_CN from 'vant/es/locale/lang/zh-CN';


    const store = useStore(pinia);
    const {baseURL,commonPath,contextPath,templateDir,title,keywords,description,systemUser,baseURI,fileStorageSystem,supportAccessDevice,weixin_oa_appid,userInfoVersion,defaultLanguage,currentLanguage,languageSwitching} = storeToRefs(store)
 
    let i18n = useI18n();

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;


    const state = reactive({
        isRouterAlive: true, //控制视图是否显示的变量
    });

    const cacheComponents = computed(() => {
        return store.getCacheComponents
    });


    // 获取浏览器默认语言
    const getBrowserLang = () => {
        let language = navigator.language;//访问浏览器的首选语言
        if(language == "zh" || language.startsWith("zh-")){
            return "zh";
        }
        return "en";
    };
    
    const localLanguage = () => {
        let languageCode = window.localStorage.getItem("language");
        if(languageCode == null){//如果用户未设置语言
            //如果前端设置了默认语言
            if(defaultLanguage.value != null && defaultLanguage.value != ''){
                if(defaultLanguage.value.startsWith("zh_")){
                    currentLanguage.value = "zh";
                    i18n.locale.value =  "zh";
                    document.getElementsByTagName("html")[0].lang = 'zh';
                    Locale.use('zh_CN', zh_CN);
                    return;
                }
                if(defaultLanguage.value.startsWith("en_")){
                    currentLanguage.value = "en";
                    i18n.locale.value =  "en";
                    document.getElementsByTagName("html")[0].lang = 'en';
                    Locale.use('en-US', en_US);
                    return;
                }
            }else{
                if(getBrowserLang() == "zh"){
                    currentLanguage.value = "zh";
                    i18n.locale.value =  "zh";
                    document.getElementsByTagName("html")[0].lang = 'zh';
                    Locale.use('zh_CN', zh_CN);
                    return;
                }
                if(getBrowserLang() == "en"){
                    currentLanguage.value = "en";
                    i18n.locale.value =  "en";
                    document.getElementsByTagName("html")[0].lang = 'en';
                    Locale.use('en-US', en_US);
                    return;
                }
            }
        }else{
            if(languageCode.startsWith("zh_")){
                currentLanguage.value = "zh";
                i18n.locale.value =  "zh";
                document.getElementsByTagName("html")[0].lang = 'zh';
                Locale.use('zh_CN', zh_CN);
                return;
            }
        }
        
        currentLanguage.value = "en";
        i18n.locale.value =  "en";
        document.getElementsByTagName("html")[0].lang = 'en';
        Locale.use('en-US', en_US); 
    };

   

    /**
     * 查询基本信息
     */
    const queryBaseInfo = () => {
        proxy?.$axios({
            url: '/baseInfo',
            method: 'get',
            params:  {
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            const result: any = response.data;
            if(result != ""){
                let resultData = JSON.parse(result);
                baseURL.value = resultData.baseURL
                commonPath.value = resultData.commonPath
                contextPath.value = resultData.contextPath
                templateDir.value = resultData.templateDir
                title.value = resultData.title
                keywords.value = resultData.keywords
                description.value = resultData.description
                if(resultData.systemUser != null){
                    systemUser.value = resultData.systemUser
                }
                baseURI.value = resultData.baseURI
                fileStorageSystem.value = resultData.fileStorageSystem
                supportAccessDevice.value = resultData.supportAccessDevice
                weixin_oa_appid.value = resultData.weixin_oa_appid
               
                let languageSwitchingMap = new Map<string,string>();
                for (let code in resultData.languageSwitching) {
                    languageSwitchingMap.set(code,resultData.languageSwitching[code])
                }
                languageSwitching.value = languageSwitchingMap;
            }

        }).catch((error: any) =>{
            console.log(error);
        });

    }

    
    //设置访问电脑端(需要配合Nginx使用，Nginx配置文件加入判断Cookie值是否为pc)
    const setAccessMobile = () => {
        //accessModule: pc 或 mobile
        document.cookie = "accessModule=pc;path=/";
        window.location.reload();
    }

 
    //监听到用户信息版本号变化时执行刷新登录用户信息
    watch(() => userInfoVersion.value, (val, old) => {
        //查询基本信息(基本信息包含登录用户信息)
        queryBaseInfo();
    })

    onMounted(()=>{
        //查询基本信息
        queryBaseInfo();

        localLanguage();

        //挂载完成后，判断浏览器是否支持popstate
        if (window.history) {//监听浏览器前进后退按钮
			window.addEventListener('popstate', onBrowserback, false);
		}
    });
    //卸载组件实例后调用
    onUnmounted (()=>{
        //页面销毁时，取消监听
        window.removeEventListener('popstate', onBrowserback, false);
    })
</script>

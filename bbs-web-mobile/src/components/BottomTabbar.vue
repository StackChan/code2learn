<!-- 底部导航栏 -->
<template>
    <!-- z-index要比视频播放器的“视频处理中，请稍后再刷新（z-index：99）”层要高 -->
    <van-tabbar v-model="state.bottomTab" safe-area-inset-bottom @click="onNavigation" :z-index="100">
        <van-tabbar-item name="diary">
            <!-- 日记本 -->
            <span>日记本</span>
            <template #icon="props">
                <span class="bottomNavModule-tabbar-item"><Icon name="book" :size="convertViewportWidth('20px')"/></span>
            </template>
        </van-tabbar-item>
        <van-tabbar-item name="index">
            <!-- 首页 -->
            <span>{{t('bottomTabbar.10')}}</span>
            <template #icon="props">
                <span class="bottomNavModule-tabbar-item"><Icon name="home" :size="convertViewportWidth('20px')"/></span>
            </template>
        </van-tabbar-item>
        <van-tabbar-item name="askList">
            <!-- 问答 -->
            <span>{{t('bottomTabbar.20')}}</span>
            <template #icon="props">
                <span class="bottomNavModule-tabbar-item"><Icon name="question-answer-line" :size="convertViewportWidth('20px')"/></span>
            </template>
        </van-tabbar-item>
<!--        <van-tabbar-item name="find">-->
<!--            &lt;!&ndash; 发现 &ndash;&gt;-->
<!--            <span>{{t('bottomTabbar.30')}}</span>-->
<!--            <template #icon="props">-->
<!--                <span class="bottomNavModule-tabbar-item"><Icon name="compass-line" :size="convertViewportWidth('20px')"/></span>-->
<!--            </template>-->
<!--        </van-tabbar-item>-->
        <van-tabbar-item name="mine" :badge="state.unreadMessageCount >0 ? state.unreadMessageCount : ''">
            <!-- 我的 -->
            <span>{{t('bottomTabbar.40')}}</span>
            <template #icon="props">
                <span class="bottomNavModule-tabbar-item"><Icon name="user" :size="convertViewportWidth('20px')"/></span>
            </template>
        </van-tabbar-item>
    </van-tabbar>
    <van-action-sheet v-model:show="state.popup_find" close-icon="close" :title="t('bottomTabbar.30')" class="custom-action-sheetModule" >
        <!-- 语言 -->
        <van-cell :title="t('bottomTabbar.50')" v-if="state.languageSwitchingOptions != null && state.languageSwitchingOptions.length >0" is-link  :value="state.languageItemName" @click="popUpLanguageOptions()" >
            <template #icon>
                <Icon name="translate" :size="convertViewportWidth('16px')" class="icon"/>
            </template>
        </van-cell>
        <van-popup v-model:show="state.showLanguagePicker" round position="bottom">
            <van-picker ref="languageSwitchingRef" :columns="state.languageSwitchingOptions" @cancel="state.showLanguagePicker = false" :columns-field-names="{text: 'name'}" :default-index="state.languageItemDefaultIndex" :item-height="convertViewportWidth('44px')" @confirm="onLanguageConfirm"/>
        </van-popup>

        <!-- 搜索 -->
        <van-cell :title="t('bottomTabbar.60')" is-link @click="clickLink('/search')">
            <template #icon>
                <Icon name="search" :size="convertViewportWidth('16px')" class="icon"/>
            </template>
        </van-cell>
        <!-- 会员卡 -->
        <van-cell :title="t('bottomTabbar.70')" is-link @click="clickLink('/membershipCardList')">
            <template #icon>
                <Icon name="membershipCard" :size="convertViewportWidth('16px')" class="icon"/>
            </template>
        </van-cell>
        <!-- 在线帮助 -->
        <van-cell :title="t('bottomTabbar.80')" is-link @click="clickLink('/help')">
            <template #icon>
                <Icon name="help-alt" :size="convertViewportWidth('16px')" class="icon"/>
            </template>
        </van-cell>
    </van-action-sheet>

</template>
<script lang="ts" setup>
    import { onMounted, getCurrentInstance, ComponentInternalInstance, watch, reactive, onUnmounted, nextTick, ref,} from 'vue'
    import { AxiosResponse } from 'axios'
    import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import Icon from "@/components/icon/Icon.vue";
    import { LanguageSwitchingOptions, UnreadMessage } from '@/types'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { Toast } from 'vant'
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const store = useStore(pinia);
    const router = useRouter();

    const languageSwitchingRef = ref();

    const {languageSwitching:store_languageSwitching} = storeToRefs(store)

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    //传递消息给父组件
    const emit = defineEmits(['unreadMessage','updateAvatar'])


    const state = reactive({
        bottomTab : '',
		popup_find : false,//发现弹出层

        unreadMessage:{
            privateMessageCount:0,
            systemNotifyCount:0,
            remindCount:0,
        } as UnreadMessage,
        unreadMessageCount:0,//未读消息总数

        timer:{} as any,//查询消息定时器

        showLanguagePicker:false,//是否显示语言选项
        languageSwitchingOptions: [] as Array<LanguageSwitchingOptions>,//Select 选择器语言切换数据
        languageItemDefaultIndex:0,//语言选中项默认索引，修改无效
        languageItemName:'',//语言选中项名称
        isClickLink:false,//是否点击链接
    });

    //确认选中语言
    const onLanguageConfirm = (languageSwitchingOptions:LanguageSwitchingOptions) => {
        window.localStorage.setItem("language", languageSwitchingOptions.code);
        /**
        let i= 0;
        for (let [key, value] of store_languageSwitching.value) {
            if(languageSwitchingOptions.code != null && key == languageSwitchingOptions.code){
                state.languageItemIndex = i;
                state.languageItemName =languageSwitchingOptions.name;
            };
            i++;
        } */
        window.location.reload();
    };


    //弹出语言选项
    const popUpLanguageOptions = () => {
        state.showLanguagePicker = true;
        initLanguage();
    };

    //初始化语言
    const initLanguage = () => {
        state.languageSwitchingOptions.length = 0;
        if(store_languageSwitching.value != null && store_languageSwitching.value.size >0){
            let languageCode = window.localStorage.getItem("language");
            let i= 0;
            for (let [key, value] of store_languageSwitching.value) {
                let languageSwitchingOptions =new Object() as LanguageSwitchingOptions;
                languageSwitchingOptions.code = key;
                languageSwitchingOptions.name = value;

                state.languageSwitchingOptions.push(languageSwitchingOptions);

                if(languageCode != null && languageSwitchingOptions.code == languageCode){
                    state.languageItemDefaultIndex = i;
                    state.languageItemName =languageSwitchingOptions.name;
                    if(languageSwitchingRef.value){
                        languageSwitchingRef.value.setColumnIndex(0,i);//设置对应列选中项的索引  第一列为0  必须显示了才能设置值
                    }
                }
                i++;
            }
        }
    };

    //点击链接
    const clickLink = (path:string) => {
        if(router.currentRoute.value.path == path){
            state.isClickLink = false
        }else{
            state.isClickLink = true
            router.push({
                path : path
            });
        }

        state.popup_find = false
    }
    //导航
    const onNavigation = () => {
        if ('diary' == state.bottomTab) {
            //日记本
            router.push({
                path : '/diary'
            });
        } else if ('index' == state.bottomTab) {
            //首页
            router.push({
                path : '/index'
            });
        } else if ('askList' == state.bottomTab) {
            //问答
            router.push({
                path : '/askList'
            });
        } else if ('find' == state.bottomTab) {
            state.popup_find = true;
        } else if ('mine' == state.bottomTab) {
            //我的
            router.push({
                path : '/user/control/home'
            });
        }
    }

    //默认选中
    const defaultSelected = () => {
        //获取URL中的参数组
        let pathName = window.location.pathname;
        let  last = pathName.substring(pathName.length - 1, pathName.length); //URL的最后一个字符
        if (last != "/") {
            pathName += "/";
        }
        //如果以/diary/开头
        if (pathName.indexOf("/diary/") >= 0) {
            state.bottomTab = "diary";
        } else if (pathName.indexOf("/index/") >= 0) {
            state.bottomTab = "index";
        } else if (pathName.indexOf("/askList/") >= 0) {
            state.bottomTab = "askList";
        } else if (pathName.indexOf("/search/") >= 0) {
            state.bottomTab = "find";
        } else if (pathName.indexOf("/membershipCardList/") >= 0) {
            state.bottomTab = "find";
        } else if (pathName.indexOf("/help/") >= 0) {
            state.bottomTab = "find";
        } else if (pathName.indexOf("/user/control/") >= 0) {
            state.bottomTab = "mine";
        }

    }


    //查询未读消息
    const queryUnreadMessage = () => {
        if(store.systemUser != null && Object.keys(store.systemUser).length>0){//如果在登录状态
            proxy?.$axios({
                url: '/user/control/unreadMessageCount',
                method: 'get',
                params:  {},
                showLoading: false,//是否显示加载图标
                loadingMask:false,// 是否显示遮罩层
            })
            .then((response: AxiosResponse) => {
                if(response){
                    const result: any = response.data;
                    let resultValue = JSON.parse(result);

                    state.unreadMessageCount = parseInt(resultValue.privateMessageCount) + parseInt(resultValue.remindCount) + parseInt(resultValue.systemNotifyCount);
                    state.unreadMessage.privateMessageCount = parseInt(resultValue.privateMessageCount);
                    state.unreadMessage.remindCount = parseInt(resultValue.remindCount);
                    state.unreadMessage.systemNotifyCount = parseInt(resultValue.systemNotifyCount);

                    //传递消息给父组件
                    emit('unreadMessage',state.unreadMessage);
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        }
    }



    //离开当前路由（解决有弹窗按返回键时会返回上一页）
    onBeforeRouteLeave((to, from) => {

        //如果有弹出层，则不离开当前路由
        if(state.popup_find && !state.isClickLink){
            store.setPopUpWindow(true);//标记有弹出窗口
            return false;
        }
    })

    //定时查询消息
    const timerUnreadMessage = () =>  {
        queryUnreadMessage();

        state.timer = setTimeout(() =>{
            timerUnreadMessage();
        }, 15000);//15秒
    }


    onMounted(() => {
        defaultSelected();
        timerUnreadMessage();

        initLanguage();
    })

    //卸载组件实例后调用
    onUnmounted (()=>{
        clearTimeout(state.timer); //销毁
        state.timer = null
    })


</script>
<style scoped lang="scss">

</style>

<!--帮助中心-->
<template>
    <div class="main">
        <div class="main-container">
            <!-- title="帮助中心" -->
            <van-nav-bar :title="t('help.10')"></van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="helpModule">
                    <div class="container" v-for="helpType in state.helpTypeList">
                        <van-divider class="line">{{helpType.name}}</van-divider>
                        <ul class="nav-row" >
                            <li class="item" v-for="childHelpType in helpType.childHelpType">
                                <router-link  tag="div" :to="{path: '/helpDetail', query: {helpTypeId: childHelpType.id}}" class="info">
                                    <div class="img" v-if="childHelpType.image != null &&  childHelpType.image != ''" :style="'background-image: url('+childHelpType.image+');'"></div>
                                    
                                    <Icon v-if="childHelpType.image == null || childHelpType.image == ''" name="help-alt" :size="convertViewportWidth('120px')" class="icon"/>
                                    <h5>{{childHelpType.name}}</h5>
                                    <div class="description-box">
                                        <p class="description">{{childHelpType.description}}</p>
                                    </div>
                                </router-link>
                            </li>	
                        </ul> 
                    </div> 
                </div>
            </van-pull-refresh>
        </div>
    </div>
    <!-- 底部导航栏-->
    <BottomTabbar/>
</template>

<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { HelpType } from "@/types/index";
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
   
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('help.10')+' - ' + titleValue;//帮助中心
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
     
     const state = reactive({
        helpTypeList: [] as Array<HelpType>,//帮助分类
        
        isSkeleton:true,//是否显示骨架屏
        isRefreshing:false,//是否处于下拉加载中状态
    })
   
    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.helpTypeList.length = 0;//会员卡列表
        
        
        queryHelpTypeList()
    };

    //查询帮助分类
    const queryHelpTypeList = () => {
        proxy?.$axios({
            url: '/queryHelpTypeList',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<HelpType>) => {
            state.isSkeleton = false;//关闭骨架屏
            if(data && data.length > 0){
                state.helpTypeList = data;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }


    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'help'){
            //删除缓存
            store.setCacheNumber(to.name)
        }
        
        next();
    });

    onMounted(() => {
        queryHelpTypeList()

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }) 

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('help.10')+' - ' + titleValue;//帮助中心
        }
    })
</script>
<style scoped lang="scss">
.helpModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);
    .container{
        font-size: 0;
        overflow: hidden;
        background: #fff;
        padding: 12px;
        border-radius: var(--van-border-radius-lg);
        .line {
            font-size: 16px;
        }
        .nav-row{
            margin-top: 30px;
            &:after {
                content: "";
                display: block;
                height: 0;
                clear: both;
                visibility: hidden;
            }
            .item {
                float: left;
                width: 50%;
                box-sizing: border-box;
                padding-bottom: 4px;
                position: relative;
                text-align: center;
                &:nth-child(2n+1) {
                    padding-right: 2px
                }
                &:nth-child(2n) {
                    padding-left: 2px
                }
                .info {
                    background-color: white;
                    padding-top:20px;
                    padding-bottom: 10px;
                    font-size: 0;
                    text-align: center;
                }
                .img{ 
                    display: inline-block;
                    width: 140px;
                    height: 140px;
                    border-radius: 4px;
                    background-size: cover;
                    background-repeat: no-repeat;
                }
                .icon{
                    display: inline-block;
                    width: 140px;
                    height: 140px;
                    line-height: 140px;
                    color:var(--van-gray-3);
                    text-align: center;
                    vertical-align: middle;
                    border-radius: 4px;
                }
                h5{
                    margin-top:15px; 
                    text-align: center; 
                    color: var(--van-gray-8);
                    font-size: 18px; 
                    line-height: 28px; 
                    font-weight: normal;
                }
                .description-box {
                    margin: 0 auto;
                    padding-top: 5px; 
                    margin-top: 5px; 
                    width: 90%;
                    overflow: hidden;
                    .description {
                        line-height: 24px;
                        font-size: 14px;
                        color: var(--van-gray-6);
                        text-align: center;
                    }
                }
            }
        }
    }
}
</style>
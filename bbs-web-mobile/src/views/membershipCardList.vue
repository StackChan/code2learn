<!--会员卡列表-->
<template>
    <div class="main">
        <div class="main-container">
            <!-- title="会员卡套餐" -->
            <van-nav-bar :title="t('membershipCardList.10')"></van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="membershipCardListModule">
                    <div class="item" v-for="membershipCard in state.membershipCardList">
                        <div class="top-container">
                            <div class="left-layout">
                                <div class="name">{{membershipCard.name}}</div>
                                <div class="descriptionTag-box">
                                    <div v-for="descriptionTag in membershipCard.descriptionTagList" class="descriptionTag">{{descriptionTag}}</div>
                                </div>
                            </div>
                            <div class="right-layout">
                                <div v-if="membershipCard.lowestPrice != null && parseFloat(membershipCard.lowestPrice) >0" class="price">
                                    <!-- <p><b>￥</b><span>{{membershipCard.lowestPrice}}</span> 元起</p> -->
                                    <p>
                                        <i18n-t keypath="membershipCardList.20" scope="global">
                                            <template #p1>
                                                <b>￥</b><span>{{membershipCard.lowestPrice}}</span>
                                            </template>
                                        </i18n-t>
                                    </p>
                                </div>
                                <div v-if="membershipCard.lowestPoint != null && Long.fromString(membershipCard.lowestPoint).gt(0)" class="price">
                                    <!-- <p><span>{{membershipCard.lowestPoint}}</span> 积分起</p> -->
                                    <p>
                                        <i18n-t keypath="membershipCardList.30" scope="global">
                                            <template #p1>
                                                <span>{{membershipCard.lowestPoint}}</span>
                                            </template>
                                        </i18n-t>
                                    </p>
                                </div>
                                <div class="subtitle">{{membershipCard.subtitle}}</div>
                            </div>
                        </div>
                        <div class="bottom-container">
                            <div class="layout">
                                <!-- 查看详情 -->
                                <van-button round block plain type="primary" native-type="submit" :to="{path: '/membershipCard', query: {membershipCardId: membershipCard.id}}">{{t('membershipCardList.40')}}</van-button>
                            </div>
                        </div>
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
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { MembershipCard } from "@/types/index";
    import Long from "long";
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
            document.title = t('membershipCardList.10')+' - ' + titleValue;//会员卡套餐
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    
    
     //表单
     const state = reactive({
        membershipCardList:[] as Array<MembershipCard>,//会员卡列表
        
        isSkeleton:true,//是否显示骨架屏
        isRefreshing:false,//是否处于下拉加载中状态
    })
   
    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.membershipCardList.length = 0;//会员卡列表
        
        
        queryMembershipCardList();
    };

    //查询会员卡列表
    const queryMembershipCardList = () => {
        proxy?.$axios({
            url: '/queryMembershipCardList',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<MembershipCard>) => {
            state.isSkeleton = false;//关闭骨架屏
            if(data != null && data.length > 0){
                state.membershipCardList = data;
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'membershipCardList'){
            //删除缓存
            store.setCacheNumber(to.name)
        }
        
        next();
    });

    onMounted(() => {
        queryMembershipCardList();

        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    }) 

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('membershipCardList.10')+' - ' + titleValue;//会员卡套餐
        }
    })
</script>
<style scoped lang="scss">
.membershipCardListModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 58px var(--van-cell-group-inset-padding);
    .item{
        padding: 12px 12px 12px 12px;
        margin-bottom: 8px;
        border-radius: var(--van-border-radius-lg);
        background: #fff;
        position: relative;
        .top-container{
            display: flex;
            .left-layout{
                width: 50%;
                .name{
                    font-size: 18px;
                    line-height: 32px;
                    color: var(--van-gray-8);
                    text-align: center;
                }
                .descriptionTag-box{
                    text-align: center;
                    margin-top: 10px;
                    .descriptionTag{
                        font-size: 14px;
                        color: var(--van-gray-7);
                        line-height: 28px;
                    }
                }
            }
            .right-layout{
                flex: 1;
                margin-left: 10px;
                margin-right: 10px;
                .price{ 
                    text-align: center;
                    margin-top: 10px;
                    p{ 
                        line-height: 30px;
                        font-size: 14px;
                    }
                    span{ 
                        color: #f75d51; 
                        font-size: 36px; 
                        font-weight: bolder;
                        position: relative;
                        top: 2px;
                    }
                    b{ 
                        font-size: 13px;
                        color: #f75d51; 
                        font-size: 24px; 
                        font-weight: normal;
                        position: relative;
                        top: 2px;
                    }
                }
                .subtitle{ 
                    display: block;
                    font-style:normal; 
                    color: #ff6800; 
                    line-height: 22px;
                    font-size: 14px;
                    text-align: center;
                }

            }
        }
        .bottom-container{
            margin-top: 20px;
            margin-bottom: 5px;
            display: flex;
            .layout{
                width: 100%;
                :deep(.van-button){
                    height: 36px;
                }
            }
        }
    }
}
</style>
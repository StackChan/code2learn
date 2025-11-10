<!-- 支付完成 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="支付完成" left-text="返回" -->
                <van-nav-bar :title="t('paymentCompleted.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
        </div>
        <div class="paymentCompletedModule" >
            <!--
            <van-empty description="支付完成，明细信息请到用户中心的余额模块查看" />-->


            <div class="resultModule">
                <div class="result">
                    <div class="result-icon">
                        <van-icon name="checked" class="icon-success" size="64px"/>
                    </div>
                    <div class="result-title">
                        <!-- 支付完成 -->
                        <p>{{t('paymentCompleted.10')}}</p>
                    </div>
                    <div class="result-subtitle">
                        <!-- <p>明细信息请到用户中心的<router-link to="/user/control/balance" tag="a" class="link">余额</router-link>模块查看</p> -->
                        <p>
                            <i18n-t keypath="paymentCompleted.20" scope="global">
                                <template #p1>
                                    <router-link to="/user/control/balance" tag="a" class="link">{{t('paymentCompleted.30')}}</router-link>
                                </template>
                            </i18n-t>
                        </p>
                    </div>
                    <div class="result-extra">
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
<script lang="ts" setup>
   import { getCurrentInstance, ComponentInternalInstance, watchEffect, onActivated} from 'vue'
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBack } from '@/utils/history'
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
            document.title = t('paymentCompleted.10')+' - ' + titleValue;//支付完成
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })
    

    let interfaceProduct = router.currentRoute.value.params.interfaceProduct != undefined ? router.currentRoute.value.params.interfaceProduct : '0';
    let paymentModule = router.currentRoute.value.params.paymentModule != undefined ? router.currentRoute.value.params.paymentModule : '0';
    let parameterId = router.currentRoute.value.params.parameterId != undefined ? router.currentRoute.value.params.parameterId : '0';


    //查询支付完成
    proxy?.$axios({
        url: '/paymentCompleted/'+interfaceProduct+"/"+paymentModule+"/"+parameterId,
        method: 'get',
        params:  router.currentRoute.value.query,
        //showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
        timestamp:false//get请求是否增加时间戳
    })
    .then((response: AxiosResponse) => {
       // const result: any = response.data;
        
    })
    .catch((error: any) =>{
        console.log(error);
    });
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('paymentCompleted.10')+' - ' + titleValue;//支付完成
        }
    })
</script>

<style scoped lang="scss">
.paymentCompletedModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;

    .link{
        color: var(--van-blue);
    }
}





</style>
<!-- 付款 -->
<template>
     <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="付款" left-text="返回" -->
                <van-nav-bar :title="t('payment.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <van-form ref="formRef" :scroll-to-error="true" class="form-container">
                    <van-cell-group inset>
                        <!-- label="充值" placeholder="请填写要充值的金额" -->
                        <van-field v-model.trim="form.rechargeAmount" :label="t('payment.20')" :placeholder="t('payment.30')" maxlength="12" clearable :rules="[{ validator: validatorRechargeAmount }]" :error-message="error.rechargeAmount"/>
                        <template v-if="state.onlinePaymentInterfaceList != null && state.onlinePaymentInterfaceList.length >0">
                            <div v-for="(onlinePaymentInterface,index) in state.onlinePaymentInterfaceList">        
                                <van-field :label="onlinePaymentInterface.name" class="onlinePaymentInterface">
                                    <template #input>
                                        <van-radio-group v-model="form.paymentBank">
                                            <div class="bank" v-for="bank in onlinePaymentInterface.bankList">
                                                <div class="radio">
                                                    <van-radio :name="onlinePaymentInterface.interfaceProduct+'_'+bank.code"><span></span></van-radio>
                                                </div>
                                                <div class="icon">
                                                    <img :src="bank.icon" width="36" height="36"/>
                                                </div>
                                                <div class="title">
                                                {{bank.name}}
                                                </div>
                                            </div>
                                        </van-radio-group>
                                    </template>
                                </van-field>
                            </div>
                        </template>
                        <van-skeleton :row="3" :loading="state.isSkeleton" />
                        <div class="submitButton">
                            <!-- 提交 -->
                            <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">{{t('common.50')}}</van-button>
                        </div>
                    </van-cell-group>
                </van-form>
                
                
            </van-pull-refresh>
            
        </div>
    </div>
    
</template>
<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { OnlinePaymentInterface } from "@/types/index";
    import ALIPAY_WAP from '@/assets/images/bank/ALIPAY-WAP.gif'
    import { processErrorInfo } from '@/utils/tool';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { onBack } from '@/utils/history'
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();


    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const store = useStore(pinia);
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    

    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('payment.10')+' - ' + titleValue;//付款
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const state = reactive({
        paymentModule:1,//支付模块
        onlinePaymentInterfaceList: {} as Array<OnlinePaymentInterface>,
        icon:{
            'ALIPAY-WAP.gif' : ALIPAY_WAP
        },
        isSkeleton:true,//是否显示骨架屏

        isRefreshing:false,//是否处于下拉加载中状态
    });

    const form = reactive({
        rechargeAmount:'',//充值金额
        paymentBank:'',
        allowSubmit:false,//提交按钮disabled状态
    });

    //错误
    const error = reactive({
        rechargeAmount: '',//充值金额
    })

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.onlinePaymentInterfaceList.length = 0;
        state.isSkeleton = true;//是否显示骨架屏

       
        queryPayment(state.paymentModule);
    };
    
    //校验充值金额
    const validatorRechargeAmount = (val:any):Promise<boolean | string> => {
        return new Promise((resolve) => {
            if(val != ''){
                if(val.length >12){
                    error.rechargeAmount = t('payment.40')//不能超过12位数字
                    resolve(false);
                } else { 
                    proxy?.$axios({
                        url: '/user/control/paymentVerification',
                        method: 'get',
                        params:  {
                            rechargeAmount:form.rechargeAmount
                        }
                    })
                    .then((response: AxiosResponse) => {
                        if(response){
                            const result: any = response.data;
                            let data = JSON.parse(result);
                            if(!JSON.parse(data.success)){
                                let rechargeAmountInfo = data.error.rechargeAmount;
                                let messageInfo = data.error.message;
                                if(rechargeAmountInfo != undefined){
                                    error.rechargeAmount = rechargeAmountInfo
                                    resolve(false);
                                }
                                if(messageInfo != undefined){
                                    error.rechargeAmount = messageInfo
                                    resolve(false);
                                }
                            }else{
                                error.rechargeAmount = "";
                                resolve(true);
                            }
                        }
                    }).catch((error: any) =>{
                        console.log(error);
                    });
                }
            }else{
                error.rechargeAmount = t('payment.50')//充值金额不能为空
                resolve(false);
            }
        });
    }

    //查询付款
    const queryPayment = (paymentModule: number) => {
        proxy?.$axios({
            url: '/user/control/payment',
            method: 'get',
            params:  { 
                paymentModule: paymentModule
            },
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            
            if(response){
                const result: any = response.data;
                
                state.onlinePaymentInterfaceList = result.onlinePaymentInterfaceList;
                for(let i = 0; i<state.onlinePaymentInterfaceList.length; i++){
                    let onlinePaymentInterface = state.onlinePaymentInterfaceList[i];
                    if(onlinePaymentInterface.bankList != null && onlinePaymentInterface.bankList.length >0){
                        for(let j = 0; j<onlinePaymentInterface.bankList.length; j++){
                            let bank = onlinePaymentInterface.bankList[j];
                            if(bank.selected){
                                form.paymentBank = onlinePaymentInterface.interfaceProduct+'_'+bank.code;
                            }

                            bank.icon = state.icon[bank.icon as keyof typeof state.icon];



                        }

                        if(form.paymentBank.length != (i+1)){//如果未选中，则默认选第一项
                            form.paymentBank = onlinePaymentInterface.interfaceProduct+'_'+onlinePaymentInterface.bankList[0].code;
                        }

                    }
                }
            }
            state.isSkeleton = false;//关闭骨架屏
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }
    

    const formRef = ref();

    //提交数据
    const onSubmit = () => {
        form.allowSubmit = true;//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            // 全局表单验证
            formRef.value.validate().then(() => {
                resolve();
            }).catch(() => {
                form.allowSubmit = false;//提交按钮disabled状态
            })
        });

       
        Promise.all([p1])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
            



                let formData = new FormData();
                if(form.rechargeAmount != null && form.rechargeAmount.trim() != ''){
                    formData.append('rechargeAmount', form.rechargeAmount);
                }

                formData.append('paymentBank', form.paymentBank);
               
                
                let paymentModule:string = router.currentRoute.value.query.paymentModule != undefined ? router.currentRoute.value.query.paymentModule as string :'';
                formData.append('paymentModule', paymentModule);

                proxy?.$axios({
                    url: '/user/control/payment',
                    method: 'post',
                    data: formData,
                    showLoading: false,//是否显示加载图标
                    loadingMask:false,// 是否显示遮罩层
                })
                .then((response: AxiosResponse) => {
                    if(response){
                        const result: any = response.data;
                        if(JSON.parse(result.success)){
                            
                            //清空表单
                            formRef.value?.resetValidation();
                            let callbackData = result.callbackData;

                            if (callbackData != null && callbackData != "") {
								//根据第三方支付返回的回调数据跳转到第三方支付
								var div = document.createElement('div');
								div.innerHTML = callbackData;
								document.body.appendChild(div);
								(document as any).forms['punchout_form'].submit();
							}

                        }else{
                            //处理错误信息
                            processErrorInfo(result.error as Map<string,string> , error,()=>{});
                            
                        }
                        form.allowSubmit = false;//提交按钮disabled状态
                    }
                })
                .catch((error: any) =>{
                    console.log(error);
                    form.allowSubmit = false;//提交按钮disabled状态
                });
            }).catch(() => {
                console.log("提交数据错误");
            });

    }

    //导航守卫
    onBeforeRouteUpdate((to, from, next) => {
        if(to.name == 'payment'){
            if(to.query.paymentModule != undefined){
                state.paymentModule = parseInt(to.query.paymentModule as string);
            }
            queryPayment(state.paymentModule);
        }
        
        next();
    });
    
    onMounted(() => {
        state.paymentModule = router.currentRoute.value.query.paymentModule != undefined ? parseInt(router.currentRoute.value.query.paymentModule as string) :1;
        queryPayment(state.paymentModule);

    }) 
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('payment.10')+' - ' + titleValue;//付款
        }
    })
</script>

<style scoped lang="scss">
.form-container{
    .onlinePaymentInterface{
        align-items: center;
        .bank{
            display: flex;
            align-items: center;
            margin-top: 5px;
            margin-bottom: 5px;

            .icon{
                margin-left: 10px;
                width: 36px;
                height: 36px
            }
            .title{
                margin-left: 10px;
                font-size: 14px;
            }
        }
    }
}

    .paymentModule{
        background: #fff;
        padding-right:8px;
        padding-left:8px;
        padding-top:8px;
        padding-bottom: 30px;
        .banks{
            widows: 100%;
            margin: 0 auto;
            font-size: 14px;
            .head {
                widows: 100%;
                margin: 0 auto;
                font-size: 14px;
                ul {
                    list-style: none;
                    margin: 0;
                    overflow: hidden
                }
                li {
                    float: left;
                    height: 37px;
                    line-height: 37px;
                    text-align: center;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--van-gray-7);
                    display: block;
                }
                .item1 {
                    width: 10%;
                    border-bottom: solid 1px var(--van-gray-2);
                    height: 38px
                }
                .item2{
                    width: 15%;
                    border-left: solid 1px var(--van-gray-2);
                    border-right: solid 1px var(--van-gray-2);
                    border-top: solid 1px var(--van-gray-2);
                    border-bottom: solid 1px var(--van-gray-2);
                    cursor: pointer;
                    border-radius:3px 3px 0px 0px;
                }.item3{
                    width: 74%;
                    border-bottom: solid 1px var(--van-gray-2);
                    height: 38px
                }
                .on {
                    background: #fff;
                    border-bottom: solid 1px #fff
                }
            }
        }

        .form-container{
            margin-top: 25px;
            :deep(.el-form-item__content) {
                line-height: normal;
            }
            :deep(.el-form-item__error) {
                width: 100%;
            }
            :deep(.el-form-item__label){
                font-weight:bold;
            }
        }
        .bankSelect {
            width: 866px;
            padding-top: 10px;
            overflow: hidden;
            margin: 0 auto;
            .onlinePaymentInterface{
                width: 960px; 
                float: left;
                .title {
                    width: 100%;
                    height: 34px;
                    line-height: 34px;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--van-gray-8);
                    float: left;
                }
                dl {
                    width: 162px;
                    height: 42px;
                    border: 1px solid var(--van-gray-2);
                    margin-right: 30px;
                    margin-bottom: 10px;
                    float: left;
                    display: block
                }
                dt {
                    width: 22px;
                    height: 32px;
                    float: left;
                    .radio{
                        position: relative;
                        top: 5px;
                        margin-left: 9px;
                    }
                }
                dd {
                    width: 120px;
                    height: 32px;
                    float: left;
                    margin-left: 10px;
                    margin-top: 5px;
                    img {
                        width: 120px;
                        height: 32px
                    }
                }
            }
        }
        .payNow {
            width: 866px;
            padding-top: 30px;
            position: relative;
            margin: 0 auto;
            padding-bottom: 10px
        }
    }

</style>

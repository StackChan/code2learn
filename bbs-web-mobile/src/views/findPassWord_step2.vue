<!-- 找回密码 第二步 -->
<template>
    <div class="main">
        <div class="main-container">
            <!-- :title="'找回密码 第二步'" left-text="返回" -->
            <van-nav-bar :title="t('findPassWord_step2.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="form.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            
                <div class="findPassWordModule" >
                    <van-tabs v-model:active="form.type" swipeable>
                        <!-- title="校验密码提示答案" -->
                        <van-tab :title="t('findPassWord_step2.20')" :name="10" v-if="form.showAccountForm">
                            <van-form ref="formAccountRef" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <!-- label="账号" -->
                                    <van-field :label="t('findPassWord_step2.30')" center :error-message="error.userName">
                                        <template #input>
                                            {{form.user.account}}
                                        </template>
                                    </van-field>
                                    <!-- label="密码提示问题" -->
                                    <van-field :label="t('findPassWord_step2.40')" center >
                                        <template #input>
                                            {{form.user.issue}}
                                        </template>
                                    </van-field>
                                     <!-- label="密码提示答案" placeholder="请输入密码提示答案" -->
                                    <van-field v-model.trim="form.answer" name="answer" :label="t('findPassWord_step2.50')" :placeholder="t('findPassWord_step2.60')" maxlength="25" :show-word-limit="true" clearable :rules="[{ validator: validatorAnswer }]" :error-message="error.answer"/>
                                     <!-- label="新密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.password" name="password" type="password" :label="t('findPassWord_step2.70')" :placeholder="t('findPassWord_step2.80')" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                     <!-- label="确认密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.confirmPassword" name="confirmPassword" type="password" :label="t('findPassWord_step2.90')" :placeholder="t('findPassWord_step2.80')" maxlength="20" clearable :rules="[{ validator: validatorConfirmPassword }]" :error-message="error.confirmPassword"/>
                                    <!-- label="验证码" placeholder="请输入验证码" -->
                                    <van-field v-model="form.captchaValue"  name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <!-- 换一幅 -->
                                            <span class="captcha-replace" @click="replaceCaptcha">{{t('common.80')}}</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>
                                <div class="submitButton">
                                    <!-- 提交 -->
                                    <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">{{t('common.50')}}</van-button>
                                </div>
                            </van-form>
                        </van-tab>
                        <!-- title="校验手机号码" -->
                        <van-tab :title="t('findPassWord_step2.100')" :name="20" v-if="form.showMobileForm">
                            <van-form ref="formMobileRef" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <!-- label="手机号" -->
                                    <van-field :label="t('findPassWord_step2.110')" center :error-message="error.mobile">
                                        <template #input>
                                            {{form.countryCode}} {{form.mobile}}
                                        </template>
                                    </van-field>
                                    <!-- label="新密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.password" name="password" type="password" :label="t('findPassWord_step2.70')" :placeholder="t('findPassWord_step2.80')" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                    <!-- label="确认密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.confirmPassword" name="confirmPassword" type="password" :label="t('findPassWord_step2.90')" :placeholder="t('findPassWord_step2.80')" maxlength="20" clearable :rules="[{ validator: validatorConfirmPassword }]" :error-message="error.confirmPassword"/>
                                    <div class="van-cell cell-field">
                                        <div class="van-cell__title van-field__label cell-field-title">
                                            <!-- 短信验证码 -->
                                            <span>{{t('findPassWord_step2.120')}}</span>
                                        </div>
                                        <div class="van-cell__value">
                                            <span>
                                                <!-- placeholder="请输入" -->
                                                <van-field v-model.trim="form.smsCode" name="smsCode" class="cell-field-value" :placeholder="t('findPassWord_step2.240')" maxlength="6" clearable :rules="[{ validator: validatorSmsCode }]" :error-message="error.smsCode">
                                                    <template #button>
                                                        <div class="smsCode">
                                                            <div v-if="form.counter <=0" class="button">
                                                                <!-- 获取验证码 -->
                                                                <span @mousedown="!form.allowSmsCodeSubmit ? getSmsCode() : ()=>{}">{{t('findPassWord_step2.130')}}</span>
                                                            </div>
                                                            <div v-if="form.counter >0" class="text">{{form.countdownText}}</div>
                                                        </div>
                                                    </template>
                                                </van-field>
                                            </span>
                                        </div>
                                        <div class="van-cell__label cell-field-label" v-if="form.successInfo != null && form.successInfo != ''" >
                                            <div class="successInfo">{{form.successInfo}}</div>
                                        </div>
                                    </div>
                                    <van-field v-model="form.captchaValue"  name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                                        <template #button>
                                            <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                                        </template>
                                        <template #extra >
                                            <!-- 换一幅 -->
                                            <span class="captcha-replace" @click="replaceCaptcha">{{t('common.80')}}</span>
                                        </template>
                                    </van-field>
                                
                                </van-cell-group>
                                <div class="submitButton">
                                    <!-- 提交 -->
                                    <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">{{t('common.50')}}</van-button>
                                </div>
                            </van-form>
                        </van-tab>
                    </van-tabs>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { User } from "@/types/index";
    import { processErrorInfo} from '@/utils/tool';
    import { SHA256} from 'crypto-js';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { Notify } from 'vant';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
   
    const formAccountRef = ref();
    const formMobileRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('findPassWord_step2.10')+' - ' + titleValue;//找回密码 第二步
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })


    const form = reactive({
        type:10,//类型 10.账号密码找回 20.手机号找回
        showAccountForm:false,//是否显示‘账号密码找回’表单
        showMobileForm:false,//是否显示‘手机号找回’表单
        user:{} as User,//用户
        userName:'',//用户名
        answer:'',//密码提示答案
        countryCode:'',//区号
        mobile:'',//手机号
        password:'',//新密码
        confirmPassword:'',//确认密码
        
        smsCode:'',//短信验证码
        showCaptcha:true,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态
        allowSmsCodeSubmit:false,//提交按钮disabled状态
        successInfo: '',

        timer: '' as any,//计时器对象
        countdownText: '',//倒计时文本
        counter: 0,//计数器

        isRefreshing:false,//是否处于下拉加载中状态
    });
    

    //错误
    const error = reactive({
        userName:'',//用户名
        answer:'',//密码提示答案
        password:'',//新密码
        confirmPassword:'',//确认密码
        mobile:'',//手机号
        smsCode:'',//短信验证码
        captchaValue:'',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.type = 10;//类型 10.账号密码找回 20.手机号找回
        form.showAccountForm = false;//是否显示‘账号密码找回’表单
        form.showMobileForm = false;//是否显示‘手机号找回’表单
        form.user = {} as User;//用户
        form.userName = '';//用户名
        form.answer = '';//密码提示答案
        form.countryCode = '',//区号
        form.mobile = '';//手机号
        form.password = '';//新密码
        form.confirmPassword = '';//确认密码
        
        form.smsCode = '';//短信验证码
        form.showCaptcha = true;//是否显示验证码
        form.captchaKey = '';//验证码key
        form.captchaValue = '';//验证码值
        form.imgUrl = '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态
        form.allowSmsCodeSubmit = false;//提交按钮disabled状态
        form.successInfo = '';

        form.timer = '' as any;//计时器对象
        form.countdownText =  '';//倒计时文本
        form.counter = 0;//计数器
        
        init();
    };

    //查询找回密码第二步
    const queryFindPassWord_step2 = () => {
        proxy?.$axios({
            url: '/findPassWord/step2',
            method: 'get',
            params:  { 
                userName: form.userName,
            },
            //showLoading: false,//是否显示加载图标
            //loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(JSON.parse(result.success)){
                    form.user = result.user;
                    form.type = form.user.type;
                    if(form.type == 10){
                        form.showAccountForm = true;//是否显示‘账号密码找回’表单
                    }else if(form.type == 20){
                        form.showMobileForm = true;//是否显示‘手机号找回’表单
                    }
                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , error,()=>{});
                    
                    if(result.captchaKey != null){
                        form.captchaKey = result.captchaKey;
                        replaceCaptcha();
                    }
                }

                form.captchaKey = result.captchaKey;
                replaceCaptcha();
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //获取短信验证码
    const getSmsCode = () => {
        form.allowSmsCodeSubmit = true;//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            // 局部表单验证
            formMobileRef.value.validate('mobile').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
            formMobileRef.value.validate('captchaValue').then(() => {
                resolve();
            }).catch(() => {
                form.allowSmsCodeSubmit = false;//提交按钮disabled状态
            })
        });

        Promise.all([p1])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
                form.successInfo = "";
                //设置按钮禁用状态
                form.allowSmsCodeSubmit = true;//提交按钮disabled状态

                let formData = new FormData();
                if(form.mobile != null && form.mobile.trim() != ''){
                    //区号
                    formData.append('countryCode', form.countryCode);
                    formData.append('mobile', form.mobile);
                }

                formData.append('module', '300');

                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/smsCode',
                    method: 'post',
                    data: formData,
                    //showLoading: false,//是否显示加载图标
                    //loadingMask:false,// 是否显示遮罩层
                })
                .then((response: AxiosResponse) => {
                    const result: any = response.data;
      
                    if(JSON.parse(result.success)){
                        form.successInfo = t('findPassWord_step2.140');//短信验证码已发送
                        countdown();
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , error,()=>{});
                        
                        if(result.captchaKey != null){
                            form.captchaKey = result.captchaKey;
                            replaceCaptcha();
                        }

                    }
                    form.allowSmsCodeSubmit = false;//提交按钮disabled状态
                    form.showCaptcha = true;
                })
                .catch((error: any) =>{
                    console.log(error);
                });
            })
    }

    //倒计时
    const countdown = () => {
        form.counter = 60;//60秒
        form.countdownText = t('findPassWord_step2.150',{'p1': form.counter});//form.counter+"秒后可重新获取"

        form.timer = setInterval(() => {
          //替换文本
          form.countdownText = t('findPassWord_step2.150',{'p1': form.counter});//form.counter+"秒后可重新获取"
          form.counter--;
          if (form.counter < 0) {
            // 当计时小于零时，取消该计时器
            clearInterval(form.timer)
          }
        }, 1000)
    }


    //校验密码
    const validatorPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.password = t('findPassWord_step2.160')//密码长度不能小于7个字符
                return false;
            }
        }else{
            error.password = t('findPassWord_step2.170')//密码不能为空
            return false;
        }
        error.password = "";
        return true;
    }
    //校验确认密码
    const validatorConfirmPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.confirmPassword = t('findPassWord_step2.160')//密码长度不能小于7个字符
                return false;
            }else{
                if(form.password != val){
                    error.confirmPassword = t('findPassWord_step2.180')//两次输入密码不相等
                    return false;
                }
            }
        }else{
            error.confirmPassword = t('findPassWord_step2.170')//密码不能为空
            return false;
        }
        error.confirmPassword = "";
        return true;
    }
    //校验密码提示答案
    const validatorAnswer = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.answer = t('findPassWord_step2.190')//密码提示答案不能小于7个字符
                return false;
            }
        }else{
            error.answer = t('findPassWord_step2.200')//密码提示答案不能为空
            return false;
        }
        error.answer = "";
        return true;
    }
    //校验短信验证码
    const validatorSmsCode = (val:any) => {
        if(val != ''){
            if(val.length <6){
                error.smsCode = t('findPassWord_step2.210')//验证码长度为6个字符
                return false;
            }
        }else{
            error.smsCode = t('findPassWord_step2.220')//短信验证码不能为空
            return false;
        }
        error.smsCode = "";
        return true;
    }
    //刷新验证码
    const replaceCaptcha = () => {
        form.imgUrl = store.apiUrl+"captcha/" + form.captchaKey + ".jpg?" + Math.random();
    }
    //校验验证码
   const checkCaptchaValue = (val:any):Promise<boolean | string> => {
        return new Promise((resolve) => {
            if(form.captchaKey != null && form.captchaKey != ''){
                if(val != ''){
                    if (val.length < 4) {
                        error.captchaValue = t('common.20');//验证码长度为4个字符
                        resolve(false);
                    } else { 
                    
                        proxy?.$axios({
                            url: '/userVerification',
                            method: 'get',
                            params:  {
                                captchaKey:form.captchaKey,
                                captchaValue:form.captchaValue
                            },
                            showLoading: false,//是否显示加载图标
                            loadingMask:false,// 是否显示遮罩层
                        })
                        .then((response: AxiosResponse) => {
                            if(response){
                                const result: any = response.data;
                                if(!JSON.parse(result)){
                                    error.captchaValue = t('common.30');//验证码错误
                                    resolve(false);
                                }else{
                                    error.captchaValue = "";
                                    resolve(true);
                                }
                            }
                        }).catch((error: any) =>{
                            console.log(error);
                        });
                    }
                }else{
                    error.captchaValue = t('common.10');//验证码不能为空
                    resolve(false);
                }

            }else{
                error.captchaValue = "";
                resolve(true);
            }
        });
    }


    //提交数据
    const onSubmit = () => {
        form.allowSubmit = true;//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            if(form.type == 10){//账号密码用户
                // 全局表单验证
                formAccountRef.value.validate().then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
            }else{
                resolve();
            }
            
        });
        
        const p2 = new Promise<void>((resolve, reject) => {
            if(form.type == 20){//手机号用户
                // 局部表单验证
                formMobileRef.value.validate('mobile').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('password').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('confirmPassword').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
                formMobileRef.value.validate('smsCode').then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
            }
            
        });

        Promise.all([p1])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
            

                let formData = new FormData();
                //用户名
                if(form.userName != ''){
                    formData.append('userName', form.userName);
                }
                if(form.type == 10){//10:本地账号密码用户
                    formData.append('type', String(form.type));
                    
                    if(form.answer != null && form.answer.trim() != ''){
                        formData.append('answer', SHA256(form.answer.trim()).toString());
                    }
                    
                }else if(form.type == 20){//20: 手机用户
                    formData.append('type', String(form.type));
                    
                    //手机号
                    if(form.mobile != null && form.mobile != ''){
                        formData.append('mobile', form.mobile);
                    }
                    formData.append('smsCode', form.smsCode);
                }
                
                //密码需SHA256加密
                if(form.password){
                    let SHA256Value = SHA256(form.password).toString();
                    formData.append('password', SHA256Value);
                }
                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/findPassWord/step2',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                        if(JSON.parse(result.success)){
                            // 成功通知
                            Notify({ 
                                type: 'success', 
                                message: t('findPassWord_step2.230'),//提交成功，3秒后自动跳转到登录页
                                onOpened: ()=>{
                                     router.push({
                                        path : '/login'
                                    });
                                } 
                            });
                        }else{
                            //处理错误信息
                            processErrorInfo(result.error as Map<string,string> , error,()=>{});
                            

                            form.allowSubmit = false;//提交按钮disabled状态

                            if(result.captchaKey != null){
                                form.showCaptcha = true;
                                form.captchaKey = result.captchaKey;
                                replaceCaptcha();
                            }

                        }
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
        if(to.name == 'findPassWord_step2'){
            init();
        }
        
        next();
    });
    onMounted(() => {

        init();
        
    }) 

    //初始化
    const init = () => {
        form.userName = router.currentRoute.value.query.userName != undefined ? router.currentRoute.value.query.userName as string :'';
        form.countryCode = router.currentRoute.value.query.countryCode != undefined ? router.currentRoute.value.query.countryCode as string : '';
        form.mobile = router.currentRoute.value.query.mobile != undefined ? router.currentRoute.value.query.mobile as string : '';
		queryFindPassWord_step2();
        
	}
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('findPassWord_step2.10')+' - ' + titleValue;//找回密码 第二步
        }
    })
</script>

<style scoped lang="scss">
.findPassWordModule{
    margin-top: var(--van-cell-group-inset-padding);
    :deep(.van-tabs--line .van-tabs__wrap) {
        margin-left: var(--van-cell-group-inset-padding);
        margin-right: var(--van-cell-group-inset-padding);
        padding-bottom: 10px;
        background: #fff;
        border-radius: var(--van-cell-group-inset-border-radius) var(--van-cell-group-inset-border-radius) 0px 0px;
    }
    :deep(.van-cell-group--inset) {
        margin: 0px var(--van-cell-group-inset-padding);
        border-radius: 0px 0px var(--van-cell-group-inset-border-radius) var(--van-cell-group-inset-border-radius);
    }
    :deep(.van-tabs__line) {
        background: var(--van-blue);
    }
}
</style>

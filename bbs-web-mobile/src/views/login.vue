<!-- 登录页 -->
<template>
    <div class="main">

        <div class="main-container">
            <!-- title="登录" left-text="返回" -->
            <van-nav-bar :title="t('login.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="form.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            
                <div class="loginModule">
                    <van-tabs v-model:active="form.type" swipeable>
                        <!-- title="账号密码登录" -->
                        <van-tab :title="t('login.20')" :name="10">
                            <van-form ref="formAccountRef" label-width="3.8em" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <!-- label="账号" placeholder="请输入账号" -->
                                    <van-field v-model.trim="form.account" :label="t('login.30')" :placeholder="t('login.40')" maxlength="25" clearable :rules="[{ validator: validatorAccount }]" :error-message="error.account"/>
                                    <!-- label="密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.password" type="password" :label="t('login.50')" :placeholder="t('login.60')" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                    <!-- label="验证码" placeholder="请输入验证码" -->
                                    <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
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
                        <!-- title="手机号登录" -->
                        <van-tab :title="t('login.120')" :name="20">
                            <van-form ref="formMobileRef" label-width="3.8em" :scroll-to-error="true" class="form-container">
                                <van-cell-group inset>
                                    <!-- label="区号" -->
                                    <van-field v-model="form.countryCodeName" v-if="form.isAllowForeignCellPhoneRegistration" is-link readonly :label="t('login.190')" @click="onShowCountryCode" class="countryCodePopup" :error-message="error.countryCode"/>
                                    
                                    <!-- label="手机号" placeholder="请输入手机" -->
                                    <van-field v-model.trim="form.mobile" :label="t('login.70')" :placeholder="t('login.80')" maxlength="14"  type="tel" clearable :rules="[{ validator: validatorMobile }]" :error-message="error.mobile"/>
                                    <!-- label="密码" placeholder="请输入密码" -->
                                    <van-field v-model.trim="form.password" type="password" :label="t('login.50')" :placeholder="t('login.60')" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                                
                                    <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
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

                    <div class="info">
                        <!-- 注册 -->
                        <router-link to="/register" tag="div" class="register">{{t('login.90')}}</router-link>
                        <!-- 找回密码 -->
                        <router-link to="/findPassWord/step1" tag="div" class="findPassWord">{{t('login.100')}}</router-link>
                    </div>

                    <div class="otherLogin" v-if="form.supportLoginInterfaceList != null && form.supportLoginInterfaceList.length >0">
                         <!-- 其他登录方式 -->
                        <van-divider>{{t('login.110')}}</van-divider>
                        <p class="link">
                            <span v-for="supportLoginInterface in form.supportLoginInterfaceList">
                                <a @click="jumpLogin(supportLoginInterface.interfaceProduct)" :class="'icon-'+supportLoginInterface.interfaceProduct" :title="supportLoginInterface.name"></a>             
                            </span>
                        </p>
                    </div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import { useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { processErrorInfo} from '@/utils/tool';
    import { CountryCode, SupportLoginInterface } from '@/types';
    import { SHA256} from 'crypto-js';
    import { jumpDataFormat, processJumpAttribute } from '@/utils/jumpProcess';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { getWeiXinCode, isWeiXinBrowser } from '@/utils/weChatBrowserUtil'
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { useI18n } from 'vue-i18n';
    import { countryCodePopUp, getDefaultCountryCode } from '@/components/countryCode/countryCodeTool';
    let { t } = useI18n();
  
    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formAccountRef = ref();
    const formMobileRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
   
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('login.10')+' - ' + titleValue;//登录
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    //登录表单
    const form = reactive({
        isAllowForeignCellPhoneRegistration:false,//是否允许国外手机号注册
        type:10,//用户类型
        account: '',//账号
        countryCode:'',//区号
        countryCodeName:'',//区号名称
        mobile: '',//手机号
        password: '',//密码
        showCaptcha:false,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态

        supportLoginInterfaceList: [] as SupportLoginInterface[],//支持登录接口集合

        isRefreshing:false,//是否处于下拉加载中状态
    })
    //登录错误
    const error = reactive({
        account: '',//账号
        countryCode:'',//区号
        mobile: '',//手机号
        password: '',//密码
        captchaValue: '',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;
        form.isAllowForeignCellPhoneRegistration = false;//是否允许国外手机号注册
        //重置
        form.type = 10;//用户类型
        form.account =  '';//账号
        form.countryCode='',//区号
        form.countryCodeName='',//区号名称
        form.mobile =  '';//手机号
        form.password =  '';//密码
        form.showCaptcha = false;//是否显示验证码
        form.captchaKey =  '';//验证码key
        form.captchaValue =  '';//验证码值
        form.imgUrl =  '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态

        form.supportLoginInterfaceList.length =0;//支持登录接口集合
        
        init();
    };

    //校验账号
    const validatorAccount = (val:any):boolean => {
        if(val != ''){
            if(val.length <3 || val.length>25){
                error.account = t('login.130')//账号在 3 至 25个字符之间
                return false;
            }
        }else{
            error.account = t('login.140')//账号不能为空
            return false;
        }
        error.account = "";
        return true;
    }
    //校验手机号
    const validatorMobile = (val:any):boolean => {
        if(val != ''){
            if(val.length <7 || val.length>14){
                error.mobile = t('login.150')//手机号码长度不正确
                return false;
            }
        }else{
            error.mobile = t('login.160')//手机号不能为空
            return false;
        }
        error.mobile = "";
        return true;
    }

    //校验密码
    const validatorPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.password = t('login.170')//密码长度不能小于7个字符
                return false;
            }
        }else{
            error.password = t('login.180')//密码不能为空
            return false;
        }
        error.password = "";
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
    //显示区号选项
    const onShowCountryCode = () => {
        countryCodePopUp(proxy,appContext,form.countryCode,(data)=>{
            form.countryCode = data.phone_code;
            form.countryCodeName= data.name+' (+'+data.phone_code+')';//区号名称
        });
    }

    //加载登录页
    const queryLogin = () => {
        
        proxy?.$axios({
            url: '/login',
            method: 'get',
            params: {},
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;

                form.isAllowForeignCellPhoneRegistration = result.isAllowForeignCellPhoneRegistration;//是否允许国外手机号注册
                let formCaptcha = result.formCaptcha;

                if (formCaptcha.showCaptcha == true) {
                    form.showCaptcha = true;
                    form.captchaKey = formCaptcha.captchaKey;
                    replaceCaptcha();//刷新验证码
				}
            }
        }).catch((error: any) =>{
            console.log(error);
        });

    }

	//加载第三方登录页
    const queryThirdPartyLogin = () => {
        proxy?.$axios({
            url: '/queryThirdPartyLogin',
            method: 'get',
            params:  {  
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result != null){
                    form.supportLoginInterfaceList = result;
                }
            }
        }).catch((error: any) =>{
            console.log(error);
        });
    }	
    //跳转登录
    const jumpLogin = (interfaceProduct:number) => {
        proxy?.$axios({
            url: '/thirdParty/loginLink',
            method: 'get',
            params:  {  
                interfaceProduct:interfaceProduct,
                jumpUrl:(router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl :'')
            },
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result.redirectUrl != undefined){
                    window.location.href = result.redirectUrl;

                }
            }
        }).catch((error: any) =>{
            console.log(error);
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
                // 全局表单验证
                formMobileRef.value.validate().then(() => {
                    resolve();
                }).catch(() => {
                    form.allowSubmit = false;//提交按钮disabled状态
                })
            }else{
                resolve();
            }
        });
        Promise.all([p1,p2])
            .then(() => {
                //清空error的属性值
                Object.keys(error).map(key => {
                    Object.assign(error, {[key] : ''});
                })
            

                let formData = new FormData();
                if(form.type == 10){//10:本地账号密码用户
                    formData.append('type', String(form.type));
                    //账号
                    if(form.account != ''){
                        formData.append('account', form.account);
                    }
                }else if(form.type == 20){//20: 手机用户
                    formData.append('type', String(form.type));
                   
                    //手机号
                    if(form.mobile != ''){
                        //区号
                        formData.append('countryCode', form.countryCode);

                        formData.append('mobile', form.mobile);
                    }
                }
                
                //密码需SHA256加密
                if(form.password){
                    let SHA256Value = SHA256(form.password).toString();
                    formData.append('password', SHA256Value);
                }


                //url跳转参数
                let jumpUrl:string = router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl as string : '';
                if (jumpUrl != null && jumpUrl != '') {
                    formData.append('jumpUrl', jumpUrl);
                }


                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/login',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                    
                        if(JSON.parse(result.success)){//登录成功
                            let jumpUrl = result.jumpUrl;
                            let systemUser = result.systemUser;
                            let accessToken = result.accessToken;
                            let refreshToken = result.refreshToken;

                            //访问令牌和刷新令牌存储到localStorage
                            window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));

                            store_systemUser.value = systemUser;



                            if (jumpUrl != null && jumpUrl != '' && jumpUrl != 'index') {

                                let decryptObject = jumpDataFormat(jumpUrl);
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
                            //处理错误信息
                            processErrorInfo(result.error as Map<string,string> , error,()=>{});
                            

                            form.allowSubmit = false;//提交按钮disabled状态

                            if(result.captchaKey != null){
                                form.showCaptcha = true;
                                form.captchaKey = result.captchaKey;
                                replaceCaptcha();
                            }else{
                                form.showCaptcha = false;
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
    
    
   
    //恢复微信浏览器会话
    const recoverWeChatBrowserSession = (code:string,jumpUrl:string,callback:any) => {
        let formData = new FormData();
        formData.append('code', code);
        
        proxy?.$axios({
            url: '/recoverWeChatBrowserSession',
            method: 'post',
            data: formData,
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result){
                    let openId = result.openId;
                    let systemUser = result.systemUser;
                    let accessToken = result.accessToken;
                    let refreshToken = result.refreshToken;
                    
                    if(openId != undefined && openId != null && openId != ''){

                    }
                    if(systemUser != undefined && systemUser != null && Object.keys(systemUser).length > 0){
                        //访问令牌和刷新令牌存储到localStorage
                        window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));

                        store_systemUser.value = systemUser;

                        if (jumpUrl != null && jumpUrl != '' && jumpUrl != 'index') {

                            let decryptObject = processJumpAttribute(jumpUrl);
                            router.push({
                                path : decryptObject.path,
                                query: decryptObject.query
                            });
                            
                            

                        }
                        
                        
                        callback()
                        

                    }
                }

                
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //初始化
    const init = () => {
		if(isWeiXinBrowser() && store.weixin_oa_appid != ''){
			//处理微信公众号自动登录
			let weixin_openid_value = sessionStorage.getItem("weixin_openid"); 
			if(weixin_openid_value == null || weixin_openid_value == ""){//如果来自微信内置浏览器
				
				//获取微信code
				getWeiXinCode()
                //获取微信code
                let code:string = router.currentRoute.value.query.code != undefined ? router.currentRoute.value.query.code as string : '';
                //url跳转参数
                let jumpUrl:string = router.currentRoute.value.query.jumpUrl != undefined ? router.currentRoute.value.query.jumpUrl as string : '';
                
                recoverWeChatBrowserSession(code,jumpUrl,()=>{
                    sessionStorage.setItem("pushState", "true"); //标记添加URL记录
                })

				
			}
			window.history.pushState(null, "", "");
		}


        //加载登录页
        queryLogin();

        //加载第三方登录页
        queryThirdPartyLogin();

        //获取默认国际区号
        let countryCode:CountryCode = getDefaultCountryCode();
        form.countryCode = countryCode.phone_code;
        form.countryCodeName= countryCode.name+' (+'+countryCode.phone_code+')';//区号名称
	}

    onMounted(() => {
        init();
    }) 
    
    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('login.10')+' - ' + titleValue;//登录
        }
    })
</script>



<style scoped lang="scss">
.loginModule{
    margin-top: var(--van-cell-group-inset-padding);
    margin-bottom: var(--van-cell-group-inset-padding);
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
    .info{
        margin-top: 15px; 
        font-size: 15px; 
        
        .register{
            color: var(--van-blue);
            margin-left: 20px;
        }
        .findPassWord{
            float: right;
            color: var(--van-blue);
            margin-right: 20px;
        }
    }
    .otherLogin {
        margin:0 auto;
        margin-top: 30px;
        margin-left: var(--van-cell-group-inset-padding);
        margin-right: var(--van-cell-group-inset-padding);
        font-size: 14px;
        .van-divider {
            border-color: var(--van-gray-4);
        }
        .link{
            text-align: center;
            margin: 10px 0 0px;
            a{
                display: inline-block;
                width: 48px;
                color: var(--van-gray-3);
                margin: 0 10px;
                background-size: 100% auto;
                background-repeat: no-repeat;
            }
            .icon-10{
               // background-image:url('../images/weixin.svg');
                background-image:url('@/assets/images/weixin.svg');
                width: 30px;
                height: 30px;
            }
            .icon-50{
                background-image:url('@/assets/images/other-login.svg');
                width: 30px;
                height: 30px;
            }
        }

    }
}


</style>
<!-- 修改个人资料 -->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!-- title="修改个人资料" left-text="返回" -->
                <van-nav-bar :title="t('editUser.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="form.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
            <div class="editUserModule" >
                <van-form ref="formRef" :scroll-to-error="true" class="form-container">
                    <van-cell-group inset>
                        <!-- label="账号" -->
                        <van-field :label="t('editUser.20')" center >
                            <template #input>
                                {{form.user.account}}
                            </template>
                        </van-field>
                        <!-- label="呢称" placeholder="不设置请留空" -->
                        <van-field v-model.trim="form.nickname" v-if="form.user.nickname == null || form.user.nickname == ''" name="nickname" :label="t('editUser.30')" :placeholder="t('editUser.40')" maxlength="15" :show-word-limit="true" clearable :error-message="error.nickname"/>
                        <!-- label="呢称" --> 
                        <van-field :label="t('editUser.30')" center v-if="form.user.nickname != null && form.user.nickname != ''">
                            <template #input>
                                {{form.user.account}}
                            </template>
                        </van-field>
                        <!-- label="角色" -->
                        <van-field :label="t('editUser.50')" center v-if="form.userRoleList != null && form.userRoleList.length >0" class="userRoleField">
                            <template #input>
                                <div class="userRole-container">
                                    <div v-for="userRole in form.userRoleList" class="userRoleText">
                                        <div>{{userRole.name}}</div>
                                        <!-- {{userRole.validPeriodEnd}} 到期 -->
                                        <div>{{t('editUser.60',{'p1': userRole.validPeriodEnd})}}</div>
                                    </div>
                                </div>
                            </template>
                        </van-field>
                        <!-- label="旧密码" placeholder="不修改请留空" -->
                        <van-field v-model.trim="form.oldPassword" name="oldPassword" type="password" :label="t('editUser.70')" :placeholder="t('editUser.80')" maxlength="20" clearable :error-message="error.oldPassword"/>
                        <!-- label="新密码" placeholder="不修改请留空" -->
                        <van-field v-model.trim="form.password" name="password" type="password" :label="t('editUser.90')" :placeholder="t('editUser.80')" maxlength="20" clearable :rules="[{ validator: validatorPassword }]" :error-message="error.password"/>
                        <!-- label="确认新密码" placeholder="不修改请留空" -->
                        <van-field v-model.trim="form.confirmPassword" name="confirmPassword" type="password" :label="t('editUser.100')" :placeholder="t('editUser.80')" maxlength="20" clearable :rules="[{ validator: validatorConfirmPassword }]" :error-message="error.confirmPassword"/>
                        <!-- label="显示用户动态" -->
                        <van-field name="switch" :label="t('editUser.120')">
                            <template #input>
                                <van-switch v-model="form.allowUserDynamic" size="20" />
                            </template>
                        </van-field>
                        <template v-for="(userCustom,index) in form.userCustomList">
                            <div class="van-cell cell-field"  v-if="userCustom.chooseType ==1">
                                <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                    <span>{{userCustom.name}}</span>
                                </div>
                                <div class="van-cell__value">
                                    <span>
                                        <!-- placeholder="请输入" -->
                                        <van-field v-model="form.userBoundField[index]" :required="userCustom.required" :placeholder="t('editUser.130')" :maxlength="userCustom.maxlength" class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                    </span>
                                </div>
                                <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                    {{userCustom.tip}}
                                </div>
                            </div>
                            <div class="van-cell cell-field"  v-if="userCustom.chooseType ==2">
                                <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                    <span>{{userCustom.name}}</span>
                                </div>
                                <div class="van-cell__value">
                                    <span>
                                        <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                            <template #input>
                                                <van-radio-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                    <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key">{{value}}</van-radio>
                                                </van-radio-group>
                                            </template>
                                        </van-field>
                                        
                                    </span>
                                </div>
                                <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                    {{userCustom.tip}}
                                </div>
                            </div>
                            <div class="van-cell cell-field"  v-if="userCustom.chooseType ==3">
                                <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                    <span>{{userCustom.name}}</span>
                                </div>
                                <div class="van-cell__value">
                                    <span>
                                        <van-field class="cell-field-value" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                            <template #input>
                                                <van-checkbox-group v-model="form.userBoundField[index]" direction="horizontal" >
                                                    <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square">{{value}}</van-checkbox>
                                                </van-checkbox-group>
                                            </template>
                                        </van-field>
                                        
                                    </span>
                                </div>
                                <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                    {{userCustom.tip}}
                                </div>
                            </div>
                            <div class="van-cell cell-field"  v-if="userCustom.chooseType ==4">
                                <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                    <span>{{userCustom.name}}</span>
                                </div>
                                <div class="van-cell__value">
                                    <span>
                                        <van-field class="cell-field-value" v-if="!userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                            <template #input>
                                                <van-radio-group v-model="form.userBoundField[index]">
                                                    <van-radio :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" class="cell-field-radio">{{value}}</van-radio>
                                                </van-radio-group>
                                            </template>
                                        </van-field>
                                        <van-field class="cell-field-value" v-if="userCustom.multiple" :error-message="error.userCustom.get('userCustom_'+userCustom.id)">
                                            <template #input>
                                                <van-checkbox-group v-model="form.userBoundField[index]">
                                                    <van-checkbox :name="key" v-for="(value, key) in userCustom.itemValue" :key="key" shape="square" class="cell-field-radio">{{value}}</van-checkbox>
                                                </van-checkbox-group>
                                            </template>
                                        </van-field>
                                    </span>
                                </div>
                                <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                    {{userCustom.tip}}
                                </div>
                            </div>
                            <div class="van-cell cell-field"  v-if="userCustom.chooseType ==5">
                                <div :class="userCustom.required ? 'van-field__label--required' : ''" class="van-cell__title van-field__label cell-field-title">
                                    <span>{{userCustom.name}}</span>
                                </div>
                                <div class="van-cell__value">
                                    <span>
                                        <!-- placeholder="请输入" -->
                                        <van-field v-model="form.userBoundField[index]" :required="userCustom.required" :placeholder="t('editUser.130')" :maxlength="userCustom.maxlength" :rows="userCustom.rows" type="textarea" autosize class="cell-field-value" clearable :error-message="error.userCustom.get('userCustom_'+userCustom.id)" />
                                    </span>
                                </div>
                                <div class="van-cell__label cell-field-label" v-if="userCustom.tip != null && userCustom.tip != ''" >
                                    {{userCustom.tip}}
                                </div>
                            </div>
                        </template>
                    
                    </van-cell-group>
                    <div class="submitButton">
                        <!-- 提交 -->
                        <van-button round block type="primary" native-type="submit" @mousedown="onSubmit" :disabled="form.allowSubmit">{{t('common.50')}}</van-button>
                    </div>
                </van-form>
                
            </div>
        </van-pull-refresh>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { User, UserCustom,UserRole } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { Notify } from 'vant';
    import { processErrorInfo } from '@/utils/tool';
    import { SHA256 } from 'crypto-js';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('editUser.10')+' - ' +titleValue;//修改个人资料
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const form = reactive({
        user: {} as User,
        userCustomList: [] as Array<UserCustom>,
        userRoleList: [] as Array<UserRole>,
        userBoundField : [] as any, //用户自定义注册功能项绑定
        avatar:'',//字符头像

        nickname:'',//呢称
        oldPassword:'',//旧密码
        password:'',//密码
        confirmPassword:'',//确认密码
        allowUserDynamic:false,//允许显示用户动态
        allowSubmit:false,//提交按钮disabled状态 

        isRefreshing:false,//是否处于下拉加载中状态
    });
    //错误
    const error = reactive({
        nickname:'',//呢称
        oldPassword:'',//旧密码
        password:'',//密码
        confirmPassword:'',//确认密码
        allowUserDynamic:'',//允许显示用户动态
        userCustom:new Map(),
    })
    

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        form.user = {} as User;
        form.userCustomList.length = 0;
        form.userRoleList.length = 0;
        form.userBoundField.length = 0;
        form.avatar = '';//字符头像

        form.nickname = '';//呢称
        form.oldPassword = '';//旧密码
        form.password = '';//密码
        form.confirmPassword = '';//确认密码
        form.allowUserDynamic = false;//允许显示用户动态
        form.allowSubmit = false;//提交按钮disabled状态 

        init();
    };

    //查询个人资料
    const queryEditUser = () => {
        proxy?.$axios({
            url: '/user/control/editUser',
            method: 'get',
            params:  { 
               
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                form.user = result.user;
                form.userCustomList = result.userCustomList;
                form.userRoleList = result.userRoleList;

                if(form.user.allowUserDynamic){
                    form.allowUserDynamic = true;//允许显示用户动态
                }
                //绑定字段
                if(form.userCustomList != null && form.userCustomList.length >0){
                    for (let i = 0; i < form.userCustomList.length; i++) {
                        let userCustom = form.userCustomList[i];
                        boundField(userCustom);
                    }
                }
                if(form.user.avatarName == null){
                    if(form.user.nickname != null && form.user.nickname !=''){
                        form.avatar = letterAvatar(form.user.nickname, 100);
                    }else{
                        form.avatar = letterAvatar(form.user.account, 100);
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //绑定字段
    const boundField = (userCustom:UserCustom) => {
        if (userCustom.chooseType == 1) { //文本框
            let content = "";
            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                content = userCustom.userInputValueList[i].content;
            }
            form.userBoundField.push(content);
        }else if (userCustom.chooseType == 2) { //单选框
            let checked = "";

            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                let userInputValue = userCustom.userInputValueList[i];
                checked = userInputValue.options;

            }
            //默认选第一项 
            if (checked == "") {
                for (let itemValue in userCustom.itemValue) {
                    checked = itemValue;
                    break;
                }
            }
            form.userBoundField.push(checked);
        } else if (userCustom.chooseType == 3) { //多选框
            let checked = new Array();

            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                let userInputValue = userCustom.userInputValueList[i];
                checked.push(userInputValue.options);
            }
            form.userBoundField.push(checked);
        }else if (userCustom.chooseType == 4) { //下拉列表
            if (userCustom.multiple == true) { //允许多选
                let checked = new Array();

                A:for (let itemValue in userCustom.itemValue) {
                    for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                        let userInputValue = userCustom.userInputValueList[i];
                        if (itemValue == userInputValue.options) {
                            checked.push(itemValue);
                            continue A;
                        }
                    }
                }
                form.userBoundField.push(checked);

            } else {
                
                let checked = "";

                A:for (let itemValue in userCustom.itemValue) {
                    for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                        let userInputValue = userCustom.userInputValueList[i];
                        if (itemValue == userInputValue.options) {
                            checked = itemValue;
                            break A;
                        }
                    }
                }
                form.userBoundField.push(checked);
            }


        } else if (userCustom.chooseType == 5) { //文本域
            let content = "";
            for (let i = 0; i < userCustom.userInputValueList.length; i++) {
                content = userCustom.userInputValueList[i].content;
            }
            form.userBoundField.push(content);
        }

    }

    
    //校验密码
    const validatorPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.password = t('editUser.140')//密码长度不能小于7个字符
                return false;
            }
        }
        error.password = "";
        return true;
    }
    //校验确认密码
    const validatorConfirmPassword = (val:any):boolean => {
        if(val != ''){
            if(val.length <7){
                error.confirmPassword = t('editUser.140')//密码长度不能小于7个字符
                return false;
            }else{
                if(form.password != val){
                    error.confirmPassword = t('editUser.150')//两次输入密码不相等
                    return false;
                }
            }
        }
        error.confirmPassword = "";
        return true;
    }

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
                for (const [key, value] of Object.entries(error) as [string, string|Map<string,string>][]){
                    if(value instanceof Map){
                        value.clear();
                    }else{
                        Object.assign(error, {[key] : ''});
                    }
                }

                let formData = new FormData();
                //呢称
                if(form.nickname != null && form.nickname != ''){
                    formData.append('nickname', form.nickname);
                }
                
                formData.append('allowUserDynamic', form.allowUserDynamic.toString());


                //密码需SHA256加密
                if(form.password != null && form.password.trim() != ''){
                    let SHA256Value = SHA256(form.password.trim()).toString();
                    formData.append('password', SHA256Value);

                    if(form.oldPassword != null && form.oldPassword.trim() != ''){
                        let oldPassword_SHA256Value = SHA256(form.oldPassword.trim()).toString();
                        formData.append('oldPassword', oldPassword_SHA256Value);
                    }
                }


                if (form.userCustomList != null && form.userCustomList.length > 0) {
                    for (let i = 0; i < form.userCustomList.length; i++) {
                        let userCustom = form.userCustomList[i];
                        
                        var fieldValue = form.userBoundField[i];

                        if (userCustom.chooseType == 1) { //文本框
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        } else if (userCustom.chooseType == 2) { //单选框
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        } else if (userCustom.chooseType == 3) { //多选框
                            for (var value in fieldValue) {
                                formData.append('userCustom_'+ userCustom.id, fieldValue[value]);
                            }
                        } else if (userCustom.chooseType == 4) { //下拉列表
                            if (userCustom.multiple == true) { //允许多选
                                for (var value in fieldValue) {
                                    formData.append('userCustom_'+ userCustom.id, fieldValue[value]);
                                }
                            }else{
                                formData.append('userCustom_'+ userCustom.id, fieldValue);
                                
                            }
                        } else if (userCustom.chooseType == 5) { //文本域
                            formData.append('userCustom_'+ userCustom.id, fieldValue);
                        }
                        
                        
                    }
                }

                proxy?.$axios({
                    url: '/user/control/editUser',
                    method: 'post',
                    data: formData
                })
                .then((response: AxiosResponse) => {
                    if(response){

                        const result: any = response.data;
                        if(JSON.parse(result.success)){
                            let systemUser = result.systemUser;
                            let accessToken = result.accessToken;
                            let refreshToken = result.refreshToken;
                            Notify({ 
                                type: 'success', 
                                message: t('editUser.160')//修改成功
                            });
                           
                            if(systemUser != null){
                                //访问令牌和刷新令牌存储到localStorage
                                window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));

                                store_systemUser.value = systemUser;
                            }
                            init();
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

    onMounted(() => {
        init();


    })

    //初始化
    const init = () => {
		queryEditUser();
	}

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('editUser.10')+' - ' +titleValue;//修改个人资料
        }
    })
</script>

<style scoped lang="scss">
.editUserModule{
    margin: var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    
    .form-container{
        .userRole-container{
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            margin-left: -10px;
            .userRoleText{
                padding: 5px 10px 5px 10px;
                width: 100%;
                border-radius:2px;
                background: var(--van-gray-1);
                margin-bottom: 10px;
                line-height: 24px;
            }
            &:last-child{
                margin-bottom: -10px;
            }
        }
        
        .submitButton{
            padding-bottom: 16px;
        }
    }
}

</style>

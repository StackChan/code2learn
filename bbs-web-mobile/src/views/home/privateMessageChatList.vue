<!--私信对话-->
<template>
    <div class="main">
        <div class="main-container">
            <van-sticky>
                <!--title="私信对话" left-text="返回"-->
                <van-nav-bar :title="t('privateMessageChatList.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                    <template #right>
                        <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                    </template>
                </van-nav-bar>
            </van-sticky>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="state.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">
                <div class="headModule">
                    <div class="chatInfo"><!-- 
                        <b>与 
                            <span class="cancelAccount" v-if="state.chatUser == null">此用户账号已注销</span>
                            <router-link tag="a" v-if="state.chatUser != null" :to="{path:'/user/control/home',query:{userName:state.chatUser.userName}}" >
                                {{state.chatUser.account}}<span v-if="state.chatUser.nickname != null && state.chatUser.nickname != ''"> ({{state.chatUser.nickname}})</span>
                            </router-link> 的对话</b> -->
                        <b>
                            <i18n-t keypath="privateMessageChatList.20" scope="global">
                                <template #p1>
                                    <span class="cancelAccount" v-if="state.chatUser == null">{{t('privateMessageChatList.30')}}</span>
                                    <router-link tag="a" v-if="state.chatUser != null" :to="{path:'/user/control/home',query:{userName:state.chatUser.userName}}">
                                        {{state.chatUser.account}}<span v-if="state.chatUser.nickname != null && state.chatUser.nickname != ''"> ({{state.chatUser.nickname}})</span>
                                    </router-link>
                                </template>
                            </i18n-t>
                        </b>
                    </div>
                </div>
                
            
                <div class="privateMessageChatListModule" >
                    <!--error-text="请求失败，点击重新加载" -->
                    <van-list v-model:loading="state.isLoading" :finished="state.isFinished" v-model:error="state.isError" :offset="10" :error-text="t('common.140')" direction="up" finished-text="" @load="onLoad" >
                
                        <div class="privateMessageChatModule" ref="privateMessageChat" v-if="state.privateMessageList != null && Object.keys(state.privateMessageList).length > 0">
                            
                                <div v-for="privateMessage in state.privateMessageList" :ref="'privateMessage_'+privateMessage.id">

                                    <!--如果私信对方用户Id和发送者用户Id相同，则说明消息由对方所发 -->
                                    <div class="friend" v-if="privateMessage.friendUserId == privateMessage.senderUserId">
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:privateMessage.senderUserName}}" >
                                            <img v-if="privateMessage.senderAvatarName != null && privateMessage.senderAvatarName != ''" :src="privateMessage.senderAvatarPath+'100x100/'+privateMessage.senderAvatarName" width="48" height="48">
                                            <img v-if="privateMessage.senderAvatarName == null || privateMessage.senderAvatarName == ''" :src="privateMessage.senderAvatar" width="48" height="48">   
                                        </router-link>
                                        <div>
                                            <span>
                                                <div class="time">{{privateMessage.sendTime}}</div>
                                                <i></i>
                                                <em v-html="privateMessage.messageContent"></em>
                                                <!-- 
                                                <a class="msg-del"></a> -->
                                            </span>
                                        </div>
                                    </div>
                                    <!--自己发的消息 -->
                                    <div class="self" v-if="privateMessage.friendUserId != privateMessage.senderUserId">
                                        <router-link tag="a" :to="{path:'/user/control/home',query:{userName:privateMessage.senderUserName}}" >
                                            <img v-if="privateMessage.senderAvatarName != null && privateMessage.senderAvatarName != ''" :src="privateMessage.senderAvatarPath+'100x100/'+privateMessage.senderAvatarName" width="48" height="48">
                                            <img v-if="privateMessage.senderAvatarName == null || privateMessage.senderAvatarName == ''" :src="privateMessage.senderAvatar" width="48" height="48">   
                                        </router-link>

                                        <div>
                                            <span>
                                                <div class="time">{{privateMessage.sendTime}}</div>
                                                <i></i>
                                                <em v-html="privateMessage.messageContent"></em>
                                                <!-- 
                                                <a class="msg-del"></a> -->
                                            </span>
                                        </div>


                                
                                    </div>
                                </div>
                            
                        </div>
                        
                    </van-list>
                    <div class="privateMessageChatModule" v-if="state.isSkeleton">  
                        <van-skeleton :row="3" :loading="state.isSkeleton" class="skeleton"/>
                    </div>
                </div>        
            </van-pull-refresh>
            <div class="privateMessageEnter van-hairline--top">
				<div class="message-container" @click="addPrivateMessageUI();" >
					<div class="messageContent-box">
                        <Icon name="pencil" :size="convertViewportWidth('16px')" class="messageContent-icon"/>
                        <!-- 我想说的话... -->
						<span class="messageContent-text" v-if="form.messageContent == null || form.messageContent == ''">{{t('privateMessageChatList.40')}}</span>
						<span class="messageContent-text" v-if="form.messageContent != null && form.messageContent != ''">{{form.messageContent}}</span>
					</div>
					<div class="privateMessage-info">
						<span>
							<span class="message-count-icon">
                                <Icon name="commentCount" :size="convertViewportWidth('16px')"/>
							</span>
							<span class="message-count-text">{{state.totalrecord}}</span>
						</span>
					</div>
				</div>
			</div>
            <van-popup v-model:show="form.popup_privateMessage" safe-area-inset-bottom :close-on-popstate="true" position="bottom" closeable close-icon="close" class="custom-bottom-popupModule" :style="{ height: '80%' }" round>
                <div ref="formScrollRef" class="scroll" v-if="form.allowSendPrivateMessage">
                    <van-form ref="formRef" @submit="onSubmit" :scroll-to-error="true" class="form-container" >
                        <!-- placeholder="请输入私信内容" -->
                        <van-field v-model="form.messageContent" name="messageContent" :placeholder="t('privateMessageChatList.50')" autosize :rows="6" type="textarea" class="messageContent-item" :rules="[{ validator: validatorMessageContent }]"  :error-message="error.messageContent" />
                        <!-- label="验证码" placeholder="请输入验证码" -->
                        <van-field v-model="form.captchaValue" name="captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                            <template #button>
                                <van-image :src="form.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                            </template>
                            <template #extra >
                                <!-- 换一幅 -->
                                <span class="captcha-replace" @click="replaceCaptcha">{{t('common.80')}}</span>
                            </template>
                        </van-field>
                        <div class="submitButton">
                            <!-- 提交 -->
                            <van-button round block type="primary" native-type="submit" :disabled="form.allowSubmit">{{t('common.50')}}</van-button>
                       
                        
                        </div>         
                    </van-form>
                </div>
                <div ref="formScrollRef" v-if="!form.allowSendPrivateMessage">
                    <div class="resultModule">
                        <div class="result">
                            <div class="result-icon">
                                <van-icon name="warning" class="icon-warning" size="64px"/>
                            </div>
                            <div class="result-title">
                                <!-- 不允许发私信 -->
                                <p>{{t('privateMessageChatList.60')}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </van-popup>
        </div>
    </div>
</template>


<script lang="ts" setup>
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, nextTick, ref, watchEffect, onActivated} from 'vue'
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import {useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { PrivateMessage,User } from "@/types/index";
    import { letterAvatar } from '@/utils/letterAvatar';
    import { hasScrolled, processErrorInfo, setScrollTop } from '@/utils/tool';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();

    const privateMessageChat = ref();
    const formScrollRef = ref();
    const formRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)
 
    
    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('privateMessageChatList.10')+' - ' + titleValue;//私信对话
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    const state = reactive({
        
        friendUserName : '',//对方用户名称
        chatUser :{} as User,
        privateMessageList:[] as Array<PrivateMessage>,
        totalrecord : 0, //总记录数
		currentpage : 0, //当前页码
        totalpage : 1, //总页数
        maxresult: 12, //每页显示记录数     

        isRefreshing:false,//是否处于下拉加载中状态
        isError:false,//是否列表数据加载失败
        isLoading:false,//是否处于加载中状态
        isFinished:false,//是否加载完毕(加载到第一页)
        isSkeleton:true,//是否显示骨架屏
        isShowPage:false,//是否显示分页

    });

    const form = reactive({
        popup_privateMessage :false,//发私信弹出层
        allowSendPrivateMessage:false,//是否允许发私信
        messageContent: '',//私信内容
        showCaptcha:false,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态

    });

    //错误
    const error = reactive({
        messageContent:'',//发私信内容
        captchaValue:'',//验证码
    })

    //下拉刷新时触发
    const onRefresh = () => {
        state.isRefreshing = false;

        //重置
        state.privateMessageList.length = 0;
        state.totalrecord = 0; //总记录数
		state.currentpage = 0; //当前页码
        state.totalpage = 1; //总页数
        state.maxresult = 12; //每页显示记录数    
        state.isError = false;//是否列表数据加载失败
        state.isFinished = false; 

        state.isLoading = true;//手动触发查询数据需将'加载状态结束'设为true
        queryPrivateMessageChatList(state.friendUserName,null);
    };
    //加载列表
    const onLoad = () => {
        let page: number|null = state.currentpage-1;
        if(state.privateMessageList == null || Object.keys(state.privateMessageList).length == 0){
            page = null;//第一次触发时设置空分页，让后端自动查询最后一页
        }
        queryPrivateMessageChatList(state.friendUserName,page);
    }

    //查询私信对话列表
    const queryPrivateMessageChatList = (friendUserName:string, page: number|null) => {
        proxy?.$axios({
            url: '/user/control/privateMessageChatList',
            method: 'get',
            params:  { 
                friendUserName:friendUserName,
                page: page
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
            showErrorMessage:false,// 是否显示错误提示
        })
        .then((response: AxiosResponse) => {
            if(response){
                const data: any = response.data;
                if(data){
                    state.isSkeleton = false;//关闭骨架屏
                    //是否含有滚动条
                    let isScroll = false;
                    if(privateMessageChat.value){
                        isScroll = hasScrolled(privateMessageChat.value);
                    }
                    

                    state.chatUser = data.chatUser;
                    //最后一个Id
                    var lastId = "";
                    if(data.pageView.records != null && data.pageView.records.length >0){
                        for(let i:number=0; i<data.pageView.records.length; i++){
                            let privateMessage = data.pageView.records[i];
                            if(privateMessage.senderNickname != null && privateMessage.senderNickname !=''){
                                privateMessage.senderAvatar = letterAvatar(privateMessage.senderNickname, 40);
                            }else{
                                privateMessage.senderAvatar = letterAvatar(privateMessage.senderAccount, 40);
                            }
                            lastId = privateMessage.id;
                        }
                        state.privateMessageList.unshift.apply(state.privateMessageList,data.pageView.records);
                       
                    }


                    state.totalrecord = parseInt(data.pageView.totalrecord);//服务器返回的long类型已转为String类型
                    state.currentpage = data.pageView.currentpage;
                    state.totalpage = parseInt(data.pageView.totalpage);//服务器返回的long类型已转为String类型
                    state.maxresult = data.pageView.maxresult;

                    state.isShowPage = true;//显示分页栏
                    if(state.totalpage == 0 || state.currentpage == 1 || (data.pageView.records != null && data.pageView.records.length == 0)){//如果没有内容或是第一页，则不再加载
                        state.isFinished = true;
                    }
                    state.isLoading = false;//加载状态结束

                    nextTick(()=>{
                        
                       
                        if(page == null){
                            //滚动到底部
                            if(lastId != null && lastId != ""){
                                let privateMessageRefValue = (proxy?.$refs['privateMessage_'+lastId] as any)[0];
                                let scrollHeight = privateMessageRefValue.scrollHeight ? privateMessageRefValue.scrollHeight :0
                                
                                setScrollTop(privateMessageRefValue.offsetTop + scrollHeight)
                            }
                        }else{
                            if(!isScroll){//在最后一页数据不满屏并且自动请求前一页数据时滚动到底部

                                let lastPrivateMessage = state.privateMessageList[state.privateMessageList.length-1];
                                let privateMessageRefValue = (proxy?.$refs['privateMessage_'+lastPrivateMessage.id] as any)[0];
                                let scrollHeight = privateMessageRefValue.scrollHeight ? privateMessageRefValue.scrollHeight :0
                                
                                setScrollTop(privateMessageRefValue.offsetTop + scrollHeight)
                            }else{
                               
                                 //跳转到锚点
                                if(lastId != null && lastId != ""){
                                    let privateMessageRefValue = (proxy?.$refs['privateMessage_'+lastId] as any)[0];
                                    setScrollTop(privateMessageRefValue.offsetTop)
                                } 
                            }

                           
                        }

                    })
                }
            }
        })
        .catch((error: any) =>{
            state.isError = true;
            state.isLoading = false;//加载状态结束
            console.log(error);
        });
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

    //添加私信UI
    const addPrivateMessageUI = () => {
        form.popup_privateMessage = true;

        //查询添加私信页
        queryAddPrivateMessage(state.friendUserName);

        //滚动到顶部
        nextTick(()=>{
            if(form.messageContent == null || form.messageContent == ''){
                formScrollRef.value.scrollTop = 0;
            }
        })
    }
    //查询添加私信页
    const queryAddPrivateMessage = (friendUserName:string) => {
        proxy?.$axios({
            url: '/user/control/addPrivateMessage',
            method: 'get',
            params:  {
                friendUserName:friendUserName
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
          
                let formCaptcha = result.formCaptcha;//验证码
                form.allowSendPrivateMessage = result.allowSendPrivateMessage;//是否允许发私信

                if (formCaptcha && formCaptcha.showCaptcha == true) {
                    form.showCaptcha = true;
                    form.captchaKey = formCaptcha.captchaKey;
                    replaceCaptcha();//刷新验证码
                }
            }
            
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    
    //校验私信内容
    const validatorMessageContent = (val:any):boolean => {
        if(val == ''){
            error.messageContent = t('privateMessageChatList.70') //内容不能为空
            return false;
        }
        error.messageContent = "";
        return true;
    }

    //提交数据
    const onSubmit = () => {  
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })
        
        let formData = new FormData();
        if(form.messageContent != null && form.messageContent.trim() != ''){
            formData.append('messageContent', form.messageContent);
        }
        
        
        let friendUserName:string = router.currentRoute.value.query.friendUserName != undefined ? router.currentRoute.value.query.friendUserName as string :'';
        formData.append('friendUserName', friendUserName);

        //验证码Key
        formData.append('captchaKey', form.captchaKey);
        //验证码值
        if(form.captchaValue != ''){
            formData.append('captchaValue', form.captchaValue.trim());
        }

        proxy?.$axios({
            url: '/user/control/addPrivateMessage',
            method: 'post',
            data: formData,
            //showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){

                const result: any = response.data;
            
                if(JSON.parse(result.success)){
                    
                    //清空表单
                    form.messageContent = '';
                    form.captchaValue = '';
                    form.popup_privateMessage = false;
                    //清空分页，会默认查询最后一页
                    onRefresh();
                    
                }else{
                    //处理错误信息
                    processErrorInfo(result.error as Map<string,string> , error,()=>{});
                    
                    if(result.captchaKey != null){
                        form.showCaptcha = true;
                        form.captchaKey = result.captchaKey;
                        replaceCaptcha();
                    }else{
                        form.showCaptcha = false;
                    }


                }
                form.allowSubmit = false;//提交按钮disabled状态
            }
        })
        .catch((error: any) =>{
            console.log(error);
            form.allowSubmit = false;//提交按钮disabled状态
        });
    }

    onMounted(() => {
        state.friendUserName = router.currentRoute.value.query.friendUserName != undefined ? router.currentRoute.value.query.friendUserName as string :'';
       
       
        //设置缓存
        store.setCacheComponents(String(router.currentRoute.value.name))
    })

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('privateMessageChatList.10')+' - ' + titleValue;//私信对话
        }
    })
</script>

<style scoped lang="scss">
.headModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 0px var(--van-cell-group-inset-padding);
    border-radius: var(--van-border-radius-lg);
    background: #fff;
    padding: 8px;


    .chatInfo{
        padding-top: 6px;
        padding-bottom: 6px;
        text-align: center;
        .cancelAccount{
            display: inline-block;
            vertical-align: middle;
            padding: 4px 4px;
            font-size: 14px;
            line-height: 14px;
            -webkit-border-radius: 2px;
            -moz-border-radius: 2px;
            border-radius: 2px;
            color: var(--van-gray-5);
            background-color: var(--van-gray-1);
            font-weight:normal;
            position: relative;
            top: -1px;
        }
        b{
            display: inline-block;
            font-size: 14px;
            font-weight:normal;
            color: var(--van-gray-7);
            a{
                font-weight:bold;
                color: var(--van-gray-7);
            }
        }
    }
    
}
.privateMessageChatListModule{
    margin: var(--van-cell-group-inset-padding) var(--van-cell-group-inset-padding) 62px var(--van-cell-group-inset-padding);
    
    .privateMessageChatModule {
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: var(--van-border-radius-lg);
        padding: 8px 0px 8px 0px;
        background: #fff;
        .friend{
            margin: 4px 38px 22px 10px;
            position: relative;
            img{
                position: absolute;
                width: 40px;
                height: 40px;
                left: 0;
                top: 0;
                background: #fff;
                -webkit-border-radius:50%;
                -moz-border-radius:50%;
                border-radius:50%;
            }
             div{
                position: relative;
                margin-left: 50px;
                margin-right: 36px;
                text-align: initial;
                i{
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    left: -24px;
                    top: 10px;
                    &:after{
                        content: "";
                        position: absolute;
                        border-style: solid;
                        border-color:  transparent #fafafa transparent transparent;
                        border-width: 10px;
                        left:5px;
                    }
                }
                span{
                    float: left;
                    min-height: 40px;
                    min-width: 96px;
                    margin-left: 10px;
                    margin-top:22px;
                    font-size: 14px;
                    border: 1px #fff solid;
                    background: #fafafa;
                    border-radius: 10px;
                    position: relative;
                    max-width: 94%;
                    em{
                       font-style: normal;
                        padding: 10px;
                        display: block;
                        white-space:normal; 
                        word-break:break-all; 
                        color: var(--van-gray-8);
                    }
                }
            }
            .time{
                position:absolute;
                width:150px;
                line-height: 40px;
                display: inline-block;
                color: var(--van-gray-5);
                font-size: 13px;
                top: -32px;
                left: -46px;
            }
            .msg-del{
                background: #ececec;
                color: #919191;
                border-radius: 12px;
                line-height: 20px;
                text-align: center;
                height: 20px;
                width: 20px;
                font-size: 14px;
                padding: 1px;
                top: -10px;
                right: -10px;
                position: absolute;
                &::before {
                    content: "\2716";
                }
                
            }
            .msg-del:hover {
                color: var(--van-blue);
            }
            &:after{
                content: "";
                display: block;
                height: 0;
                clear: both;
                visibility: hidden;
            }
        }
        .self{
            margin: 4px 10px 22px 38px;
            position: relative;
            img{
                position: absolute;
                width: 40px;
                height: 40px;
                left: 0;
                top: 0;
                background: #fff;
                left: auto;
                right: 0;
                -webkit-border-radius:50%;
                -moz-border-radius:50%;
                border-radius:50%;
            }
            div{
                position: relative;
                text-align: initial;
                margin-left: 18px;
                margin-right: 68px;
                i{
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    top: 10px;
                    left: auto;
                    right: -20px;
                    &:after{
                        content: "";
                        position: absolute;
                        border-style: solid;
                        border-color:  transparent transparent transparent #e5f3ff;
                        border-width: 10px;
                        left:5px;
                    }
                }
                
                span{
                    min-height: 40px;
                    min-width: 96px;
                    font-size: 14px;
                    border: 1px #fff solid;
                    border-radius: 10px;
                    position: relative;
                    max-width: 94%;
                    background: #e5f3ff;
                    border-color: #e5f3ff;
                    color: var(--van-blue);
                    float: right;
                    margin-top:22px;
                    margin-left: 0;
                    margin-right: -10px;
                    em{
                        font-style: normal;
                        padding: 10px;
                        display: block;
                        white-space:normal; 
                        word-break:break-all; 
                    }
                }
            }
            .time{
                position:absolute;
                width:150px;
                line-height: 40px;
                display: inline-block;
                color: var(--van-gray-5);
                font-size: 13px;
                top: -32px;
                right: -95px;
            }
            .msg-del{
                background: #ececec;
                color: #919191;
                border-radius: 12px;
                line-height: 20px;
                text-align: center;
                height: 20px;
                width: 20px;
                font-size: 14px;
                padding: 1px;
                top: -10px;
                left: -10px;
                position: absolute;
                &::before {
                    content: "\2716";
                }
                
            }
            .msg-del:hover {
                color: var(--van-blue);
            }
            &:after{
                content: "";
                display: block;
                height: 0;
                clear: both;
                visibility: hidden;

            }

        }
    }
    .skeleton{
        padding-top: 16px;
        padding-bottom: 16px;
    }
}
 /* 私信底部输入 */
.privateMessageEnter {
    position: fixed;
    z-index: 999;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    .message-container {
        display: flex;
        box-sizing: content-box;
        align-items: center;
        height: 54px;
        width: 100%;
        padding-bottom: env(safe-area-inset-bottom);
        border-bottom: none !important;
        background-color: #fff;
        .messageContent-box {
            height: 54px;
            border-radius: 4px;
            flex: 1;
            height: 32px;
            margin: 0 10px;
            background-color: var(--van-gray-1);
            .messageContent-icon{
                margin-left: 8px;
                font-size: 16px;
                position: relative;
                top: 3px;
                color: var(--van-gray-5);
            }
            .messageContent-text {
                line-height: 34px;
                margin-left: 5px;
                font-size: 14px;
                color: var(--van-gray-5);
                letter-spacing: 0;
                word-break:break-all;
                overflow:hidden;
            }
        }
        .privateMessage-info {
            margin: 0 13px 0 0;
            min-width: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: var(--van-gray-7);
            .message-count-icon {
                margin-right: 3px;
                color: var(--van-gray-7);
                position: relative;
                top: 3px;
            }
            .message-count-text {
                color: var(--van-gray-7);
                font-size: 14px;
            }
        }
    }
}

//私信表单
.form-container{
    margin: 16px 0px 8px 0px;
    
    .messageContent-item{
        :deep(.van-field__control){
            padding: 10px;
            background-color: var(--van-gray-1);
            overflow:hidden;//让输入框触摸可以滑动
        }
        
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .captcha-item{
        :deep(.van-field__control){
            background-color: var(--van-gray-1);
        }
        :deep(.van-field__control){
            padding: 10px;
            border-radius: 3px;
        }
        &:after{
            border-bottom: 1px solid transparent;
        }
    }
    .submitButton{
        margin: 16px 16px;
    }
}


</style>

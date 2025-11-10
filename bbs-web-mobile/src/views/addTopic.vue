<!-- 发表话题页 -->
<template>
    <div class="main">
        <div class="main-container">
            <!-- title="发表话题" left-text="返回" -->
            <van-nav-bar :title="t('addTopic.10')" :left-text="t('common.110')" left-arrow @click-left="onBack" @click-right="router.push({path: '/index'})">
                <template #right>
                    <van-icon name="wap-home-o" :size="convertViewportWidth('18px')"/>
                </template>
            </van-nav-bar>
            <!-- success-text="刷新成功" -->
            <van-pull-refresh v-model="form.isRefreshing" :success-text="t('common.130')" pull-distance="200" @refresh="onRefresh" style="min-height: 50vh;">

                <div class="addTopicModule" v-if="store_systemUser != null && Object.keys(store_systemUser).length>0">
                    <van-form ref="formRef" :scroll-to-error="true" class="form-container" v-if="form.allowTopic">
                        <van-cell-group inset>
                            <!-- label="标题" placeholder="请输入标题" -->
                            <van-field v-model.trim="form.title" :label="t('addTopic.20')" :placeholder="t('addTopic.30')" maxlength="90" clearable :rules="[{ validator: validatorTitle }]" :error-message="error.title"/>
                            <!-- label="标签" placeholder="选择标签" -->
                            <van-field v-model="form.tagName" is-link readonly :label="t('addTopic.40')" :placeholder="t('addTopic.50')" @click="onShowTagPicker" class="tagPopup" :error-message="error.tagId"/>
                            <van-popup v-model:show="form.showTagPicker" round position="bottom">
                               <van-picker :columns="form.options" @cancel="form.showTagPicker = false" :columns-field-names="{text: 'label'}" :loading="form.loading" :item-height="convertViewportWidth('44px')" :show-toolbar="false" @change="onTagChange"/>
                            </van-popup>
                            <!-- label="红包" -->
<!--                            <van-field is-link readonly :label="t('addTopic.60')" v-if="form.showRedEnvelopeText" :class="form.showRedEnvelopeForm ? 'redEnvelope-arrow-down':'redEnvelope-arrow-right'" @click="redEnvelopeForm">-->
<!--                                <template #input>-->

<!--                                </template>-->
<!--                            </van-field>-->


<!--                            <div v-if="form.showRedEnvelopeForm">-->
<!--                                &lt;!&ndash; label="红包类型" &ndash;&gt;-->
<!--                                <van-field :label="t('addTopic.70')">-->
<!--                                    <template #input>-->
<!--                                        <van-radio-group v-model="form.giveRedEnvelope_type" direction="horizontal" @change="selectRedEnvelopeType()">-->
<!--                                            <van-radio :name="20">{{t('addTopic.80')}}</van-radio>&lt;!&ndash; 随机金额红包 &ndash;&gt;-->
<!--                                            <van-radio :name="30">{{t('addTopic.90')}}</van-radio>&lt;!&ndash; 固定金额红包 &ndash;&gt;-->
<!--                                        </van-radio-group>-->
<!--                                    </template>-->
<!--                                </van-field>-->

<!--                                <div class="van-cell cell-field"  v-if="form.giveRedEnvelope_type == 20">-->
<!--                                    <div class="van-cell__title van-field__label cell-field-title">-->
<!--                                        <span>{{t('addTopic.100')}}</span>&lt;!&ndash;红包总金额 &ndash;&gt;-->
<!--                                    </div>-->
<!--                                    <div class="van-cell__value">-->
<!--                                        <span>-->
<!--                                            &lt;!&ndash; placeholder="输入金额" &ndash;&gt;-->
<!--                                            <van-field v-model.trim="form.giveRedEnvelope_totalAmount" :placeholder="t('addTopic.110')" @input="totalAmountCalculate()" maxlength="12" class="cell-field-value" :formatter="amountFormat" clearable :error-message="error.totalAmount"/>-->
<!--                                        </span>-->
<!--                                    </div>-->
<!--                                    <div class="van-cell__label cell-field-label">-->
<!--                                        <span class="help-text">-->
<!--                                            &lt;!&ndash; 合计总金额不能少于 {{form.giveRedEnvelopeAmountMin}} 元； &ndash;&gt;-->
<!--                                            <span v-if="parseFloat(form.giveRedEnvelopeAmountMin) >0">{{t('addTopic.120',{'p1': form.giveRedEnvelopeAmountMin})}}</span>	-->
<!--                                            &lt;!&ndash; 合计总金额不能超过 {{form.giveRedEnvelopeAmountMax}} 元； &ndash;&gt;-->
<!--                                            <span v-if="form.giveRedEnvelopeAmountMax != null && parseFloat(form.giveRedEnvelopeAmountMax) >0">{{t('addTopic.130',{'p1': form.giveRedEnvelopeAmountMax})}}</span>	-->
<!--                                            &lt;!&ndash; 用户共有金额 {{form.deposit}} 元 &ndash;&gt;-->
<!--                                            <span>{{t('addTopic.140',{'p1': form.deposit})}}</span>-->
<!--                                        </span>-->
<!--                                    </div>-->
<!--                                </div>-->

<!--                                <div class="van-cell cell-field"  v-if="form.giveRedEnvelope_type == 30">-->
<!--                                    <div class="van-cell__title van-field__label cell-field-title">-->
<!--                                        <span>{{t('addTopic.150')}}</span> &lt;!&ndash; 单个红包金额 &ndash;&gt;-->
<!--                                    </div>-->
<!--                                    <div class="van-cell__value">-->
<!--                                        <span>-->
<!--                                            &lt;!&ndash; placeholder="输入金额" &ndash;&gt;-->
<!--                                            <van-field v-model.trim="form.giveRedEnvelope_singleAmount" :placeholder="t('addTopic.110')" @input="singleAmountCalculate()" maxlength="12"  class="cell-field-value" :formatter="amountFormat" clearable :error-message="error.singleAmount"/>-->
<!--                                        </span>-->
<!--                                    </div>-->
<!--                                    <div class="van-cell__label cell-field-label">-->
<!--                                        <span class="help-text">-->
<!--                                            &lt;!&ndash; 合计总金额不能少于 {{form.giveRedEnvelopeAmountMin}} 元； &ndash;&gt;-->
<!--                                            <span v-if="parseFloat(form.giveRedEnvelopeAmountMin) >0">{{t('addTopic.120',{'p1': form.giveRedEnvelopeAmountMin})}}</span>	-->
<!--                                            &lt;!&ndash; 合计总金额不能超过 {{form.giveRedEnvelopeAmountMax}} 元；&ndash;&gt;-->
<!--                                            <span v-if="form.giveRedEnvelopeAmountMax != null && parseFloat(form.giveRedEnvelopeAmountMax) >0">{{t('addTopic.130',{'p1': form.giveRedEnvelopeAmountMax})}}</span>	-->
<!--                                            &lt;!&ndash; 用户共有金额 {{form.deposit}} 元 &ndash;&gt;-->
<!--                                            <span>{{t('addTopic.140',{'p1': form.deposit})}}</span>-->
<!--                                        </span>-->
<!--                                    </div>-->
<!--                                </div>-->
<!--                                &lt;!&ndash; label="红包数量" placeholder="输入数量" &ndash;&gt;-->
<!--                                <van-field v-model.trim="form.giveRedEnvelope_giveQuantity" type="digit" :label="t('addTopic.160')" :placeholder="t('addTopic.170')" @input="singleAmountCalculate()" maxlength="8" clearable :error-message="error.giveQuantity"/>-->
<!--                                &lt;!&ndash; label="合计总金额" &ndash;&gt;-->
<!--                                <van-field :label="t('addTopic.180')" center :error-message="error.redEnvelopeLimit">-->
<!--                                    <template #input>-->
<!--                                        {{form.giveRedEnvelope_totalAmountView}}-->
<!--                                    </template>-->
<!--                                </van-field>-->
<!--                            </div>-->

                            <van-field center :error-message="error.content">
                                <template #input>
                                    <div v-show="!form.isMarkdown" style="width: 100%;" :style="form.editorIconCount < 10 ? 'margin-left:0px;' : ''">
                                        <van-sticky :z-index="1" >
                                            <div ref="topicContentEditorToolbarRef" class="editor-toolbar" style="padding-top: 5px;margin-left: -12px;"></div>
                                        </van-sticky>
                                        <div :editorId="'addTopic'" ref="topicContentEditorTextRef"  class="editor-text" style="min-height: 320px;"></div>
                                    </div>
                                    <div v-if="form.isMarkdown" style="width: 100%;" >
                                        <!-- placeholder="请输入内容..." -->
                                        <Editor mode="tab" :editorId="'addTopic'" :value="form.markdownContent" :plugins="form.addTopicEditorPlugin" :locale="setMarkdownLanguage()" :editorConfig="markdownEditorConfig" :sanitize="addTopicSanitize" :placeholder="t('addTopic.190')" @change="handleMarkdownChange"/>
                                    </div>
                                </template>
                            </van-field>

                            <!-- label="验证码" placeholder="请输入验证码" -->
                            <van-field v-model="form.captchaValue" v-if="form.showCaptcha" class="captcha-item captcha-input-left" :label="t('common.70')" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
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

                    <div class="resultModule" v-if="!form.allowTopic">
                        <div class="result">
                            <div class="result-icon">
                                <van-icon name="warning" class="icon-warning" size="64px"/>
                            </div>
                            <div class="result-title">
                                <p>{{t('addTopic.200')}}</p><!-- 发表话题功能已关闭 -->
                            </div>
                        </div>
                    </div>

                </div>
                <div class="addTopicModule" v-if="store_systemUser == null || Object.keys(store_systemUser).length ==0">
                    <van-skeleton :row="3" class="skeleton"/>
                </div>
            </van-pull-refresh>
            <van-popup v-model:show="form.popup_mentionUser" class="markdownEditorMentionPopup" :lock-scroll="false" position="bottom" :close-on-popstate="true" close-icon="close" :round="true" :closeable="true"  @closed="closeMentionUser()">
                <van-form ref="formMentionRef" class="form-mention-container">
                    <!-- placeholder="用户账号或呢称" -->
                    <van-search v-model.trim="form.keyword" show-action maxlength="30" clearable :placeholder="t('addTopic.210')" @search="searchMentionUser">
                        <template #action>
                            <!-- 搜索 -->
                            <van-button size="small" type="primary" @click="searchMentionUser">{{t('addTopic.220')}}</van-button>
                        </template>
                    </van-search>

                </van-form>
                <div class="container">
                    <div class="mentionUserItem" v-for="mentionUser in form.mentionUserList" @click="selectMentionUser(mentionUser)">
                        <div class="left-layout">
                            <div class="avatarBox">

                                <img v-if="mentionUser.avatarName != null" :src="mentionUser.avatarPath+'100x100/'+mentionUser.avatarName" class="img">
                                <img v-if="mentionUser.avatarName == null" :src="mentionUser.avatar" width="48" height="48" class="img"/>

                            </div>
                        </div>
                        <div class="right-layout">
                            <span class="userInfo">{{mentionUser.nickname != null && mentionUser.nickname != '' ?mentionUser.nickname : mentionUser.account}}</span>
                        </div>
                    </div>
                </div>
            </van-popup>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { getCurrentInstance, ComponentInternalInstance, reactive, onMounted, ref, onUnmounted, nextTick, watchEffect, onActivated, h, App} from 'vue'
    import { onBeforeRouteUpdate, useRouter } from 'vue-router'
    import { AxiosResponse } from 'axios'
    import { calc_add, calc_multiply, getPageBasePath,processErrorInfo} from '@/utils/tool';
    import { Tag, User } from '@/types';
    import pinia from '@/store/store'
    import {useStore} from '@/store'
    import { storeToRefs } from 'pinia';
    import { Notify } from 'vant'
    import { onBack } from '@/utils/history'
    import { convertViewportWidth } from '@/utils/px-to-viewport';
    import { createEditor, destroyEditor } from '@/utils/editor';
    import { markdownPlugins,markdownEditorConfig,sanitize, markdownToHtml, setMarkdownLanguage } from '@/utils/markdownEditor';
    import { toggleEditor } from '@/utils/markdownPlugin/plugin-toggle-editor';
    import { help } from '@/utils/markdownPlugin/plugin-help';
    import { emoji } from '@/utils/markdownPlugin/plugin-emoji';
    import { imageUpload } from '@/utils/markdownPlugin/plugin-image-upload';
    import { pasteImageUpload } from '@/utils/markdownPlugin/plugin-paste-image';
    import { fileUpload } from '@/utils/markdownPlugin/plugin-file-upload';
    import { videoUpload } from '@/utils/markdownPlugin/plugin-video-upload';
    import { hideContent } from '@/utils/markdownPlugin/plugin-hide-content';
    import type { BytemdPlugin,BytemdEditorContext } from 'bytemd'
    import { Editor } from '@bytemd/vue-next'
    import { letterAvatar } from '@/utils/letterAvatar';
    import { mention } from '@/utils/markdownPlugin/plugin-mention';
    import { aiPopUp } from '@/components/aiAssistant/aiAssistantTool';
    import { ai } from '@/utils/markdownPlugin/plugin-ai';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const { proxy,appContext } = getCurrentInstance() as ComponentInternalInstance;
    const store = useStore(pinia);
    const router = useRouter();
    const formRef = ref();
    const formMentionRef = ref();
    const topicContentEditorToolbarRef = ref();
    const topicContentEditorTextRef = ref();
    const {title:store_title,keywords:store_keywords,description:store_description,systemUser:store_systemUser} = storeToRefs(store)


    //html页元信息
    watchEffect(() => {
        let titleValue = store_title.value//监听网站标题
        if(titleValue != null && titleValue != ''){
            document.title = t('addTopic.10')+' - ' + titleValue;//发表话题
        }
    }, {
        flush: 'post'//在组件更新后触发，第一次运行需要组件渲染完成才执行
    })

    //Select 选择器选项
    interface OptionsItem {
        value: string;
        label: string;
        disabled: boolean;
    }
    //表单
    const form = reactive({
        tagList:[] as Array<Tag>,//标签
        deposit:'',//用户共有预存款
        allowTopic:true,//是否允许提交话题
        giveRedEnvelopeAmountMin:'',//发红包金额下限
        giveRedEnvelopeAmountMax:'',//发红包金额上限  空为无限制 0则不允许发红包
        userGradeList:[],//用户等级
        availableTag:[] as Array<string>,//话题编辑器允许使用标签
        editorIconCount:0,//富文本框图标数量
        fileSystem:0,//文件存储系统
        supportEditor:10,//支持编辑器
        allowTagIdList:[] as Array<string>,//有提交权限的标签Id

        popup_mentionUser :false,//是否弹出选择提及用户表单
        keyword :'',//关键词
        mentionUserList:[] as Array<User>,//提及用户集合
        mentionUserEditorId:'',//提及用户编辑器Id
        currentMarkdownEditor:{} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        showRedEnvelopeText:false,//显示发红包按钮
        showRedEnvelopeForm:false,//显示发红包表单
        giveRedEnvelope_type:20, //发红包类型
		giveRedEnvelope_totalAmount:'',//红包总金额
		giveRedEnvelope_singleAmount:'',//红包单个金额
		giveRedEnvelope_giveQuantity:'',//红包数量
		giveRedEnvelope_totalAmountView:'0.00',//红包合计总金额

        isAllowLoadTagGroup:true,//是否允许加载标签组
        loading :false,//是否正在从远程获取数据
        options: [] as Array<OptionsItem>,//Select 选择器标签数据

        tagId:'',//标签Id
        tagName:'',//标签名称
        title:'',//标题
        content:'',//内容
        showTagPicker:false,//是否显示标签选项
        markdownContent:'',//markdown内容
        isMarkdown:false,//是否使用markdown编辑器

        showCaptcha:false,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态

        addTopicEditor :{} as any,//添加话题编辑器
		addTopicEditorCreateParameObject :{} as any,//添加话题编辑器的创建参数

        isRefreshing:false,//是否处于下拉加载中状态

        addTopicEditorPlugin:[] as BytemdPlugin[],//添加话题Markdown编辑器插件

    })
    //错误
    const error = reactive({
        tagId:'',//标签Id
        title:'',//标题
        content:'',//内容
        totalAmount:'',//红包总金额
        singleAmount:'',//单个红包金额
		giveQuantity: '',//红包数量
		redEnvelopeLimit: '',//合计总金额
        captchaValue:'',//验证码

        keyword :'',
    })

    //下拉刷新时触发
    const onRefresh = () => {
        form.isRefreshing = false;

        //重置
        form.tagList.length = 0;//标签
        form.deposit = '';//用户共有预存款
        form.allowTopic = true;//是否允许提交话题
        form.giveRedEnvelopeAmountMin = '';//发红包金额下限
        form.giveRedEnvelopeAmountMax = '';//发红包金额上限  空为无限制 0则不允许发红包
        form.userGradeList.length= 0;//用户等级
        form.availableTag.length= 0;//话题编辑器允许使用标签
        form.fileSystem = 0;//文件存储系统
        form.supportEditor= 10;//支持编辑器
        form.allowTagIdList.length= 0,//有提交权限的标签Id

        form.popup_mentionUser =false;//是否弹出选择提及用户表单
        form.keyword ='';//关键词
        form.mentionUserList.length= 0;//提及用户集合
        form.mentionUserEditorId='';//提及用户编辑器Id
        form.currentMarkdownEditor = {} as BytemdEditorContext | undefined,//Markdown编辑器打开‘@提及’弹窗的编辑器对象

        form.showRedEnvelopeText = false;//显示发红包按钮
        form.showRedEnvelopeForm = false;//显示发红包表单
        form.giveRedEnvelope_type = 20; //发红包类型
		form.giveRedEnvelope_totalAmount = '';//红包总金额
		form.giveRedEnvelope_singleAmount = '';//红包单个金额
		form.giveRedEnvelope_giveQuantity = '';//红包数量
		form.giveRedEnvelope_totalAmountView = '0.00';//红包合计总金额

        form.isAllowLoadTagGroup = true;//是否允许加载标签组
        form.loading = false;//是否正在从远程获取数据
        form.options.length = 0;//Select 选择器标签数据

        form.tagId = '';//标签Id
        form.tagName = '';//标签名称
        form.title = '';//标题
        form.content = '';//内容
        form.showTagPicker = false;//是否显示标签选项
        form.markdownContent = '';//markdown内容
        form.isMarkdown =false;//是否使用markdown编辑器

        form.showCaptcha = false;//是否显示验证码
        form.captchaKey =  '';//验证码key
        form.captchaValue =  '';//验证码值
        form.imgUrl =  '';//验证码图片
        form.allowSubmit = false;//提交按钮disabled状态

        form.addTopicEditorPlugin.length = 0;//添加话题Markdown编辑器插件

        if (Object.keys(form.addTopicEditor).length != 0) {//不等于空
            destroyEditor(form.addTopicEditor);
            form.addTopicEditor = {};
        }
		form.addTopicEditorCreateParameObject = {} as any;//添加话题编辑器的创建参数

        init();
    };


    //是否有提交权限的标签
    const isAllowTag = (tagId:string) => {
        for (let i = 0; i < form.allowTagIdList.length; i++){
            if (form.allowTagIdList[i] == tagId){
                return true;
            }
        }
        return false;
    }

    //处理Markdown
    const handleMarkdownChange = (value: string) => {
        form.markdownContent = value;
    }

    //白名单
    const addTopicSanitize = (schema: any) => {
        schema = sanitize(schema);

        if(form.availableTag?.indexOf('embedVideo') != -1){//嵌入视频
            schema.tagNames.push('iframe');
        }

        return schema;
    }


    //处理切换到富文本编辑器
    const handleToggleRichtextEditor = (editorId: string) => {
        form.isMarkdown = false;
        nextTick(()=>{
            if (Object.keys(form.addTopicEditorCreateParameObject).length != 0) {//不等于空
                //创建富文本编辑器
                form.addTopicEditor = createEditor(
                    form.addTopicEditorCreateParameObject.toolbarRef,
                    form.addTopicEditorCreateParameObject.textRef,
                    form.addTopicEditorCreateParameObject.editorIconList,
                    getPageBasePath()+'common/default/',
                    form.addTopicEditorCreateParameObject.uploadPath,
                    form.addTopicEditorCreateParameObject.userGradeList,
                    form.fileSystem,
                    ()=>{
                        handleToggleMarkdownEditor(editorId);
                    },
                    ()=>{
                        mentionPopUp(editorId,undefined)
                    },
                    ()=>{
                        //AI弹窗
                        aiPopUp(proxy,appContext,editorId,form.addTopicEditorCreateParameObject.uploadPath,'file',form.fileSystem,form.isMarkdown,form.addTopicEditor,undefined)
                    }
                );
                form.addTopicEditor.txt.html(form.addTopicEditorCreateParameObject.html);//切换时设置富文本内容
            }
        })


    }

    //处理切换到Markdown编辑器
    const handleToggleMarkdownEditor = (editorId: string) => {
        if (Object.keys(form.addTopicEditor).length != 0) {//不等于空
            form.addTopicEditorCreateParameObject.html = form.addTopicEditor.txt.html();//切换时保存富文本内容
            destroyEditor(form.addTopicEditor);
            form.addTopicEditor = {};
        }
        form.isMarkdown = true;
    }

     //显示、隐藏提及弹窗
     const mentionPopUp = (editorId: string,ctx:BytemdEditorContext| undefined) => {

        form.popup_mentionUser = true;
        form.mentionUserEditorId = editorId;
        form.keyword = "";
        form.mentionUserList.length = 0;
        form.currentMarkdownEditor = ctx;
        error.keyword = "";
    }

    //关闭提及用户弹出框
    const closeMentionUser = () => {
        form.popup_mentionUser = false;
        form.currentMarkdownEditor = undefined;
    }

    //选择提及用户
    const selectMentionUser = (mentionUser:User) => {
        let link = "user/control/home?userName="+mentionUser.userName;
        let text = mentionUser.nickname != null && mentionUser.nickname != '' ? '@'+mentionUser.nickname : '@'+mentionUser.account;

        if(form.isMarkdown){
            form.currentMarkdownEditor?.editor.replaceSelection(`${text}`);
        }else{
            form.addTopicEditor.txt.insertMention(text, link);
        }

        closeMentionUser();
    }


    //搜索提及用户
    const searchMentionUser = () => {
        form.mentionUserList.length = 0
        error.keyword = "";
        if(form.keyword == null || form.keyword.trim() == ''){
            error.keyword = t('addTopic.230');//请输入用户账号或呢称
            return;
        }
        proxy?.$axios({
            url: '/user/control/queryUser',//暂时使用查询提及用户API
            method: 'get',
            params:  {keyword:form.keyword},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                const result: any = response.data;
                if(result != ""){
                    let mentionUser = JSON.parse(result)

                    if(mentionUser != null){
                        let userList = new Array();
                        if(mentionUser.nickname != null && mentionUser.nickname !=''){
                            mentionUser.avatar = letterAvatar(mentionUser.nickname, 48);
                        }else{
                            mentionUser.avatar = letterAvatar(mentionUser.account, 48);
                        }
                        userList.push(mentionUser);

                        form.mentionUserList = userList;
                    }else{
                        error.keyword = t('addTopic.240');//当前用户不存在
                    }
                }
            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }



    //显示标签选项
    const onShowTagPicker = () => {
        form.showTagPicker = true;
        //默认选中第一项
        if(form.tagId == null || form.tagId == ''){
            if(form.options != null && form.options.length >0){
                for(let i=0; i<form.options.length; i++){
                    if(!form.options[i].disabled){
                        form.tagId = form.options[i].value; //标签Id
                        form.tagName= form.options[i].label; //标签名称
                        break;
                    }
                }

            }
        }
    }
    //选择标签
    const onTagChange = (item:OptionsItem) => {
        form.tagId = item.value; //标签Id
        form.tagName= item.label; //标签名称
    };



    //查询标签
    const queryTagList = () => {
        if(!form.isAllowLoadTagGroup){
	        return;
	    }
        form.loading = true;

        proxy?.$axios({
            url: '/allTag',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: Array<Tag>) => {
            if(data != null && data.length >0){
                for(let i=0; i<data.length; i++){
                    let tag = data[i];
                    let obj = {} as OptionsItem;
                    obj.value = tag.id;
                    obj.label = tag.name;
                    obj.disabled = !isAllowTag(tag.id)
                    form.options.push(obj);

                }
                form.tagList = data;
            }
            form.isAllowLoadTagGroup = false;
            form.loading = false;
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }

    //查询发表话题页
    const queryAddTopic = (callback: (() => void)) => {
        //清空error的属性值
        Object.keys(error).map(key => {
            Object.assign(error, {[key] : ''});
        })


        proxy?.$axios({
            url: '/user/queryAddTopic',
            method: 'get',
            params:  {},
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            if(response){
                let data =  response.data;

                form.allowTopic = data.allowTopic;//是否允许提交话题

                if(data.allowTopic){
                    form.deposit = data.deposit;//用户共有预存款
                    form.giveRedEnvelopeAmountMin = data.giveRedEnvelopeAmountMin;//发红包金额下限
                    form.giveRedEnvelopeAmountMax = data.giveRedEnvelopeAmountMax;//发红包金额上限  空为无限制 0则不允许发红包
                    if(data.userGradeList != null && data.userGradeList != ''){
                        form.userGradeList = JSON.parse(data.userGradeList);//JSON转为对象
                    }
                    form.allowTagIdList = data.allowTagIdList;//有提交权限的标签Id
                    if(data.availableTag != null && data.availableTag != ''){
                        let availableTagObject = JSON.parse(data.availableTag);//JSON转为对象

                        let flag = false;
                        if(availableTagObject != null && availableTagObject.length >0){
                            for(let i=0; i< availableTagObject.length; i++){
                                let availableTag = availableTagObject[i];
                                if(availableTag == "hidePassword" || availableTag == "hideComment" ||
                                availableTag == "hideGrade" || availableTag == "hidePoint" || availableTag == "hideAmount"){
                                    availableTagObject.splice(i, 0, 'hide');//在指定索引处插入元素
                                    break;
                                }
                            }
                        }
                        if(data.supportEditor == 30 || data.supportEditor == 40){
                            availableTagObject.push("toggleEditor");
                        }

                        form.availableTag = availableTagObject;//话题编辑器允许使用标签
                    }

                    form.fileSystem = data.fileSystem;//文件存储系统
                    form.supportEditor = data.supportEditor;//支持编辑器 10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先

                    if(data.giveRedEnvelopeAmountMax == null || (data.giveRedEnvelopeAmountMax != null && parseInt(data.giveRedEnvelopeAmountMax) >0)){
                        //显示发红包
                        form.showRedEnvelopeText = true;
                    }

                    if (data.captchaKey != undefined && data.captchaKey != '') {
                        form.showCaptcha = true;
                        form.captchaKey = data.captchaKey;
                        replaceCaptcha();//刷新验证码
                    }

                    if (Object.keys(form.addTopicEditorCreateParameObject).length === 0) {//等于空
                        let uploadPath = "user/control/topic/upload?method=upload";

                        //编辑器图标
                        let editorIconList = new Array();


                        for(let i=0; i<form.availableTag.length; i++){
							let _availableTag = form.availableTag[i];
							if(_availableTag == "code"){//代码
								editorIconList.push("code");
							}else if(_availableTag == "forecolor"){//文字颜色
							//	editorIconList.push("foreColor");
							}else if(_availableTag == "hilitecolor"){//文字背景
							//	editorIconList.push("backColor");
							}else if(_availableTag == "bold"){//粗体
							//	editorIconList.push("bold");
							}else if(_availableTag == "italic"){//斜体
							//	editorIconList.push("italic");
							}else if(_availableTag == "underline"){//下划线
							//	editorIconList.push("underline");
							}else if(_availableTag == "link"){//插入链接
								editorIconList.push("link");
							}else if(_availableTag == "emoticons"){//插入表情
								editorIconList.push("emoticon");
							}else if(_availableTag == "image"){//图片
								editorIconList.push("image");
							}else if(_availableTag == "media"){//视频
								editorIconList.push("video");
							}else if(_availableTag == "embedVideo"){//嵌入视频
								editorIconList.push("embedVideo");
							}else if(_availableTag == "uploadVideo"){//上传视频
								editorIconList.push("uploadVideo");
							}else if(_availableTag == "insertfile"){//文件
								editorIconList.push("file");
							}else if(_availableTag == "hidePassword"){//输入密码可见
								editorIconList.push("hidePassword");
							}else if(_availableTag == "hideComment"){//评论话题可见
								editorIconList.push("hideComment");
							}else if(_availableTag == "hideGrade"){//达到等级可见
								editorIconList.push("hideGrade");
							}else if(_availableTag == "hidePoint"){//积分购买可见
								editorIconList.push("hidePoint");
							}else if(_availableTag == "hideAmount"){//余额购买可见
								editorIconList.push("hideAmount");
							}else if(_availableTag == "mention"){//提及
								editorIconList.push("mention");
							}else if(_availableTag == "ai"){//AI
								editorIconList.push("ai");
							}else if(_availableTag == "toggleEditor"){//切换编辑器
								editorIconList.push("toggleEditor");
							}
						}

                        for(let i=0; i< editorIconList.length; i++){
                            let editorIcon = editorIconList[i];
                            if(editorIcon == "hidePassword" || editorIcon == "hideComment" ||
                                    editorIcon == "hideGrade" || editorIcon == "hidePoint" || editorIcon == "hideAmount"){
                                editorIconList.splice(i, 0, 'hide');//在指定索引处插入元素
                                break;
                            }
                        }
                        if(form.supportEditor == 20 || form.supportEditor == 40){
                            form.isMarkdown = true;
                        }

                        if(form.addTopicEditorPlugin != null && form.addTopicEditorPlugin.length ==0){
                            //添加插件
                            form.addTopicEditorPlugin.push(...markdownPlugins());


                            if(form.supportEditor == 30 || form.supportEditor == 40){//10.仅富文本编辑器 20.仅Markdown编辑器  30.富文本编辑器优先 40.Markdown编辑器优先
                                form.addTopicEditorPlugin.push(
                                    toggleEditor((editorId: string)=>{handleToggleRichtextEditor(editorId)})
                                );
                            }

                            if(editorIconList?.indexOf('hidePassword') != -1
                                || editorIconList?.indexOf('hideComment') != -1
                                || editorIconList?.indexOf('hideGrade') != -1
                                || editorIconList?.indexOf('hidePoint') != -1
                                || editorIconList?.indexOf('hideAmount') != -1
                                ){
                                form.addTopicEditorPlugin.push(
                                    hideContent(editorIconList,form.userGradeList)
                                );
                            }

                            if(editorIconList?.indexOf('uploadVideo') != -1){
                                form.addTopicEditorPlugin.push(
                                    videoUpload("user/control/topic/upload?method=upload","file",form.fileSystem)
                                );
                            }
                            if(editorIconList?.indexOf('image') != -1){
                                form.addTopicEditorPlugin.push(
                                    imageUpload("user/control/topic/upload?method=upload",'file',form.fileSystem)
                                );
                                form.addTopicEditorPlugin.push(
                                    pasteImageUpload("user/control/topic/upload?method=upload",'file',form.fileSystem)
                                );
                            }
                            if(editorIconList?.indexOf('file') != -1){
                                form.addTopicEditorPlugin.push(
                                    fileUpload("user/control/topic/upload?method=upload",'file',form.fileSystem)
                                );
                            }
                            form.addTopicEditorPlugin.push(emoji());
                            if(editorIconList?.indexOf('mention') != -1){
                                form.addTopicEditorPlugin.push(
                                    mention((editorId: string,ctx:BytemdEditorContext)=>{mentionPopUp(editorId,ctx)})
                                );
                            }
                            if(editorIconList?.indexOf('ai') != -1){
                                form.addTopicEditorPlugin.push(
                                    ai((editorId: string,ctx:BytemdEditorContext)=>{aiPopUp(proxy,appContext,editorId,uploadPath,'file',form.fileSystem,form.isMarkdown,undefined,ctx)})
                                );
                            }
                            form.addTopicEditorPlugin.push(
                                help(editorIconList,form.userGradeList)
                            );

                        }

                     //   topicContentEditorToolbarRef.value.innerHTML = "";
                     //   topicContentEditorTextRef.value.innerHTML = "";

                        if(!form.isMarkdown){
                            //创建富文本编辑器
                            form.addTopicEditor = createEditor(topicContentEditorToolbarRef.value,topicContentEditorTextRef.value,editorIconList, getPageBasePath()+'common/default/', uploadPath, form.userGradeList,form.fileSystem,(editorId: string)=>{
                                handleToggleMarkdownEditor(editorId);
                            },
                            (editorId: string)=>{
                                mentionPopUp(editorId,undefined)
                            },
                            (editorId: string)=>{
                                //AI弹窗
                                aiPopUp(proxy,appContext,editorId,uploadPath,'file',form.fileSystem,form.isMarkdown,form.addTopicEditor,undefined)
                            });
                        }

                        form.addTopicEditorCreateParameObject = {
                            toolbarRef:topicContentEditorToolbarRef.value,
                            textRef:topicContentEditorTextRef.value,
                            editorIconList:editorIconList,
                            uploadPath:uploadPath,
                            userGradeList:form.userGradeList
                        }

                        if(!form.isMarkdown){
                            nextTick(()=>{
                                form.editorIconCount = form.addTopicEditor.toolbarSelector.childElementCount
                            })
                        }

                    }
                     //回调
                    callback();
                }

            }
        })
        .catch((error: any) =>{
            console.log(error);
        });

    }


    //显示/隐藏红包表单层
    const redEnvelopeForm = () => {
        if(form.showRedEnvelopeForm == false){
            form.showRedEnvelopeForm = true;

        }else{
            form.showRedEnvelopeForm = false;
        }
        selectRedEnvelopeType();
    }

    //选择红包类型
    const selectRedEnvelopeType = () => {
        if(form.giveRedEnvelope_type == 20){//随机
            totalAmountCalculate();

        }else if(form.giveRedEnvelope_type == 30){//固定
            singleAmountCalculate();
        }


    }

    //金额格式化
    const amountFormat = (value:string):string => {
       return value = clearNoNum(value);
    }


    //总金额计算
    const totalAmountCalculate = () => {
        //红包总金额输入限制
        form.giveRedEnvelope_totalAmount = clearNoNum(form.giveRedEnvelope_totalAmount);


        if(form.giveRedEnvelope_type == 20){//随机
            let exp = /(^[1-9]([0-9]+)?(\.[0-9]{1,10})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
            if(exp.test(form.giveRedEnvelope_totalAmount.trim())) {
                let amount = calc_add(form.giveRedEnvelope_totalAmount.trim(), '0', 2);
                form.giveRedEnvelope_totalAmountView = String(amount);
            }else{
                form.giveRedEnvelope_totalAmountView = '0.00';
            }

        }
    }

    //单个红包金额计算
    const singleAmountCalculate = () => {
        //单个红包金额输入限制
        form.giveRedEnvelope_singleAmount = clearNoNum(form.giveRedEnvelope_singleAmount);


        if(form.giveRedEnvelope_type == 30){//固定
            //金额 只允许正数  正则判断最多10位小数
            var exp_singleAmount = /(^[1-9]([0-9]+)?(\.[0-9]{1,10})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
            //数量 正整数
            var exp_giveQuantity = /^\+?[1-9][0-9]*$/;
            if(exp_singleAmount.test(form.giveRedEnvelope_singleAmount.trim()) && exp_giveQuantity.test(form.giveRedEnvelope_giveQuantity.trim())) {
                var amount = calc_multiply(form.giveRedEnvelope_singleAmount.trim(), form.giveRedEnvelope_giveQuantity.trim(), 2);
                form.giveRedEnvelope_totalAmountView = String(amount);
            }else{
                form.giveRedEnvelope_totalAmountView = '0.00';
            }
        }

    }
    //控制只能输入小数点后2位
    const clearNoNum = (val:string) => {
        val = val.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
        val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
        if (val.indexOf(".") < 0 && val != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
            val = parseFloat(val).toString();
        }
        return val;
    }

    //校验标题
    const validatorTitle = (val:any):boolean => {
        if(val == ''){
            error.title = t('addTopic.250')//标题不能为空
            return false;
        }
        error.title = "";
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
                if(form.tagId != null && form.tagId != ''){
                    formData.append('tagId', form.tagId);
                }


                if(form.title != null && form.title != ''){
                    formData.append('title', form.title);
                }

                if(form.isMarkdown){
                    formData.append('isMarkdown', form.isMarkdown.toString());
                    formData.append('markdownContent', form.markdownContent);
                }else{
                    let content =  form.addTopicEditor.txt.html()
                    if(content != null && content !=''){
                        formData.append('content', content);
                    }
                }



                //如果显示红包表单
                if(form.showRedEnvelopeForm){
                    formData.append('type', String(form.giveRedEnvelope_type));//发红包类型
                    formData.append('totalAmount', form.giveRedEnvelope_totalAmount);//红包总金额
                    formData.append('singleAmount', form.giveRedEnvelope_singleAmount);//单个红包金额
                    formData.append('giveQuantity', form.giveRedEnvelope_giveQuantity);//红包数量
                }


                //验证码Key
                formData.append('captchaKey', form.captchaKey);
                //验证码值
                if(form.captchaValue != ''){
                    formData.append('captchaValue', form.captchaValue.trim());
                }

                proxy?.$axios({
                    url: '/user/control/topic/add',
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
                                message: t('addTopic.260'),//提交成功，3秒后自动跳转到话题列表页
                                onClose: ()=>{
                                    router.push({
                                        path : '/index'
                                    });
                                }
                            });

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

                            form.allowSubmit = false;//提交按钮disabled状态
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
        if(to.name == 'addTopic'){
            init();
        }

        next();
    });

    onMounted(() => {
        init();
    })


    //卸载组件实例后调用
    onUnmounted (()=>{
        if (Object.keys(form.addTopicEditor).length != 0) {//不等于空
            destroyEditor(form.addTopicEditor);
            form.addTopicEditor = {};
        }
    })
    //初始化
    const init = () => {
        queryAddTopic(()=>{
            queryTagList();
        });

    }

    //进入keep-alive组件时触发
    onActivated(()=>{
        //后退时修改浏览器标题
        let titleValue = store_title.value
        if(titleValue != null && titleValue != ''){
            document.title = t('addTopic.10')+' - ' + titleValue;//发表话题
        }
    })
</script>
<style scoped lang="scss">
.addTopicModule{
    .redEnvelope-arrow-down{
        :deep(.van-icon-arrow){
            &:before {
                transform: rotate(90deg) translateZ(0);
                transition: transform var(--van-animation-duration-base);
            }
        }
    }
    .redEnvelope-arrow-right{
        :deep(.van-icon-arrow){
            &:before {
                transform: rotate(0deg) translateZ(0);
                transition: transform var(--van-animation-duration-base);
            }
        }
    }

    :deep(.bytemd-editor){
        min-height: 250px !important;
    }
    :deep(.CodeMirror-sizer){
        min-height: 245px !important;
    }
    :deep(.bytemd-preview){
        min-height: 250px !important;
    }

    .form-container{
        :deep(.van-radio--horizontal){
            margin-top: 2px;
            margin-bottom: 8px;
        }
        .help-text{
            font-size: 13px;
            line-height: 22px;
            color: var(--van-gray-5);
        }
    }

    .skeleton{
        margin: 8px;
        padding-top: 16px;
        padding-bottom: 16px;
        background: #fff;
        border-radius: var(--van-border-radius-lg);
    }

}
</style>


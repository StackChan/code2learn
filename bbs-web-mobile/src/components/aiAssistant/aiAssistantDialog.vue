<!-- AI助手 -->
<template>

    <van-popup v-model:show="dialogVisible" safe-area-inset-bottom :close-on-popstate="true" @open="handleOpen" @close="handleClose" position="bottom" closeable close-icon="close" class="custom-top-fixed-popupModule" :style="{ height: '100%'}" round>
        <div ref="popupContainerRef" class="popup-container">
            <div class="scroll" ref="aiChatScrollbar" @scroll="handleScroll" :style="'max-height: '+state.scrollBoxHeight+';'">
                <div class="aiChatModule">
                    <div v-for="aiChatInfo in state.aiChatInfoList">

                        <!--AI发的消息 -->
                        <div class="friend" v-if="aiChatInfo.member == 20">
                            <div class="container">
                                <div :ref="'aiChat_'+aiChatInfo.requestId" class="aiChatContent">
                                    <AiChatTemplate @click-onInsertImage="handleInsert" :html="aiChatInfo.content"></AiChatTemplate>
                                    
                                </div>
                            </div>
                        </div>
                        <!--用户发的消息 -->
                        <div class="self" v-if="aiChatInfo.member == 10">
                            <div class="container">
                                <span>
                                    <em>{{aiChatInfo.content}}</em>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="friend" v-if="state.allowSubmit">
                        <van-skeleton title :row="1"/>
                    </div>
                    <van-empty :description="state.description" v-if="state.aiChatInfoList == null || state.aiChatInfoList.length==0"/>
                </div>
            </div>
            <div class="aiChatForm" ref="aiChatFormRef">
                <van-form ref="formRef" @submit="onSubmit" :scroll-to-error="true" class="form-container" >
                    <!-- placeholder="请输入验证码" -->
                    <van-field v-model="state.captchaValue" name="captchaValue" style="width: 90vw;" v-if="state.showCaptcha" class="captcha-item" :placeholder="t('common.120')" maxlength="4" center clearable :rules="[{ validator: checkCaptchaValue }]" :error-message="error.captchaValue">
                        <template #button>
                            <van-image :src="state.imgUrl" @click="replaceCaptcha" class="captcha-image"/>
                        </template>
                        <template #extra >
                            <!-- 换一幅 -->
                            <span class="captcha-replace" @click="replaceCaptcha">{{t('common.80')}}</span>
                        </template>
                    </van-field>
                    <!-- 我想提问的内容.. -->
                    <van-field v-model="state.prompt" name="prompt" :placeholder="t('aiAssistantDialog.10')" autosize :disabled="!state.allowChat || !state.isPermission" :rows="2" type="textarea" class="prompt-item" :rules="[{ validator: checkPromptValue }]"  :error-message="error.prompt">
                        <template #button>
                            <!-- 提问 -->
                            <van-button block type="primary" native-type="submit" :disabled="!state.allowChat || !state.isPermission">{{t('aiAssistantDialog.20')}}</van-button>
                        </template>
                    </van-field>         
                </van-form>
            </div>
        </div>
    </van-popup>
</template>
              

<script setup lang="ts">
    import { ComponentInternalInstance, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, Ref, ref, toRefs, watch } from "vue";
    import { AxiosResponse } from "axios";
    import { getLanguageClassName, processErrorInfo } from '@/utils/tool';
    import axiosInstance from "@/utils/http";
    import { AiChatInfo, AiChatInsertData, AiProduct} from "@/types";
    import { escapeVueHtml, unescapeHtml } from "@/utils/escape";
    import Prism from "prismjs";  
    import { customMarkdownToHtml } from "@/utils/markdownEditor";
    import { useStore } from "@/store";
    import { storeToRefs } from "pinia";
    import { Dialog } from "vant";
    import { useRect, useWindowSize } from '@vant/use';
    import { useI18n } from 'vue-i18n';
    let { t } = useI18n();
    const props = withDefaults(
        defineProps<{
            show?: boolean; // moadl开关
        }>(),
        {}
    );
    const emits = defineEmits(["insert","close","dialogRef"]);
    const state = reactive({
        dialogVisible: props.show,
        aiProductList: [] as Array<AiProduct>,//AI大模型产品
        selectedInterfaceProduct :0,//当前使用的接口产品
        prompt :'',//提示词
        aiChatInfoList: [] as Array<AiChatInfo>,//对话信息
        chatInfoScrollbarMaxHeight:"calc(100vh - 350px)",
        scrollBoxHeight:'100vh',//滚动框高度  //屏幕高度 - 圆角高度 - 顶部top - 表单高度 - 误差
        beforeScrollBoxHeight:'100vh',//关闭前滚动框高度
        scrollTop:0,//滚动条位置

        allowChat :false,//允许对话
        isPermission :false,//是否有使用权限
        description:" ",

        showCaptcha:false,//是否显示验证码
        captchaKey: '',//验证码key
        captchaValue: '',//验证码值
        imgUrl: '',//验证码图片
        allowSubmit:false,//提交按钮disabled状态
    });
    const error = reactive({
        prompt :'',
        captchaValue:'',//验证码
    });
    const { dialogVisible } = toRefs(state);
    //AI对话信息滚动条
    const aiChatScrollbar = ref()

    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
   
    const store = useStore();
    const {apiUrl:store_apiUrl} = storeToRefs(store)
    const formRef = ref();
    const aiChatFormRef = ref();
    const { width, height } = useWindowSize();
    const popupContainerRef = ref();
    
    /**
     * 插入
     * @param type 0.无 10.纯文本 20.代码 30.图片
     * @param text 
     */
    const handleInsert = (type:number,text:string,language:string) => {
        // 回调
        emits("insert", {type:type, content: text,language:language} as AiChatInsertData);
    };

    //打开
    const handleOpen = () => {
        let oldBoxHeight = state.beforeScrollBoxHeight;
        let oldScrollTop = state.scrollTop;
        setTimeout(function () {//在窗口升起过程中
            state.scrollBoxHeight =  oldBoxHeight;
            aiChatScrollbar.value.scrollTop = oldScrollTop; 
        }, 25);
        setTimeout(function () {//在窗口升起完成后
            setScrollBoxHeight();
            nextTick(()=>{
                aiChatScrollbar.value.scrollTop = oldScrollTop; 
            })
        }, 400);
       
    }
    //关闭
    const handleClose = () => {
        //prismjs工具栏显示按钮
        document.body.setAttribute('data-toolbar-order','copy-to-clipboard')
   
        emits("close", {type:0, content: "" } as AiChatInsertData);//type 0.无 10.纯文本 20.代码 30.图片
        // 关闭弹窗
        //dialogVisible.value = false;

        state.beforeScrollBoxHeight = state.scrollBoxHeight;//关闭前滚动框高度
    };

    //滚动条
    const handleScroll= () => {
        state.scrollTop = aiChatScrollbar.value.scrollTop; 
       
    }

    //窗口Ref
    emits("dialogRef", dialogVisible);
    

    


    //查询AI助手
    const queryAssistant = () => {
        axiosInstance({
            url: '/queryAiAssistant',
            method: 'get',
            params: {
            },
            showLoading: false,//是否显示加载图标
            loadingMask:false,// 是否显示遮罩层
        })
        .then((response: AxiosResponse) => {
            return response?.data
        })
        .then((data: any) => {
            for(let key in data){
                if(key == "aiProductList"){//AI大模型产品
                    state.aiProductList = data[key];

                    if(state.aiProductList != null && state.aiProductList.length >0 && state.selectedInterfaceProduct ==0){
                        state.selectedInterfaceProduct = state.aiProductList[0].interfaceProduct;//默认选择第一个
                    }

                }else if(key == "allowChat"){//是否允许对话
                    state.allowChat = data[key];
                }else if(key == "isPermission"){//是否有使用权限
                    state.isPermission = data[key];
                    if(!state.isPermission){
                        state.description = t('aiAssistantDialog.30');//您没有本功能的使用权限
                    }
                }else if(key == "formCaptcha"){//验证码
                    let formCaptcha = data[key];
                    
                    if (formCaptcha && formCaptcha.showCaptcha == true) {
                        state.showCaptcha = true;
                        state.captchaKey = formCaptcha.captchaKey;
                        replaceCaptcha();//刷新验证码
                    }else{
                        state.showCaptcha = false;
                    }
                }

               

            }
        })
        .catch((error: any) =>{
            console.log(error);
        });
    }

    //校验提示词
    const checkPromptValue = (val:any):boolean => {
        if(state.allowChat){
            if(val == null || val.trim() == ''){
                error.prompt = t('aiAssistantDialog.40') //提问内容不能为空
                return false;
            }
        }
        error.prompt = "";
        return true;
    }

   
    //刷新验证码
    const replaceCaptcha = () => {
        state.imgUrl = store.apiUrl+"captcha/" + state.captchaKey + ".jpg?" + Math.random();
    }
    //校验验证码
    const checkCaptchaValue = (val:any):Promise<boolean | string> => {
        return new Promise((resolve) => {
            if(state.captchaKey != null && state.captchaKey != ''){
                if(val != ''){
                    if (val.length < 4) {
                        error.captchaValue = t('common.20');//验证码长度为4个字符
                        resolve(false);
                    } else { 
                    
                        proxy?.$axios({
                            url: '/userVerification',
                            method: 'get',
                            params:  {
                                captchaKey:state.captchaKey,
                                captchaValue:state.captchaValue
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


    //处理回车
    const handleKeyCode = (event: any) => {
        if (event.keyCode == 13) {
            if (event.ctrlKey) {//ctrl + 回车
                event.preventDefault();
                onSubmit();
            } else {//回车
                state.prompt += '\n';
                
            }
        }
    }

    //提交表单
    const onSubmit = () => {
        state.allowSubmit = true;//提交按钮disabled状态

        const p1 = new Promise<void>((resolve, reject) => {
            // 全局表单验证
            formRef.value.validate().then(() => {
                resolve();
            }).catch(() => {
                state.allowSubmit = false;//提交按钮disabled状态
            })
        });

        Promise.all([p1])
        .then(() => {
            //清空error的属性值
            Object.keys(error).map(key => {
                Object.assign(error, {[key] : ''});
            })
        
            let formData = new FormData();
        
            if(state.selectedInterfaceProduct != null && state.selectedInterfaceProduct >0){
                formData.append('interfaceProduct', String(state.selectedInterfaceProduct)); 
            }
            if(state.prompt != null && state.prompt.trim() != ''){
                formData.append('prompt', state.prompt); 

                let selfChat:AiChatInfo ={
                    content: state.prompt.trim(),//对话内容
                    member: 10//对话成员    10.用户 20.AI
                }
                state.aiChatInfoList.push(selfChat);

                scrollToBottom();//滚动
            }

            //验证码Key
            formData.append('captchaKey', state.captchaKey);
            //验证码值
            if(state.captchaValue != ''){
                formData.append('captchaValue', state.captchaValue.trim());
            }
        
            axiosInstance({
                url: '/user/control/aiAssistant',
                method: 'post',
                data: formData,
                showLoading: false,//是否显示加载图标
                loadingMask:false,// 是否显示遮罩层
                timeout: 0,// 定义请求超时时间
            })
            .then((response: AxiosResponse) => {
                if(response){
                    const result: any = response.data;       
                    if(JSON.parse(result.success)){
                        let chatInfo = result.chatInfo;
                        if(chatInfo.statusCode == null){
                            //处理自定义标签
                            let contentNode = document.createElement("div");
                            contentNode.innerHTML = customMarkdownToHtml(chatInfo.text) as string;
                            bindNode(contentNode);
                            let aiChatInfo:AiChatInfo ={
                                requestId:chatInfo.requestId,
                                content: escapeVueHtml(contentNode.innerHTML),//对话内容
                                member: 20//对话成员    10.用户 20.AI
                            }
                            state.aiChatInfoList.push(aiChatInfo);

                            nextTick(()=>{
                                //渲染代码
                                let aiChatRefValue =  (proxy?.$refs['aiChat_'+aiChatInfo.requestId] as any);
                                
                                if(aiChatRefValue != undefined && aiChatRefValue[0]){
                                    renderBindNode(aiChatRefValue[0]); 
                                }
                                        
                                nextTick(()=> {
                                    setTimeout(function () {
                                        scrollToBottom();//滚动
                                    }, 0);
                                });
                            });


                            //清空表单
                            state.captchaValue = '';
                            state.prompt = "";
                            queryAssistant();
                        }else{
                            //状态码  错误码    错误信息
                            let text = t('aiAssistantDialog.50')+"："+chatInfo.statusCode +"\n  "+t('aiAssistantDialog.60')+"："+chatInfo.errorCode +"\n  "+t('aiAssistantDialog.70')+"："+chatInfo.errorMessage +"  "
                            
                            Dialog.confirm({
                                title: t('aiAssistantDialog.80'),//错误
                                message: text,
                                showCancelButton: false,
                            })
                            .then(() => {
                                // on confirm
                            })
                            .catch(() => {
                                // on cancel
                            });
                        }
                        
                    }else{
                        //处理错误信息
                        processErrorInfo(result.error as Map<string,string> , error,()=>{});
                        
                        if(result.captchaKey != null){
                            state.showCaptcha = true;
                            state.captchaKey = result.captchaKey;
                            replaceCaptcha();
                        }else{
                            state.showCaptcha = false;
                        }
                    }

                    state.allowSubmit = false;//提交按钮disabled状态
                }
            })
            .catch((error: any) =>{
                console.log(error);
                state.allowSubmit = false;//提交按钮disabled状态
            });
        
        }).catch(() => {
            console.log("提交数据错误");
        });
    }


    //递归绑定节点参数
    const bindNode = (node:any) => {
        
        
        //先找到子节点
        let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                
                //处理图片
                if(childNode.nodeName.toLowerCase() == "img" ){
                    let src = childNode.getAttribute("src");
                    
                    childNode.removeAttribute("src");//将原节点src属性删除，防止多请求一次
                
                    let html = '';
                    
                    //html = '<ai-chat-image-view src="'+src+'"></ai-chat-image-view>';
                    //接收来自defineEmits(['insertImage'])的参数      insertImage大写转为横线加小写(@insert-image) 
                    html = '<ai-chat-image-view src="'+src+'" @insert-image="onHandleInsert_renderTemplate"></ai-chat-image-view>';
                



                    let placeholder = document.createElement('div');
                    placeholder.innerHTML = html;
                    let node = placeholder.childNodes[0];
                //	node.setAttribute("src",src);
                    childNode.parentNode.replaceChild(node,childNode);//替换节点	 
                }
                
                //处理表格 (解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题，需要CSS配合)
                if(childNode.nodeName.toLowerCase() == "table" ){
                    childNode.removeAttribute("border");
                    childNode.removeAttribute("bordercolor");
                }

                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){

                                    
                    let firstChildNode = null;//第一个子节点

                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }

                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null && firstChildNode.getAttribute("class").indexOf("language-") != -1){//Markdown代码
                        
                        let class_val = firstChildNode.className;
                        let lan_class = "";
                        let class_arr = new Array();
                        class_arr = class_val.split(' ');
                        
                        for(let k=0; k<class_arr.length; k++){
                            let className = class_arr[k].trim();
                            
                            if(className != null && className != ""){
                                if (className.lastIndexOf('language-', 0) === 0) {
                                    lan_class = className;
                                    break;
                                }
                            }
                        }
                        if(firstChildNode.getAttribute("class").indexOf("language-mermaid") == -1){
                            childNode.className = "line-numbers "+lan_class;
                            childNode.setAttribute("data-prismjs-copy",t('aiAssistantDialog.90'));//复制
                            childNode.setAttribute("data-prismjs-copy-error",t('aiAssistantDialog.100'));//按Ctrl+C复制
                            childNode.setAttribute("data-prismjs-copy-success",t('aiAssistantDialog.110'));//复制成功


                            let nodeHtml = "";

                            //删除code节点
                            let preChildNodeList = childNode.childNodes;
                            for(let p = 0;p < preChildNodeList.length;p++){
                                let preChildNode = preChildNodeList[p];
                                if(preChildNode.nodeName.toLowerCase() == "code" ){
                                    nodeHtml += preChildNode.innerHTML;
                                    preChildNode.parentNode.removeChild(preChildNode);
                                }
                                
                            }
                            
                            let dom = document.createElement('code');
                            dom.className = "line-numbers "+lan_class;
                            dom.innerHTML=nodeHtml;
                            
                        
                            childNode.appendChild(dom);
                        }
                    }
                }
                
                bindNode(childNode);

                
            }
        }
    }

    //递归渲染绑定节点
    const renderBindNode = (node:any) => {	
         //先找到子节点
         let nodeList = node.childNodes;
        for(let i = 0;i < nodeList.length;i++){
            //childNode获取到到的节点包含了各种类型的节点
            //但是我们只需要元素节点  通过nodeType去判断当前的这个节点是不是元素节点
            let childNode = nodeList[i];
            let random = Math.random().toString().slice(2);
            //判断是否是元素节点。如果节点是元素(Element)节点，则 nodeType 属性将返回 1。如果节点是属性(Attr)节点，则 nodeType 属性将返回 2。
            if(childNode.nodeType == 1){
                //处理代码标签
                if(childNode.nodeName.toLowerCase() == "pre" ){
                    let firstChildNode:any = null;//第一个子节点
                    for(let p = 0;p < childNode.childNodes.length;p++){
                        let preChildNode = childNode.childNodes[p];
                        if(preChildNode.nodeName.toLowerCase() == "code" ){
                            firstChildNode = preChildNode;
                            break;
                        }
                    }
                   
                    if(firstChildNode != null && firstChildNode.getAttribute("class")!= null){
                        
                        Prism.highlightAllUnder(childNode);
                    }
                }
                renderBindNode(childNode);
            }
        }
    }

    //代码插入到编辑器插件
    const insertToEditorPlugin = () => {
        //if(document.body.hasAttribute('data-toolbar-order')){
        //    return;
        //}

        //代码插入到编辑器
        Prism.plugins.toolbar.registerButton('insert-to-editor', function (env:any) {
            let element = env.element;

            
            let settings:any = {
                'insert': t('aiAssistantDialog.120'),//插入
                'insert-error': t('aiAssistantDialog.130'),//插入错误
                'insert-success': t('aiAssistantDialog.140'),//已插入!
                'insert-timeout': 5000
            };

            let prefix = 'data-prismjs-';
            for (let key in settings) {
                let attr = prefix + key;
                let startElement = element;
                while (startElement && !startElement.hasAttribute(attr)) {
                    startElement = startElement.parentElement;
                }
                if (startElement) {
                    settings[key] = startElement.getAttribute(attr);
                }
            }


            let linkInsert = document.createElement('button');
            linkInsert.className = 'insert-to-editor-button';
            linkInsert.setAttribute('type', 'button');
            let linkSpan = document.createElement('span');
            linkInsert.appendChild(linkSpan);

            setState('insert');


            registerEditor(linkInsert, {
                getText: function () {
                    return element.textContent;
                },
                getLanguage: function () {
                    return env.language;
                },
                success: function () {
                    setState('insert-success');
                    resetText();
                },
                error: function () {
                    setState('insert-error');
                    resetText();
                }
            });

            return linkInsert;



            
            function resetText() {
                setTimeout(function () { setState('insert'); }, settings['insert-timeout']);
            }

            //@param {"insert" | "insert-error" | "insert-success"} state
            function setState(state:any) {
                linkSpan.textContent = settings[state];
                linkInsert.setAttribute('data-insert-state', state);
            }

            /**
             * 当用户点击给定的元素时，给定的文本将被插入到编辑器。
             *
             * @param {HTMLElement} element
             * @param {CodeInfo} codeInfo
             *
             * @typedef CodeInfo
             * @property {() => string} getText
             * @property {() => void} success
             * @property {(reason: unknown) => void} error
             */
            function registerEditor(element:any, codeInfo:any) {
                element.addEventListener('click', function () {
                    insertCodeToEditor(codeInfo);
                });
            }

            /**
             * 
             * @param codeInfo 插入代码到编辑器
             */
            function insertCodeToEditor(codeInfo:any) {
                handleInsert(20,codeInfo.getText(),codeInfo.getLanguage());
            }

        });
    }


    //设置滚动框高度
    const setScrollBoxHeight = () => {
        nextTick(()=>{
            const rect = useRect(aiChatFormRef);//获取元素的大小及其相对于视口的位置，等价于 Element.getBoundingClientRect。
            const popupContainer = useRect(popupContainerRef);
            state.scrollBoxHeight = "calc(100vh - "+popupContainer.top +"px - " +rect.height+"px  - 5px)";//屏幕高度 - 顶部top - 表单高度 - 误差
        })
    }

    //滚动到最底层
    const scrollToBottom = () => {
        nextTick(()=>{
            //滚动框高度
            let scrollbarHeight = aiChatScrollbar.value.childNodes[0].clientHeight;
           
            aiChatScrollbar.value.scrollTop = scrollbarHeight; 
            state.scrollTop = scrollbarHeight; 
        })
    }

    watch([height], () => {
        setScrollBoxHeight();
    });

    //监听元素高度
    const resizeObserver = new ResizeObserver(entries => {
      // 处理大小变化的回调函数
        for (const entry of entries) {
            //console.log('元素大小已变化', entry.target);
            setScrollBoxHeight();
        }
    });

    onMounted(() => {
        //prismjs工具栏显示按钮
        //document.body.setAttribute('data-toolbar-order','copy-to-clipboard,insert-to-editor')
        //代码插入到编辑器插件
        insertToEditorPlugin();
        
        queryAssistant();

        resizeObserver.observe(aiChatFormRef.value);

        setScrollBoxHeight();
    }) 
    

    onUnmounted(() => {
        resizeObserver.unobserve(aiChatFormRef.value);
    });

</script>
<style scoped lang="scss">
.popup-container{
    margin-top: 15px;
    .scroll{
        overflow-y:auto;
        -webkit-overflow-scrolling: touch;
    }
}
.aiChatModule {
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    background: #fff;
    height: 100%;
    
    .friend{
        margin: 0px 28px 22px 16px;
        position: relative;
        .container{
            position: relative;
            margin-left: 0px;
            margin-right: 30px;
        }
        :deep(.van-skeleton) {
            padding: 0 0;
        }
        .msg-del{
            background: #ececec;
            color: #919191;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -10px;
            right: -10px;
            position: absolute;
            &::before {
                content: "\2716";
            }
            
        }
        .msg-del:hover {
            color: #86909c;
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
        margin: 0px 6px 22px 28px;
        position: relative;
        .container{
            position: relative;
            text-align: initial;
            margin-left: 50px;
            margin-right: 0px;
            span{
                min-height: 40px;
                min-width: 96px;
                font-size: 15px;
                border: 1px #fff solid;
                border-radius: 10px;
                position: relative;
                max-width: 94%;
                background: var(--van-gray-1);
                float: right;
                margin-right: 10px;
                em{
                    font-style: normal;
                    padding: 10px;
                    display: block;
                    line-height: 28px;
                    white-space:normal; word-break:break-all; 
                }
            }
        }
        .msg-del{
            background: #ececec;
            color: #919191;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -10px;
            left: -10px;
            position: absolute;
            &::before {
                content: "\2716";
            }
            
        }
        .msg-del:hover {
            color: #86909c;
        }
        .msg-error{
            background: #fef0f0;
            color: #F56C6C;
            border-radius: 12px;
            line-height: 20px;
            text-align: center;
            height: 20px;
            width: 20px;
            font-size: 15px;
            padding: 1px;
            top: -5px;
            left: -15px;
            position: absolute;
            &::before {
                content: "!";
            }
            
        }
        .msg-error:hover {
            background: #fef0f0;
            color: #c45656;

            
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

:deep(.aiChatContent) {
  //  word-break: break-word;
  //  line-height: 1.75;
    font-weight: 400;
  //  font-size: 14px;
  //  overflow-x: hidden;//此属性和 el-image延迟加载有冲突
    overflow-x: visible;
 //   color: #252933;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.5;
        margin-top: 35px;
        margin-bottom: 10px;
        padding-bottom: 5px;
    }
    h1 {
        font-size: 24px;
        line-height: 38px;
        margin-bottom: 5px;
    }
    h2 {
        font-size: 22px;
        line-height: 34px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebedf0;
    }
    h3 {
        font-size: 20px;
        line-height: 28px;
    }
    h4 {
        font-size: 18px;
        line-height: 26px;
    }
    h5 {
        font-size: 17px;
        line-height: 24px;
    }
    h6 {
        font-size: 16px;
        line-height: 24px;
    }
    p {
        line-height: inherit;
        margin-top: 22px;
        margin-bottom: 22px;
    }
    hr {
        border-top: 1px solid #dcdee0;
        border-bottom: none;
        border-left: none;
        border-right: none;
        margin-top: 32px;
        margin-bottom: 32px;
    }
    code {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
        word-break: break-word;
        border-radius: 2px;
        overflow-x: auto;
        background-color: #fff5f5;
        color: #ff502c;
    //  font-size: 0.87em;
        padding: 0.065em 0.4em;
    }
    a {
        text-decoration: none;
        &:hover, &a:active {
            color: #275b8c;
        }
    }
    
    blockquote {
        color: #969799;
        padding: 1px 23px;
        margin: 22px 0;
        border-left: 4px solid #dcdee0;
        background-color: #f7f8fa;
        &::after {
            display: block;
            content: "";
        }
        &> p {
            margin: 10px 0;
        }
    }
    ol,
    ul {
        padding-left: 28px;
    }
    ol li,
    ul li {
        margin-bottom: 0;
        list-style: inherit;
    }
    ol li .task-list-item,
    ul li .task-list-item {
        list-style: none;
    }
    ol li .task-list-item ul,
    ol li .task-list-item ol,
    ul li .task-list-item ul,
    ul li .task-list-item ol {
        margin-top: 0;
    }
    ol ul,
    ol ol,
    ul ul,
    ul ol {
        margin-top: 3px;
    }
    ol li {
        padding-left: 6px;
    }
    .contains-task-list {
        padding-left: 0;
    }
    .task-list-item {
        list-style: none;
    }
    .task-list-item-checkbox{
        width: 16px;
        height: 16px;
        position: relative;
        top: -1px;
    }

    color:var(--van-gray-8);
    font-size:16px; 
    line-height:1.75; 
    word-wrap:break-word;
    a{
        color: var(--van-blue);
        font-size:16px;
    }
    i {
        font-style:normal;
    }
    //自动换行
    pre{
        white-space:pre-wrap;
    }
    
    ol{
        list-style: decimal;
    }
    ol li{
        list-style-type:decimal;
        list-style-position:inside;
    }
    ul{
        list-style: disc;
    }
    // ul li{
        //   list-style-type:disc;
    //  }
    .task-list-item {
        list-style-type:none;
    }
    p{
        font-size:16px;
        word-wrap:break-word
    }
    code[class*="language-"]{
        padding: 0 0;
        background-color: transparent;
    }
    pre code{/*连续字母数字换行*/
        word-break: break-all;
    }
    iframe{
        width:100%; height: 300px;padding:10px 0px; 
    }
    video{
        width:100%; height: 300px;padding:10px 0px; outline:none;
    }
    /** 解决Chrome内核浏览器DPI缩放比例高于100%时部分边框变粗问题   本方案需删除table样式 border="1" bordercolor="#000000" */
    table {
        border-collapse: separate; 
        border-spacing: 0; 
        border-top: 1px solid var(--van-gray-3);
        border-left: 1px solid var(--van-gray-3);
        th {
            font-weight: 600
        }
        th, td {
            border-right: 1px solid var(--van-gray-3);
            border-bottom: 1px solid var(--van-gray-3);
            padding: 6px 13px
        }
        tr {
            background-color: #fff;
            border-top: 1px solid var(--van-gray-3);
            &:nth-child(2n) {
                background-color: var(--van-gray-1);
            }
        }
    }
    ol{
        li{ 
            list-style-type:decimal;
            list-style-position:inside;
        }
    }
    ul{
        li{ 
            margin-left:20px;
            list-style-type:disc;
        }
    }
}

@media (max-width: 720px) {
    .aiChatContent h1 {
      font-size: 24px;
    }
    .aiChatContent h2 {
      font-size: 20px;
    }
    .aiChatContent h3 {
      font-size: 18px;
    }
}

.aiChatForm{
     position: fixed;
     bottom: 0px;
     width: 100%;
    .form-container{
        :deep(.prompt-item){
            .van-field__control{
                padding: 10px;
                background-color: var(--van-gray-1);
                overflow:hidden;//让输入框触摸可以滑动
            }
            
            &:after{
                border-bottom: 1px solid transparent;
            }

            //撑满整个div高度的按钮
            .van-field__body{
                justify-content:flex-start;align-items: stretch;
            }
            .van-button{
                height: 100%;
            }
        }
        :deep(.captcha-item){
            
            .van-field__control{
                background-color: var(--van-gray-1);
            }
            .van-field__control{
                padding: 10px;
                border-radius: 3px;
            }
            &:after{
                border-bottom: 1px solid transparent;
            }
        }
    }
 }
</style>

  
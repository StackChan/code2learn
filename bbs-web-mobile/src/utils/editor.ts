import { UserGrade } from "@/types";
import pinia from '@/store/store'
import {useStore} from '@/store'
import { AxiosResponse } from "axios";
import axiosInstance from "./http";
import { Notify, Toast } from "vant";
import { RichtextEditorEmojiPicker } from "@/components";
import { createApp } from "vue";
import "../../public/common/default/pc/js/wangeditor/custom-wangEditor.css";// 富文本编辑器
import "../../public/common/default/pc/js/wangeditor/wangEditor.min.js";// 富文本编辑器
//import "../../public/common/default/pc/js/wangeditor/wangEditor.js";// 富文本编辑器
import { storeToRefs } from "pinia";



const store = useStore(pinia);
//const {systemUser,baseURI,fileStorageSystem,supportAccessDevice,weixin_oa_appid,userInfoVersion} = storeToRefs(store)

const {currentLanguage:store_currentLanguage} = storeToRefs(store);
declare var window : any;


/**
 * 创建富文本编辑器
 * @param editorToolbarRef 菜单框对象
 * @param editorTextRef 文本框对象
 * @param menus 允许使用的标签 ['foreColor', 'bold']
 * @param emojiPath 表情路径 使用kindeditor表情目录下的文件
 * @param uploadPath 上传文件路径  例如control/topic/manage?method=upload
 * @param userGradeList 会员等级
 * @param fileStorageSystem 使用的文件存储系统
 * @param toggleEditorCcallback 切换编辑器回调
 * @param mentionCallback 提及回调
 * @param aiCallback AI助手回调
 */
export function createEditor(editorToolbarRef:any,editorTextRef:any, menus:Array<string>,emojiPath:string, uploadPath:string, userGradeList:Array<UserGrade> | null,fileStorageSystem:number,toggleEditorCcallback:(id: string) => void,mentionCallback:(id: string) => void,aiCallback:(id: string) => void) {

    let baseURL = store.apiUrl;//后端地址

	if(baseURL == null || baseURL == ''){
		return {};
	}
    let E = window.wangEditor;

    let editor = new E(editorToolbarRef,editorTextRef);
    /**
    editor.customConfig.menus = [
							  //   'head',  // 标题
							     'bold',  // 粗体
							     'italic',  // 斜体
							     'underline',  // 下划线
							     'strikeThrough',  // 删除线
							 //    'foreColor',  // 文字颜色
							 //    'backColor',  // 背景颜色
							     'link',  // 插入链接
							//     'list',  // 列表
							//     'justify',  // 对齐方式
							//     'quote',  // 引用
							     'emoticon',  // 表情
							     'image',  // 插入图片
							 //    'table',  // 表格
							 //    'video',  // 插入视频
							 //    'code',  // 插入代码
							  //   'undo',  // 撤销
							 //   'redo'  // 重复
							     'hide',  // 插入隐藏栏
							     ];**/


    editor.customConfig.menus = menus;
    editor.customConfig.uploadImgServer = uploadPath;
    editor.customConfig.onchange = function (html:any) {
		//Vue.set(self, param, html);
    };
    //等级
    editor.customConfig.userGradeList=userGradeList;

	editor.customConfig.pasteFilterStyle = true;//过滤掉复制文本的样式（已修改原始代码）

	let lang = "en";//en， zh-CN, zh-TW
	if(store_currentLanguage.value == 'zh'){//语言 zh,en
		lang = "zh-CN";
	}
	if(lang == "en"){
		//多语言
		editor.customConfig.lang = {
			'设置标题': 'Title',
			'正文': 'Body',
			'链接文字': 'Link text',
			'链接': 'Link',
			'上传图片': 'Upload image',
			'编辑图片': 'Edit image',
			'删除图片': 'Delete image',
			'最大宽度': 'Maximum width',
			'插入表格': 'Insert table',
			'编辑表格': 'Edit table',
			'插入图片错误': 'Error inserting image',
			'请输入密码': 'Please enter your password',
			'请选择等级': 'Please select your grade',
			'请输入大于0的数字': 'Please enter a number greater than 0',
			'请输入大于0的金额': 'Please enter an amount greater than 0',
			'请输入数字类型': 'Please enter a numeric type',
			'上传': 'Upload',
			'创建': 'Create',
			'插入代码': 'Insert code',
			'插入文件': 'Insert file',
			'文件说明': 'File description',
			'选择文件': 'Select file',
			'插入': 'Insert',
			'其它': 'Other',
			'文件': ' File',
			'视频': ' Video',
			'格式如': 'Format such as',
			'隐藏': 'Hide',
			'输入密码可见': 'Visible after entering your password',
			'回复话题可见': 'Visible after replying to a topic',
			'达到等级可见': 'Visible after reaching a level',
			'积分购买可见': 'Visible after points purchase',
			'余额购买可见': 'Visible after balance purchase',
			'密码': 'Password',
			'等级达到': 'Visible when level reaches ',
			'以上可见': ' or above',
			'需要支付 ¥': 'Need to pay ¥',
			'元费用可见': 'to see',
			'需要支付': 'Need to pay ',
			'积分可见': ' points to see',
			'修改': 'Edit',
			'删除': 'Delete',


			// 还可自定添加更多
		}
	}

    // 编辑区域的 z-index
    editor.customConfig.zIndex= 0;
//    editor.customConfig.uploadImgHeaders = {
 //   	'X-Requested-With': 'XMLHttpRequest'
 //   };


	/**
    //使用kindeditor表情目录下的文件

    let emoticonList_1 = new Array();
    for(let i=0; i<35; i++){
    	let o:any =new Object();
    	o.alt = '';
    	o.width = '32px';
    	o.height = '32px';
    	o.src = emojiPath+'pc/js/kindeditor/plugins/emoticons/twemoji/'+i+'.svg';
    	emoticonList_1.push(o);
    }
    let emoticonList_2 = new Array();
    for(let i=35; i<70; i++){
    	let o:any =new Object();
    	o.alt = '';
    	o.width = '32px';
    	o.height = '32px';
    	o.src = emojiPath+'pc/js/kindeditor/plugins/emoticons/twemoji/'+i+'.svg';
    	emoticonList_2.push(o);
    }
    let emoticonList_3 = new Array();
    for(let i=70; i<105; i++){
    	let o:any=new Object();
    	o.alt = '';
    	o.width = '32px';
    	o.height = '32px';
    	o.src = emojiPath+'pc/js/kindeditor/plugins/emoticons/twemoji/'+i+'.svg';
    	emoticonList_3.push(o);
    }
    let emoticonList_4 = new Array();
    for(let i=105; i<140; i++){
    	let o:any=new Object();
    	o.alt = '';
    	o.width = '32px';
    	o.height = '32px';
    	o.src = emojiPath+'pc/js/kindeditor/plugins/emoticons/twemoji/'+i+'.svg';
    	emoticonList_4.push(o);
    }
    let emoticonList_5 = new Array();
    for(let i=140; i<152; i++){
    	let o:any=new Object();
    	o.alt = '';
    	o.width = '32px';
    	o.height = '32px';
    	o.src = emojiPath+'pc/js/kindeditor/plugins/emoticons/twemoji/'+i+'.svg';
    	emoticonList_5.push(o);
    }
    // 表情面板可以有多个 tab ，因此要配置成一个数组。数组每个元素代表一个 tab 的配置
    editor.customConfig.emotions = [
        {
            // tab 的标题
            title: '表情1',
            // type -> 'emoji' / 'image'
            type: 'image',
            // content -> 数组
            content: emoticonList_1
        },
        {
            // tab 的标题
            title: '表情2',
            // type -> 'emoji' / 'image'
            type: 'image',
            // content -> 数组
            content: emoticonList_2
        },
        {
            // tab 的标题
            title: '表情3',
            // type -> 'emoji' / 'image'
            type: 'image',
            // content -> 数组
            content: emoticonList_3
        },
        {
            // tab 的标题
            title: '表情4',
            // type -> 'emoji' / 'image'
            type: 'image',
            // content -> 数组
            content: emoticonList_4
        },
        {
            // tab 的标题
            title: '表情5',
            // type -> 'emoji' / 'image'
            type: 'image',
            // content -> 数组
            content: emoticonList_5
        }
    ]**/



    //后台代码接收文件的字段名称
    editor.customConfig.uploadFileName = "file";
    //上传图片大小,默认小于5M(5 * 1024 * 1024)
    editor.customConfig.uploadImgMaxSize = 200 * 1024 * 1024;

    //自定义 timeout 时间 默认的 timeout 时间是 10 秒钟
    editor.customConfig.uploadImgTimeout = 30000;
	// 隐藏“网络图片”tab
    editor.customConfig.showLinkImg = false;


    //图片上传
    editor.customConfig.customUploadImg = function (files:any, insert:any) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法

    	editorCustomUpload(files, insert,editor.customConfig.uploadImgServer,editor.customConfig.uploadFileName,"image",fileStorageSystem);

    }

    //文件上传
    editor.customConfig.customUploadFile = function (files:any, insert:any) {
    	// files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法


    	editorCustomUpload(files, insert,editor.customConfig.uploadImgServer,editor.customConfig.uploadFileName,"file",fileStorageSystem);


    },
    //视频上传
    editor.customConfig.customUploadVideo = function (files:any, insert:any) {
    	// files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法

    	editorCustomUpload(files, insert,editor.customConfig.uploadImgServer,editor.customConfig.uploadFileName,"media",fileStorageSystem);




    },

	//切换编辑器
	editor.customConfig.customToggleEditor = function () {
		toggleEditorCcallback(editorTextRef.getAttribute('editorId'));
	}

	//@提及
	editor.customConfig.customMention = function () {
		mentionCallback(editorTextRef.getAttribute('editorId'));
	}

	//AI助手
	editor.customConfig.customAI = function () {
		aiCallback(editorTextRef.getAttribute('editorId'));
	}


	//表情
	editor.customConfig.customEmoticon = function () {

		createRichtextEditorEmojiPicker(editor,emojiPath);

	}

	//提示
	editor.customConfig.tip = function (message:string) {
		Toast({
			message: message,//文本内容，支持通过\n换行
			duration:0,//展示时长(ms)，值为 0 时，toast 不会消失
			overlay: true,//是否显示背景遮罩层
			closeOnClickOverlay: true,//是否在点击遮罩层后关闭
		});
	}

    /**
    editor.customConfig.uploadImgHooks = {
	    // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
	    // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
	    customInsert: function (insertImg, result, editor) {
	        // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
	        // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
	    	if(result.error ==0){
	    		// 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
		        var url = result.url;
		        insertImg(url)
	    		// result 必须是一个 JSON 格式字符串！！！否则报错
	    	}else{
	    		//弹出提示内容
				Vue.$messagebox('错误', result.message);
	    	}
	    },

	    error: function (xhr, editor) {
	        // 图片上传出错时触发
	        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
	    	console.log(xhr.status+"  错误  "+xhr.responseText);

	    	if(xhr.status == 508){
				//设置登录用户
				store.commit('setSystemUserId', '');
				store.commit('setSystemUserName', '');

			}

			//关闭网站提示参数
			if(xhr.status == 503){
				//弹出提示内容
				Vue.$messagebox('系统维护', xhr.responseText);

			}

			//请求完成后回调函数 (请求成功或失败时均调用)
			if (xhr.getResponseHeader("jumpPath") != null && xhr.getResponseHeader("jumpPath") != "") {
				//session登陆超时登陆页面响应http头
				//收到未登录标记，执行登录页面跳转
				router.push({
					path : "/" + xhr.getResponseHeader("jumpPath")
				});
			}

	    },
    };**/
    editor.create();

	return editor;
}

//销毁富文本编辑器
export function destroyEditor(editor:any) {
    let toolbarDom = (document.getElementById(editor.toolbarElemId) as any);


	if(toolbarDom != null &&  toolbarDom.childNodes.length >0){
		for (let i = toolbarDom.childNodes.length - 1; i >= 0; i--) { // 倒序
			toolbarDom.removeChild(toolbarDom.childNodes[i]);
		}
	}

    let textDom = (document.getElementById(editor.textElemId) as any);

	if(textDom != null){
		let parentTextDom = textDom.parentNode;
		for (let i = parentTextDom.childNodes.length - 1; i >= 0; i--) { // 倒序
			parentTextDom.removeChild(parentTextDom.childNodes[i]);
		}
	}
    editor = null;
}


//富文本自定义上传  uploadImgServer：editor.customConfig.uploadImgServer  uploadFileName：editor.customConfig.uploadFileName  dir：image、file、media
function editorCustomUpload(files:any, insert:any,uploadImgServer:any,uploadFileName:any,dir:any,fileStorageSystem:number) {


    if(fileStorageSystem == 10){//10.SeaweedFS

		let fileServer = uploadImgServer;

		if (fileServer.indexOf('?') > 0) {
			fileServer += '&';
        } else {
        	fileServer += '?';
        }
		fileServer +=  'dir='+dir;
        Array.prototype.forEach.call(files, function(file) {
       // files.forEach(function(file) {
        	fileServer +=  '&fileName='+encodeURIComponent(file.name);

			axiosInstance({
				url: fileServer,
				method: 'post',
				showLoading: false,//是否显示加载图标
				loadingMask:false,// 是否显示遮罩层
			})
			.then((response: AxiosResponse) => {
				const result: any = response.data;
				if(result != ""){
					let resultData = JSON.parse(result);
					if(resultData.error ==0){


						let signingUrl = resultData.url;


						let beforeUrl = signingUrl.substring(0,signingUrl.indexOf("?"));
						//URL参数部分
						let urlParam = signingUrl.substring(signingUrl.indexOf("?")+1,signingUrl.length);

						let newFileName = "";
						//获取提交的参数
						let data = new FormData();
						let urlParamArr = urlParam.split("&");
						for(let i=0;i<urlParamArr.length;i++){
							let paramArr = urlParamArr[i].split("=");
							data.append(paramArr[0], decodeURIComponent(paramArr[1]));
							if(paramArr[0] == "key"){
								newFileName = decodeURIComponent(paramArr[1]);
							}
						}
						data.append("file", file);
						axiosInstance({
							url: beforeUrl,
							method: 'post',
							data: data,
							showLoading: false,//是否显示加载图标
							loadingMask:false,// 是否显示遮罩层
							timeout: 0,// 定义请求超时时间
							isCorsDefaultHeaders:true,//仅提交CORS默认允许的响应头
						})
						.then((response: AxiosResponse) => {
							if(response){
								if(response.status == 200){
									const result: any = response.data;
									let url = beforeUrl+newFileName;

									let title = file.name;

									// 上传代码返回结果之后，将文件插入到编辑器中
									insert(url,title);
								}
							}
						}).catch((error: any) =>{
							console.log(error);
						});

					}else{
						//弹出提示内容
						Notify({
							type: 'danger',
							message: resultData.message
						});
					}
				}

			}).catch((error: any) =>{
				console.log(error);
			});
    	});
	}else if(fileStorageSystem == 20){//20.MinIO
		let fileServer = uploadImgServer;
		if (fileServer.indexOf('?') > 0) {
			fileServer += '&';
        } else {
        	fileServer += '?';
        }
		fileServer +=  'dir='+dir;


        Array.prototype.forEach.call(files, function(file) {
       // files.forEach(function(file) {
        	fileServer +=  '&fileName='+encodeURIComponent(file.name);


			axiosInstance({
				url : fileServer,
				method: 'post',
				showLoading: false,//是否显示加载图标
				loadingMask:false,// 是否显示遮罩层
			})
			.then((response: AxiosResponse) => {
				const result: any = response.data;
				if(result != ""){
					let resultData = JSON.parse(result);
					if(resultData.error ==0){

						let signingUrl = resultData.url;


						let beforeUrl = signingUrl.substring(0,signingUrl.indexOf("?"));
						//URL参数部分
						let urlParam = signingUrl.substring(signingUrl.indexOf("?")+1,signingUrl.length);

						let newFileName = "";
						//获取提交的参数
						let data = new FormData();
						let urlParamArr = urlParam.split("&");
						for(let i=0;i<urlParamArr.length;i++){
							let paramArr = urlParamArr[i].split("=");
							data.append(paramArr[0], decodeURIComponent(paramArr[1]));
							if(paramArr[0] == "key"){
								newFileName = decodeURIComponent(paramArr[1]);
							}
						}
						data.append("file", file);

						axiosInstance({
							url: beforeUrl,
							method: 'post',
							data: data,
							showLoading: false,//是否显示加载图标
							loadingMask:false,// 是否显示遮罩层
							timeout: 0,// 定义请求超时时间
							isCorsDefaultHeaders:true,//仅提交CORS默认允许的响应头
						})
						.then((response: AxiosResponse) => {
							if(response){
								if(response.status == 200){
									const result: any = response.data;
									let url = beforeUrl+newFileName;

    			    				let title = file.name;

    							    // 上传代码返回结果之后，将文件插入到编辑器中
    							    insert(url,title);
								}
							}
						}).catch((error: any) =>{
							console.log(error);
						});
					}else{
						//弹出提示内容
						Notify({
							type: 'danger',
							message: resultData.message
						});
					}
				}

			}).catch((error: any) =>{
				console.log(error);
			});
    	});
	}else if(fileStorageSystem == 30){//30.阿里云OSS
		let fileServer = uploadImgServer;
		if (fileServer.indexOf('?') > 0) {
			fileServer += '&';
        } else {
        	fileServer += '?';
        }
		fileServer +=  'dir='+dir;
        Array.prototype.forEach.call(files, function(file) {
       // files.forEach(function(file) {
        	fileServer +=  '&fileName='+encodeURIComponent(file.name);
			axiosInstance({
				url : fileServer,
				method: 'post',
				showLoading: false,//是否显示加载图标
				loadingMask:false,// 是否显示遮罩层
			})
			.then((response: AxiosResponse) => {
				const result: any = response.data;
				if(result != ""){
					let resultData = JSON.parse(result);
					if(resultData.error ==0){

						let signingUrl = resultData.url;


						let beforeUrl = signingUrl.substring(0,signingUrl.indexOf("?"));
						//URL参数部分
						let urlParam = signingUrl.substring(signingUrl.indexOf("?")+1,signingUrl.length);

						let newFileName = "";
						//获取提交的参数
						let data = new FormData();
						let urlParamArr = urlParam.split("&");
						for(let i=0;i<urlParamArr.length;i++){
							let paramArr = urlParamArr[i].split("=");
							data.append(paramArr[0], decodeURIComponent(paramArr[1]));
							if(paramArr[0] == "key"){
								newFileName = decodeURIComponent(paramArr[1]);
							}
						}
						data.append("file", file);


						axiosInstance({
							url: beforeUrl,
							method: 'post',
							data: data,
							showLoading: false,//是否显示加载图标
							loadingMask:false,// 是否显示遮罩层
							timeout: 0,// 定义请求超时时间
							isCorsDefaultHeaders:true,//仅提交CORS默认允许的响应头
						})
						.then((response: AxiosResponse) => {
							if(response){
								if(response.status == 200){
									let url = beforeUrl+newFileName;

									let title = file.name;

									// 上传代码返回结果之后，将文件插入到编辑器中
									insert(url,title);
								}
							}
						}).catch((error: any) =>{
							console.log(error);
						});
					}else{
						//弹出提示内容
						Notify({
							type: 'danger',
							message: resultData.message
						});
					}
				}

			}).catch((error: any) =>{
				console.log(error);
			});

    	});
	}else{//本地
		Array.prototype.forEach.call(files, function(file) {
    	//files.forEach(function(file) {
    		let formData = new FormData();
    		formData.append(uploadFileName, file);//editor.customConfig.uploadFileName
    		//令牌
    		//	formData.append("token", store.state.token);

    		let fileServer = uploadImgServer;

	    	if (fileServer.indexOf('?') > 0) {
	    		fileServer += '&';
	        } else {
	        	fileServer += '?';
	        }
	    	fileServer +=  'dir='+dir;



			axiosInstance({
				url: fileServer,
				method: 'post',
                data: formData,
				showLoading: false,//是否显示加载图标
				loadingMask:false,// 是否显示遮罩层
				timeout: 0,// 定义请求超时时间
			})
			.then((response: AxiosResponse) => {
				const result: any = response.data;
				if(result != ""){
					let resultData = JSON.parse(result);
					if(resultData.error ==0){
						// 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
						let url = resultData.url;
						// 上传代码返回结果之后，将图片插入到编辑器中
						let title = file.name;

						// 上传代码返回结果之后，将文件插入到编辑器中
						insert(url,title);
						// result 必须是一个 JSON 格式字符串！！！否则报错
					}else{
						//弹出提示内容
						Notify({
							type: 'danger',
							message: resultData.message
						});
					}
				}

			}).catch((error: any) =>{
				console.log(error);
			});

    	});


	}

}

//创建底部弹出框
const createRichtextEditorEmojiPicker = (editor:any,emojiPath:string) => {
	const mountNode:any = document.createElement('div');


	const Instance = createApp(RichtextEditorEmojiPicker, {
		show: true,
		emojiPath:emojiPath,
		close: () => {
			Instance.unmount(); //卸载应用
			document.body.removeChild(mountNode);
		},
		onEmojiSelect:(emoji: string,type:string ) => {//表情符号选择
		  if (emoji) {
				editor.txt.insertEmoticon(emoji, type);
		  }

		}
	})

	document.body.appendChild(mountNode)
	Instance.mount(mountNode)//挂载应用
	return {
		close: () => {
			Instance.unmount(); //卸载应用
			document.body.removeChild(mountNode);
		},
	};
}

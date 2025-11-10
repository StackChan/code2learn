// AJAX请求
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import createRouter from '@/router'
import debounce from "lodash/debounce";
import { createJumpAttribute} from '@/utils/jumpProcess';
import { Toast } from 'vant';
import { ToastWrapperInstance } from 'vant/lib/toast/types';
import { Dialog } from 'vant';
import { Notify } from 'vant';

import pinia from '@/store/store'
import {useStore} from '@/store'
import { storeToRefs } from 'pinia';
import { SystemUser } from '@/types';
import { deleteLastHistory } from './history';
import i18n from "@/locale/index";
const { t } = i18n.global;

const store = useStore(pinia)
const {systemUser:store_systemUser,topicDetailPermission:store_topicDetailPermission,defaultLanguage:store_defaultLanguage,currentLanguage:store_currentLanguage} = storeToRefs(store)




//loading对象
let loadingInstance :ToastWrapperInstance | null;
//loading当前正在请求的数量
let needLoadingRequestCount: number = 0;

//显示loading
const showLoading = (target:string | HTMLElement | undefined, mask:boolean=true) => {
	//解决加载图标抖动问题. 关闭时loading对象可能还存在，但needLoadingRequestCount已经变成0.避免这种情况下会重新创建loading
	if (needLoadingRequestCount === 0 && !loadingInstance) {

        loadingInstance = Toast.loading({
            duration:0,
            //message: '加载中...',
            forbidClick: true,//禁用背景点击
            //className:  mask ? '' :'custom-toastLoading',
            className:  'custom-toastLoading',
            overlay:mask,//是否显示背景遮罩层
            // loadingType:'spinner',
        });

        /**
		loadingInstance = ElLoading.service({
		   // lock: mask ? true :false,//加载时全屏幕锁定
		   //   text: '加载中...',
		   // fullscreen: mask ? true :false,//全屏遮罩
		  //  target: target || "document.body",
		    background: mask ? 'rgba(255, 255, 255, 0.5)' :'rgba(255, 255, 255, 0)',
		    customClass : mask ? '' :'loading-noOverlay-custom'//遮罩层
		}); */
	}
	needLoadingRequestCount++;
}
//隐藏loading
const hideLoading = () => {
	needLoadingRequestCount--;
	needLoadingRequestCount = Math.max(needLoadingRequestCount, 0); //做个保护
	if (needLoadingRequestCount === 0) {
		//关闭loading
		toHideLoading();
	}
}

//防抖：将 300ms 间隔内的关闭 loading 便合并为一次。防止连续请求时， loading闪烁的问题。
let toHideLoading = debounce(()=>{
	if(loadingInstance){
		loadingInstance.clear();
		loadingInstance = null;
	}
}, 300);



//MessageBox当前正在显示的数量
let needMessageBoxRequestCount: number = 0;

//显示MessageBox
const showMessageBox = (message: string) => {
    if (needMessageBoxRequestCount === 0) {//只显示第一个
        Dialog.alert({
            title: t('http.70'),//通知
            message: message,
            showConfirmButton:false,//是否展示确认按钮
        }).then(() => {
            // on close
        });
    }
    needMessageBoxRequestCount++;
}




const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // 定义请求超时时间
    timeout: 20000,
    // 请求带上 cookie
   // withCredentials: true,
    // 定义消息头
    headers: {
        //'X-Requested-With': 'XMLHttpRequest',
        post: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    },
    //设置csrf请求头。前后端分离使用localStorage保存登录状态时可以不配置xsrf
    xsrfCookieName : 'cms_token',
    xsrfHeaderName : 'BBS-XSRF-TOKEN'
})
export default axiosInstance

//请求拦截器
axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (config.headers === undefined) {
        config.headers = {};
    }

    //上传到第三方文件存储系统时可能只允许提交CORS默认响应头
    if(config.isCorsDefaultHeaders == undefined || config.isCorsDefaultHeaders == false){
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    if(store_currentLanguage.value == "zh"){
        config.headers['Accept-Language'] = 'zh-CN';
    }else if(store_currentLanguage.value == "en"){
        config.headers['Accept-Language'] = 'en-US';
    }else{
        if(store_defaultLanguage.value == 'zh_CN'){
            config.headers['Accept-Language'] = 'zh-CN';
        }
        if(store_defaultLanguage.value == 'en_US'){
            config.headers['Accept-Language'] = 'en-US';
        }
    }



    //判断当前请求是否设置了不显示Loading
    if(config.showLoading !== false){
        showLoading(config.loadingTarget as string | HTMLElement,config.loadingMask as boolean);
    }
    if (config.method === 'get' && config.timestamp !== false){
        if(config.params != undefined){
            //增加时间戳
            Object.assign(config.params, { //如果get请求本身带有参数，给options.params 再添加一个key值_t,值为时间戳
                _t: new Date().getTime(),
            })
        }else{
            config.params={_t: new Date().getTime()}
        }
    }

    //从localStorage中获取登录令牌
    let bbsToken = window.localStorage.getItem('bbsToken');
    if(bbsToken != null && (config.isCorsDefaultHeaders == undefined || config.isCorsDefaultHeaders == false)){
        let tokenObject = JSON.parse(bbsToken);
        //让每个请求携带会话token  ['Authorization']
        config.headers['Authorization'] = 'Bearer '+tokenObject.accessToken+","+tokenObject.refreshToken;//如果将过期的access_token提交到后端让令牌提取器解析，会返回401错误。注意:不需要登录后才能查看的页面不要携带本参数，如登录页和刷新令牌页不要提交此参数，目前无需登录的页面携带了本参数的请求由后端过滤去掉

    }



    return config
  },
  (error: any) => {
    //判断当前请求是否设置了不显示Loading
    if(error.config.showLoading !== false){
        hideLoading();
    }

    return Promise.resolve(error)
});


let isRefreshing:boolean = false // 标记是否正在刷新 token
let requests: ((sessionToken: any) => void)[] = [] // 存储待重发请求的数组

//响应拦截器
axiosInstance.interceptors.response.use((response: AxiosResponse) => {

        if (response.config.headers === undefined) {
            response.config.headers = {};
        }
        if(response.config.url?.includes('/thread')){//话题内容页权限
            store_topicDetailPermission.value = true;
        }

      //  console.log("响应拦截器 ",createRouter.currentRoute.value);

        if(response.config.url?.includes('/baseInfo')){//如果是请求基本信息

            const result: any = response.data;
            if(result != ""){
                let resultData = JSON.parse(result);

                let bbsToken = window.localStorage.getItem('bbsToken');

                if(bbsToken != null && resultData.systemUser == null){

                    if (!isRefreshing) {
                        isRefreshing = true;

                        new Promise(resolve => {
                            return refreshToken().then(res=> {
                                if(res){
                                    let result: any = res.data;
                                    if(result){
                                        let resultObject = JSON.parse(result);

                                        let accessToken = resultObject.accessToken;
                                        let refreshToken = resultObject.refreshToken;
                                        let systemUser = resultObject.systemUser;
                                        //访问令牌和刷新令牌存储到localStorage
                                        window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : accessToken, refreshToken : refreshToken}));
                                        store_systemUser.value = systemUser;
                                        //systemUser('setSystemUser', systemUser);
                                    }
                                }
                            }).catch(err => {

                                return Promise.reject(err)
                            }).finally(() => {
                                isRefreshing = false;
                            });
                        })


                    }
                }

            }



        }

        //判断当前请求是否设置了不显示Loading
        if(response.config.showLoading !== false){
            hideLoading();
        }

        return response;
    },
  // 请求失败
    (error: any) => {
        if(error.response){
            switch (error.response.status) {
                case 400:
                    if(error.config.showErrorMessage == undefined || error.config.showErrorMessage == true){
                        //请求无效（400）
                        Notify({duration :0,message: t('http.10') ,background: 'var(--van-red-100)'});
                    }
                    break;
                case 401:
                    if(!error.config.url.includes('/refreshToken')){//如果不是请求会话续期
                        const { config } = error;
                        if (!isRefreshing) {
                            isRefreshing = true;
                            return refreshToken().then(res=> {
                                if(res){
                                    let result: any = res.data;
                                    if(result){
                                        let tokenObject = JSON.parse(result);

                                        //会话token
                                        let sessionToken = tokenObject.accessToken+","+tokenObject.refreshToken;

                                        //手动添加标头 解决响应拦截器重试请求报is not a valid HTTP header field value错误https://github.com/axios/axios/issues/5143
                                        const originalConfig = error.config;
                                        originalConfig!.headers = { ...originalConfig!.headers };

                                        // 让每个请求携带会话token  ['Authorization']
                                        config.headers['Authorization'] = 'Bearer '+sessionToken;

                                        //访问令牌和刷新令牌存储到localStorage
                                        window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : tokenObject.accessToken, refreshToken : tokenObject.refreshToken}));

                                        // token 刷新后将数组的方法重新执行
                                        requests.forEach((cb) => cb(sessionToken));
                                        requests = []; // 重新请求完清空
                                        return axiosInstance(config)

                                    }else{
                                        //删除会话token
                                        window.localStorage.removeItem('bbsToken');
                                        store_systemUser.value = {} as SystemUser;


                                        if(createRouter.currentRoute.value.path =="/login"){
                                            createRouter.push({
                                                path : '/login'
                                            });
                                        }else{
                                            if(!error.config.url.includes('/user/control/unreadMessageCount')){//如果不是‘查询未读消息’的请求

                                                if(error.config.method == "post"){ //直接执行post请求后未登录跳转后不会新增浏览历史记录
                                                    createRouter.push({
                                                        path : '/login',
                                                        query:{
                                                            jumpUrl :createJumpAttribute()
                                                        }
                                                    });
                                                }else{
                                                    createRouter.replace({
                                                        path : '/login',
                                                        query:{
                                                            jumpUrl :createJumpAttribute()
                                                        }
                                                    });
                                                }


                                            }

                                        }

                                        //删除跳转到登录页前的一条历史记录
                                        deleteLastHistory();

                                    }
                                }
                            }).catch(err => {
                                //如果refreshToken()没读取到参数
                                //删除会话token
                                window.localStorage.removeItem('bbsToken');
                                store_systemUser.value = {} as SystemUser;
                                createRouter.push({
                                    path : '/login'
                                });

                                //判断当前请求是否设置了不显示Loading
                                if(error.config.showLoading !== false){
                                    hideLoading();
                                }
                                return Promise.reject(err)
                            }).finally(() => {
                                isRefreshing = false;
                                //判断当前请求是否设置了不显示Loading
                                if(error.config.showLoading !== false){
                                    hideLoading();
                                }
                            });
                        }else {
                            // 返回未执行 resolve 的 Promise
                            return new Promise(resolve => {
                                // 用函数形式将 resolve 存入，等待刷新后再执行
                                requests.push(sessionToken => {
                                    config.headers['Authorization'] = 'Bearer '+sessionToken;
                                    resolve(axiosInstance(config))
                                });
                                if(error.config.showLoading !== false){;
                                    hideLoading();
                                }
                            })
                        }

                    }else{
                        //删除会话token
                        window.localStorage.removeItem('bbsToken');
                        //请求刷新令牌出错，请重新登录
                        Notify({message: t('http.20') ,background: 'var(--van-red-100)'});
                        createRouter.push({
                            path : '/login'
                        });
                    }
                    break;
                case 403:
                    if(error.config.url.includes('/thread')){//话题内容页权限
                        store_topicDetailPermission.value = false;
                    }else{
                        //权限不足（您没有当前功能的操作权限）
                        Notify({message: t('http.30'),background: 'var(--van-red-100)'});
                    }
                    break;
                case 404:
                    if(error.config.showErrorMessage == undefined || error.config.showErrorMessage == true){
                        //找不到您尝试加载的网页（404）
                        Notify({duration :0,message: t('http.40')+error.response.config.url, background: 'var(--van-red-100)'});

                    }
                    break;
                case 500:
                    if(error.config.showErrorMessage == undefined || error.config.showErrorMessage == true){
                        //服务器错误（500）
                        Notify({duration :0,message: t('http.50') ,background: 'var(--van-red-100)'});
                    }
                    break;
                case 503: //关闭网站提示
                    showMessageBox(error.response.data);
                    break;
                case 508:
                    //清理登录信息
                    window.localStorage.clear();//清空localStorage中所有信息
                    store_systemUser.value = {} as SystemUser;
                    break;
                default:
                    if(error.config.showErrorMessage == undefined || error.config.showErrorMessage == true){
                        //请求错误（'+error.response.status+'）
                        Notify({duration :0,message: t('http.60',{'p1': error.response.status}),background: 'var(--van-red-100)'});
                    }
            }
        }else{
            //网络连接失败
            //ElMessage({
            //   duration :0,
            //    showClose: true,
            //    message: '请求失败（'+error.code+'：'+error.message+'）',
            //    type: 'error',
            //})
        }

        //判断当前请求是否设置了不显示Loading
        if(error.config && error.config.showLoading !== false){
            hideLoading();
        }
        return Promise.reject(error.response);
});


//刷新令牌
export let refreshToken = () =>{
    let formData = new FormData();

    return axiosInstance({
        method: 'post',
        url: 'refreshToken',
        data: formData,
        showLoading: false,//是否显示加载图标
        loadingMask:false,// 是否显示遮罩层
    });
	//.then(function (response) {
	//	return Promise.resolve(response);

	//});
};
//本地刷新会话续期
export let localRefreshToken = () =>{

    refreshToken().then(res=> {
        if(res){
            let result: any = res.data;
            if(result){
                let tokenObject = JSON.parse(result);
                //访问令牌和刷新令牌存储到localStorage
                window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : tokenObject.accessToken, refreshToken : tokenObject.refreshToken}));
            };
        }
    });
};

//原生ajax刷新会话续期（在Hls.js监听事件里调用axios会发生错误，这里用原生方法代替）
export let nativeRefreshToken = () =>{
    let xmlhttp = new window.XMLHttpRequest();
    xmlhttp.open('POST', import.meta.env.VITE_API_URL+"refreshToken" , false);//同步
    xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");//标记报头为AJAX

    //从localStorage中获取登录令牌
    let bbsToken = window.localStorage.getItem('bbsToken');
    if(bbsToken != null){
        let tokenObject = JSON.parse(bbsToken);
        //会话token
        let sessionToken = tokenObject.accessToken+","+tokenObject.refreshToken;
        // header 添加参数
        xmlhttp.setRequestHeader("Authorization", 'Bearer '+sessionToken);
    }

    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4) {//readystate
            if(xmlhttp.status == 200){
                let result = xmlhttp.responseText;
                if(result != ""){
                    let tokenObject = JSON.parse(result);
                    //访问令牌和刷新令牌存储到localStorage
                    window.localStorage.setItem("bbsToken", JSON.stringify({accessToken : tokenObject.accessToken, refreshToken : tokenObject.refreshToken}));
                }
            }
        }
    };
    xmlhttp.send(null);
};
//原生ajax查询视频重定向（在Hls.js监听事件里调用axios会发生错误，这里用原生方法代替）
export let nativeQueryVideoRedirect = (url:string,callback:any) =>{
    let xmlhttp = new window.XMLHttpRequest();
    xmlhttp.open('GET', url , false);//同步
    xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");//标记报头为AJAX

    //从localStorage中获取登录令牌
    let bbsToken = window.localStorage.getItem('bbsToken');
    if(bbsToken != null){
        let tokenObject = JSON.parse(bbsToken);
        //会话token
        let sessionToken = tokenObject.accessToken+","+tokenObject.refreshToken;
        // header 添加参数
        xmlhttp.setRequestHeader("Authorization", 'Bearer '+sessionToken);
    }

    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4) {//readystate
            if(xmlhttp.status == 200){
                let result = xmlhttp.responseText;
                if(result != ""){
                    let date = JSON.parse(result);
                    callback(date);
                }
            }
        }
    };
    xmlhttp.send(null);
};

//原生ajax文件下载重定向
export let nativeDownloadRedirect = (url:string,callback:any) =>{
    let xmlhttp = new window.XMLHttpRequest();
    xmlhttp.open('GET', url , false);//同步
    xmlhttp.setRequestHeader("X-Requested-With","XMLHttpRequest");//标记报头为AJAX

    //从localStorage中获取登录令牌
    let bbsToken = window.localStorage.getItem('bbsToken');
    if(bbsToken != null){
        let tokenObject = JSON.parse(bbsToken);
        //会话token
        let sessionToken = tokenObject.accessToken+","+tokenObject.refreshToken;
        // header 添加参数
        xmlhttp.setRequestHeader("Authorization", 'Bearer '+sessionToken);
    }
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4) {//readystate
            if(xmlhttp.status == 200){
                let result = xmlhttp.responseText;
                if(result != ""){
                    let date = JSON.parse(result);
                    callback(date);
                }
            }
        }
    };
    xmlhttp.send(null);
};

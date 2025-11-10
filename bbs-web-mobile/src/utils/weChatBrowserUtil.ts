//微信浏览器工具
import {getCurrentInstance, ComponentInternalInstance, } from 'vue'
import pinia from '@/store/store'
import {useStore} from '@/store'
import { getUrlParam } from './tool';
import { AxiosResponse } from 'axios';
import { Dialog } from 'vant';
import axiosInstance from './http';
import i18n from "@/locale/index";
const { t } = i18n.global;
const store = useStore(pinia);

/**
 * 是否为微信浏览器
*/
export function isWeiXinBrowser(): boolean {
    let ua = window.navigator.userAgent.toLowerCase();
    const matchArray: RegExpMatchArray | null = ua.match(/MicroMessenger/i);
    if (matchArray) {
        const code: string = matchArray[0];
        if(code == 'micromessenger'){
            return true;
        }
    }
	return false;
}

/**
 * 删除url参数
 * @param url 
 * @param paramKey 
 */
export function deleteUrlParam(url:string,paramKey:string): string {
    let urlParam = url.substring(url.indexOf("?")+1);
    let beforeUrl = url.substring(0,url.indexOf("?"));
    let nextUrl = "";
    let arr = new Array();
    if(urlParam != ""){
        let urlParamArr = urlParam.split("&");
      
        for(let i=0;i<urlParamArr.length;i++){
            let paramArr = urlParamArr[i].split("=");
            if(paramArr[0]!=paramKey){
                arr.push(urlParamArr[i]);
            }
        }
    }
     
    if(arr.length>0){
        nextUrl = "?"+arr.join("&");
    }
  
    url = beforeUrl+nextUrl;
   
    if(url.indexOf("?") == 0){//删除第一个问号
        url = url.substring(url.indexOf("?") + 1, url.length)
        
    }
    return url;
}

/**
 * 获取微信公众号code
 */
 export function getWeiXinCode(): void {
	let appid = store.weixin_oa_appid;
	//获取URL中的微信code
	let code = getUrlParam(window.location.href,"code");
	if((appid != null && appid != "") && (code == null || code == "")){
        
		let state = new Date().getTime();
		let url = deleteUrlParam(window.location.href,"code");//删除code参数
		url = deleteUrlParam(url,"state");//删除state参数
		let redirect_uri = encodeURIComponent(url);
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+appid+"&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_base&state="+state+"&connect_redirect=1#wechat_redirect";
	
		//让后面的代码停止执行
		throw new Error();
		
	}
}

/**
 * 获取微信openid
 */
 export function getWeiXinOpenId(): void {
    if(isWeiXinBrowser()){//如果来自微信内置浏览器
        //获取微信公众号code
        getWeiXinCode();
        //获取微信openid
        let code = getUrlParam(window.location.href,"code");
        if(code != null && code != ""){
            //删除浏览器地址的指定参数
			var url = deleteUrlParam(window.location.pathname + window.location.search,"code");//删除code参数
			url = deleteUrlParam(url,"state");//删除state参数
			history.replaceState({}, document.title, url);
		//	history.pushState({}, document.title, url);
			



            let formData = new FormData();
            formData.append('code', code);

            axiosInstance({
                url: '/thirdParty/queryWeiXinOpenId',
                method: 'post',
                data: formData,
                showLoading: false,//是否显示加载图标
                loadingMask:false,// 是否显示遮罩层
            })
            .then((response: AxiosResponse) => {
                if(response){

                    const result: any = response.data;
                    if(result){
                        let weiXin = JSON.parse(result);
                        if(weiXin.errorCode == ""){
                            //返回openid
                            sessionStorage.setItem("weixin_openid",weiXin.openId); 
                        }else{
                            Dialog.alert({
                                title: t('common.100')+' '+weiXin.errorCode,//错误
                                message: weiXin.errorMessage,
                              //  showConfirmButton:false,//是否展示确认按钮
                            }).then(() => {
                                // on close
                            });
                        }
                    }
                }
            })
            .catch((error: any) =>{
                console.log(error);
            });

        }
    }
}
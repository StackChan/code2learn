//路由历史记录
import createRouter from '@/router'
import pinia from '@/store/store'
import {useStore} from '@/store'
import { storeToRefs } from 'pinia';
import { nextTick } from 'vue';

//浏览历史记录
interface BrowserHistory {
    url: string;//URL
    scrollTop: number;//滚动条高度
}



/**
 * 添加浏览历史记录
 */
export function pushHistory(url:string) {
    const store = useStore(pinia)
   
   
    if(store.getPopUpWindow){//弹窗后退不添加浏览历史记录
        return;
    }



    let browserHistoryList  = new Array<BrowserHistory>();
    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    if(storage_browserHistoryList != null){
        browserHistoryList = JSON.parse(storage_browserHistoryList);
    }

    //如果和上一条记录相同，则本条不记录
    if(browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-1]){
        let browserHistory = browserHistoryList[browserHistoryList.length-1];
        if(browserHistory.url == url){
            return;
        }
    }

    let browserHistory: BrowserHistory = {
        url: url,
        scrollTop: 0
    };

    browserHistoryList.push(browserHistory);
    //如果当前组超出100条历史记录，则删除超出部分
    if(browserHistoryList.length >=100){
        browserHistoryList.shift();//删除第一个
    }
    //保存
    window.sessionStorage.setItem('browserHistoryList', JSON.stringify(browserHistoryList));


}




/**
 * 返回上一页
 */
export function onBack() {
    const store = useStore(pinia)
    store.setPopUpWindow(false);//还原弹窗后退标记

    //上一个浏览历史记录
    let beforeHistory = {} as BrowserHistory;

    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    
    if(storage_browserHistoryList != null){
        let browserHistoryList = JSON.parse(storage_browserHistoryList);
        if(browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-2]){
            beforeHistory = browserHistoryList[browserHistoryList.length-2];      
            //删除最后一个
            browserHistoryList.pop();
            //保存
            window.sessionStorage.setItem('browserHistoryList', JSON.stringify(browserHistoryList));
        }
    }

    
    if(beforeHistory != null && Object.keys(beforeHistory).length > 0){
        let beforeHistoryUrl = beforeHistory.url;
        //解析url参数
        let paramObject = analyzeUrlParam(beforeHistoryUrl);                      
        if (Object.keys(paramObject).length === 0) {//如果为空
            createRouter.push({
                path : beforeHistoryUrl
            });
        }else{
            //含有中文的值要解码
            for(let param in paramObject){
                paramObject[param] = decodeURIComponent(paramObject[param]);
            }
            
            let path = beforeHistoryUrl.split("?")[0]

            createRouter.push({
                path : path,
                query : paramObject
            });
        }
    }
}

/**
 * 浏览器后退按钮
 */
 export function onBrowserback(event:PopStateEvent) {
    const store = useStore(pinia)

    if(store.getPopUpWindow){//弹窗后退不跳转路由
        nextTick(()=>{
            //弹窗后退onBrowserback(event:PopStateEvent)方法会执行两次
            if(event.state.forward == null){
                store.setPopUpWindow(false);//还原弹窗后退标记
            }
        })
        return;
    }

    //上一个浏览历史记录
    let beforeHistory = {} as BrowserHistory;

    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    
    if(storage_browserHistoryList != null){
        let browserHistoryList = JSON.parse(storage_browserHistoryList);
        if(browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-2]){
            beforeHistory = browserHistoryList[browserHistoryList.length-1];//点击浏览器后退按钮会由main.ts的监听方法自动添加一条记录
           
           
            //删除最后两个
            browserHistoryList.pop();
            browserHistoryList.pop();
            
            //保存
            window.sessionStorage.setItem('browserHistoryList', JSON.stringify(browserHistoryList));
        }
    }



    if(beforeHistory != null && Object.keys(beforeHistory).length > 0){
        let beforeHistoryUrl = beforeHistory.url;
        //解析url参数
        let paramObject = analyzeUrlParam(beforeHistoryUrl);                  
        if (Object.keys(paramObject).length === 0) {//如果为空
            createRouter.push({
                path : beforeHistoryUrl
            });
        }else{
            //含有中文的值要解码
            for(let param in paramObject){
                paramObject[param] = decodeURIComponent(paramObject[param]);
            }
            
            let path = beforeHistoryUrl.split("?")[0]

            createRouter.push({
                path : path,
                query : paramObject
            });
        }
    }
}

/**
 * 添加最后一项浏览记录的滚动高度
 */
export function addScrollTop(url:string,top:number) {
    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    
    if(storage_browserHistoryList != null){
        let browserHistoryList = JSON.parse(storage_browserHistoryList);
        if(browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-1]){
            //最后一个浏览记录
            let lastHistory = browserHistoryList[browserHistoryList.length-1];
            if(lastHistory.url == url){
                lastHistory.scrollTop = top;
            
                //保存
                window.sessionStorage.setItem('browserHistoryList', JSON.stringify(browserHistoryList));
            }
           
        }
    }


}


/**
 * 删除最后一条浏览记录
 */
 export function deleteLastHistory() {
    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    
    if(storage_browserHistoryList != null){
        let browserHistoryList = JSON.parse(storage_browserHistoryList);
        if(browserHistoryList.length >0 && browserHistoryList[browserHistoryList.length-1]){
            //删除一个浏览记录
            browserHistoryList.pop();
            //保存
            window.sessionStorage.setItem('browserHistoryList', JSON.stringify(browserHistoryList));
        }
    }
 }

/**
 * 读取浏览记录
 */
export function readBrowserHistory() {
    //保存到sessionStorage的浏览历史记录
    let storage_browserHistoryList = window.sessionStorage.getItem('browserHistoryList');
    
    if(storage_browserHistoryList != null){
        return JSON.parse(storage_browserHistoryList);
    }

    return null;
}

/**
 * 解析url参数
 * @param url 格式: /qq?aa=1&bb=2
 * @return 参数对象
 */
export function analyzeUrlParam(url:string) {
	let params = {} as any;
	let urls = url.split("?");
	if(urls.length ==2){
		let arr = urls[1].split("&");
		for (let i = 0, l = arr.length; i < l; i++) {
			let a = arr[i].split("=");
			if(a[1] == undefined){//参数和值都为空时也加上&
				params[a[0]] = "";
			}else{
				params[a[0]] = a[1];
			}
			
		} 
	}
	return params;
}


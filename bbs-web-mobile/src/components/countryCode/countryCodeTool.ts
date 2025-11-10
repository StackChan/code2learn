import { AppContext, ComponentPublicInstance } from "vue";
import CountryCodeDialog from "@/components/countryCode/countryCodeDialog.vue";
import { useStore } from "@/store";
import { storeToRefs } from "pinia";
import { CountryCode } from "@/types";




/**
 * 显示、隐藏国际区号弹窗
 * @param proxy
 * @param appContext
 * @param selectedCountryCode 选中区号
 */
export function countryCodePopUp(proxy: any,appContext: AppContext,selectedCountryCode: string,callback: (d: any) => void){
    // 调用弹窗
    proxy?.$countryCodeDialog(CountryCodeDialog, {
        show: true,
        selectedCountryCode: selectedCountryCode //选中区号
    },
    appContext,
    (data:any)=>{
        callback(data);
    })
}


/**
 * 获取默认国际区号
 */
export function getDefaultCountryCode() {
    const store = useStore();
    const {currentLanguage:store_currentLanguage} = storeToRefs(store);

    return {name:store_currentLanguage.value == 'zh' ? '中国' : 'China', phone_code: '86' } as CountryCode;
}

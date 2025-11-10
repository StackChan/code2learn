<!-- 国际区号弹窗 -->
<template>

    <van-popup v-model:show="dialogVisible" safe-area-inset-bottom :close-on-popstate="true"  @open="handleOpen" @close="handleClose" position="bottom" closeable close-icon="close" class="custom-top-fixed-popupModule" :style="{ height: '100%'}" round>
        <div ref="popupContainerRef" class="popup-container">
            <div class="scroll" ref="countryCodeScrollbar" :style="'max-height: '+state.scrollBoxHeight+';'">
                <van-index-bar ref="indexBarRef" highlight-color="#1989fa" :index-list="state.firstPin">
                    <template v-for="(list, key) of state.firstNameData" :key="key">
                        <van-index-anchor :index="key" />
                        <van-cell :title="store_currentLanguage == 'zh'? countryCodeData.chinese_name+' (+'+countryCodeData.phone_code+')' : countryCodeData.english_name+' (+'+countryCodeData.phone_code+')'" :class="props.selectedCountryCode == countryCodeData.phone_code ? 'active' :''" v-for="countryCodeData of list" @click="handleSelect(countryCodeData)"/>
                    </template>
                </van-index-bar>
            </div>
        </div>
    </van-popup>
</template>
              

<script setup lang="ts">
    import { nextTick, onMounted, onUnmounted, reactive,ref,toRefs, watch} from "vue";
    import { useI18n } from 'vue-i18n';
    import countryCodeAndPhoneCode from '@/components/countryCode/countryCodeAndPhoneCode.json';
    import { useRect, useWindowSize } from '@vant/use';
    import pinyin from 'js-pinyin' 
    import { useStore } from "@/store";
    import { storeToRefs } from "pinia";
    import { CountryCode } from "@/types";
    
    pinyin.setOptions({checkPolyphone:false,charCase:0})

    const store = useStore();
    const {currentLanguage:store_currentLanguage} = storeToRefs(store)
    const { width, height } = useWindowSize();
        
    let { t } = useI18n();
    const props = withDefaults(
        defineProps<{
            show?: boolean; // moadl开关
            selectedCountryCode?: string; //选中区号
        }>(),
        {}
    );
    const emits = defineEmits(["select","close"]);
    const state = reactive({
        dialogVisible: props.show,

        firstNameData :{} as any,
        firstPin: ["A", "B", "C", "D", "E", "F", "G", "H","I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        scrollBoxHeight:'100vh',

    });
    const { dialogVisible } = toRefs(state);

    //滚动条
    const countryCodeScrollbar = ref()

    const popupContainerRef = ref();
    const indexBarRef = ref();


    //打开
    const handleOpen = () => {
        setTimeout(function () {//在窗口升起完成后
            setScrollBoxHeight();
        }, 400);
    }

    //关闭
    const handleClose = () => {
       
        emits("close", {});
        // 关闭弹窗
        dialogVisible.value = false;
    };
    const handleSelect = (countryCodeData: any) => {
        //语言
        if(store_currentLanguage.value == 'zh'){//语言 zh,en
            emits("select", {name:countryCodeData.chinese_name, phone_code: countryCodeData.phone_code } as CountryCode);
        }else{
            emits("select", {name:countryCodeData.english_name, phone_code: countryCodeData.phone_code } as CountryCode);
        }
        
        // 关闭弹窗
        dialogVisible.value = false;
    };
    

    const init = () => {
        state.firstPin.forEach((item)=>{
            state.firstNameData[item] = [];
            countryCodeAndPhoneCode.forEach((el)=>{
                let first = ""

                //语言
                if(store_currentLanguage.value == 'zh'){//语言 zh,en
                    first = pinyin.getFullChars(el.chinese_name).substring(0,1);
                }else{
                    first = el.english_name.substring(0,1);
                }

                if( first == item ){
                    state.firstNameData[item].push(el)
                }       
            })
        }) 

        //删除空数组
        for (const key in state.firstNameData) {
            if(state.firstNameData[key].length ==0){
                delete state.firstNameData[key];
                state.firstPin = state.firstPin.filter(item => item !== key);
            }
        }
    }

    //设置滚动框高度
    const setScrollBoxHeight = () => {
        nextTick(()=>{
            const popupContainer = useRect(popupContainerRef);
            state.scrollBoxHeight = "calc(100vh - "+popupContainer.top +"px - 5px)";//屏幕高度 - 顶部top - 误差
        })
    }
    
    //监听元素高度
    const resizeObserver = new ResizeObserver(entries => {
        // 处理大小变化的回调函数
        for (const entry of entries) {
            //console.log('元素大小已变化', entry.target);
            setScrollBoxHeight();
        }
    });

    watch([height], () => {
        setScrollBoxHeight();
    });

    onMounted(() => {
        init();

        setScrollBoxHeight();
    }) 
    
    onUnmounted(() => {
        resizeObserver.unobserve(indexBarRef.value);
    });

</script>
<style scoped lang="scss">
.popup-container{
    margin-top: 15px;
    .scroll{
        overflow-y:auto;
        -webkit-overflow-scrolling: touch;
        :deep(.van-index-anchor) {
            border-radius: 16px 16px 0 0;
        }
        :deep(.active) {
            .van-cell__title span{
                color: #faab0c;
            }
        }
    }
}
</style>
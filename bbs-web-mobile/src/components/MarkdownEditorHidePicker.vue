<!-- 隐藏标签选择器 -->
<template>
    <van-popup v-model:show="show_popup" class="markdownEditorHidePicker" :lock-scroll="false" position="bottom" :close-on-popstate="true" close-icon="close" :round="true" :closeable="true"  @closed="closed()">
        <van-picker :columns="picker_columns" :columns-field-names="{ text: 'title'}" @confirm="onConfirm"  @cancel="onCancel"/>
    </van-popup>
</template>

<script setup lang="ts">
    import { onMounted, ref} from 'vue'
    import { definePropType } from '@/utils/tool';
    import { PickerColumn, PickerOption } from 'vant';

    const show_popup = ref(false);
    const picker_columns = ref([]);

    //接收父组件消息
    const props = defineProps({
        show: {
            type: Boolean,
            default: false
        },
        columns: {//对象数组，配置每一列显示的数据
            type: definePropType<PickerOption[] | PickerColumn[]>(Object),
            default: []
        },
        onTagSelect: {//标签类型选择
            type: Function,
            default: null
        },
        close: {
            type: definePropType<() => void>(Function),
            required: true,
        }
    })  

    //点击完成按钮时触发
    const onConfirm = (value:any, index:number) => {
        for(let i=0; i<props.columns.length;i++){
            const actionItem:any = props.columns[i];

            if(actionItem.title == value.title){
                props.onTagSelect(actionItem.code);
                break;
            }
        }
        show_popup.value = false;
    };
    

    //点击取消按钮时触发
    const onCancel = () => {
        show_popup.value = false;
    }


    const handleCreateHidePicker = () => {
        let titleArray:any = new Array()
        for(let i=0; i<props.columns.length;i++){
            const actionItem:any = props.columns[i];

            titleArray.push({"title":actionItem.title})
           
        }
        
        picker_columns.value =titleArray;


        show_popup.value = props.show;
    };



    //关闭弹出层且动画结束后触发。
    const closed = () => {
        props.close();
    }

    onMounted(() => {
        handleCreateHidePicker();
    }) 
   
</script>

import {useStore} from "@/store";
import pinia from "@/store/store";
import axiosInstance from "@/utils/http";
const store = useStore(pinia);
class HistoryAPI {
  /**
   * 文件上传地址
   */


  static Url = store.apiUrl + "history";
  // /** 获取物品分页数据 */
  // static getPage(queryParams?: HistoryPageQuery) {
  //   return axiosInstance<any, PageResult<goodsPageVO[]>>({
  //     url: `${uploadUrl}/page`,
  //     method: "get",
  //     params: queryParams,
  //   });
  // }
  /** 添加物品*/
  static add(data: HistoryInfo) {
    return axiosInstance({
      url: `${Url}`,
      method: "post",
      data: data,
    });
  }
}

export default HistoryAPI;
/** 物品分页查询参数 */
export interface HistoryPageQuery{
  /** 唯一编号 */
  userId: string;
}
/**
 * 文件API类型声明
 */
export interface HistoryInfo {
  /** 文件名 */
  id: string;
  /** 文件路径 */
  userId: string;
  /** 文件名 */
  viewId: string;
  /** 文件路径 */
  type: string;
}
export interface HistoryViewInfo {
  /** 文件名 */
  id: string;
  /** 文件路径 */
  title: string;
  /** 文件路径 */
  summary: string;
  /** 文件名 */
  viewId: string;
  /** 文件路径 */
  type: string;
  /** 文件路径 */
  viewTime: string;
}
export function  notifyBackend (viewId: string,type: number){
  console.log("store.systemUser",store);
  try {
    axiosInstance({
      url: '/history', // 替换为实际的后端接口地址
      method: 'post',
      data: {
        viewId: viewId,
        type:type,
        userId:store.systemUser.userId
      },
      showLoading: false, // 是否显示加载图标
      loadingMask: false, // 是否显示遮罩层
      showErrorMessage: false, // 是否显示错误提示
    });
    console.log('Backend notified successfully');
  } catch (error) {
    console.error('Failed to notify backend:', error);
    throw error;
  }
}

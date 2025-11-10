import {useStore} from "@/store";
import pinia from "@/store/store";
import axiosInstance from "@/utils/http";
const store = useStore(pinia);
class FileAPI {
  /**
   * 文件上传地址
   */


  static uploadUrl = store.apiUrl + "api/v1/files";
  /**
   * 上传文件
   *
   * @param file
   */
  static upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance<any, FileInfo>({
      url: "api/v1/files",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 删除文件
   *
   * @param filePath 文件完整路径
   */
  static deleteByPath(filePath?: string) {
    return axiosInstance({
      url: "api/v1/files",
      method: "delete",
      params: { filePath: filePath },
    });
  }

  /**
   * 下载文件
   * @param url
   * @param fileName
   */
  static downloadFile(url: string, fileName?: string) {
    var link = document.createElement('a');
    link.href = url;
    console.log(fileName)
    link.download = fileName||"下载文件"; // 可以自定义下载后的文件名，如果不指定，浏览器通常会使用URL中的文件名
    // 触发点击事件来启动下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    }
}

export default FileAPI;

/**
 * 文件API类型声明
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件路径 */
  url: string;
}

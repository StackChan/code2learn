package cms.web.action.file;

import cms.utils.JsonUtils;
import cms.service.file.FileInfo;
import cms.service.file.FileService;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件控制层
 *
 * @author Ray
 * @since 2022/10/16
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    @Resource
    private FileService fileService;

    @PostMapping
    public String uploadFile(
            @RequestPart(value = "file") MultipartFile file
    ) {
        Map<String,Object> returnJson = new HashMap<String,Object>();
        FileInfo fileInfo = fileService.uploadFile(file);
        //上传成功
        returnJson.put("error", 0);//0成功  1错误
        returnJson.put("url", fileInfo.getUrl());
        return JsonUtils.toJSONString(returnJson);
    }

    @DeleteMapping
    @SneakyThrows
    public String deleteFile(
            @RequestParam String filePath
    ) {
        Map<String,Object> returnJson = new HashMap<String,Object>();
        boolean result = fileService.deleteFile(filePath);
        if(result){
            returnJson.put("error", 0);//0成功  1错误
        }else{
            returnJson.put("error", 1);//0成功  1错误
        }
        returnJson.put("url", "");
        return JsonUtils.toJSONString(returnJson);
    }
}

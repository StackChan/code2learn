package cms.web.action.common;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cms.bean.diary.Diary;
import cms.bean.user.AccessUser;
import cms.service.diary.DiaryService;
import cms.utils.JsonUtils;
import cms.utils.WebUtil;
import cms.utils.threadLocal.AccessUserThreadLocal;
import cms.web.action.CSRFTokenManage;
import cms.web.action.SystemException;

/**
 * 日记接收表单
 *
 */
@Controller
@RequestMapping("user/control/diary")
public class DiaryFormAction {
	@Resource DiaryService diaryService;
	@Resource CSRFTokenManage csrfTokenManage;

	/**
	 * 日记  添加
	 */
	@RequestMapping(value="/add", method=RequestMethod.POST)
	@ResponseBody
	public String add(ModelMap model,String title,String content,
			String token,
			HttpServletRequest request, HttpServletResponse response) throws Exception {

		//获取登录用户
	  	AccessUser accessUser = AccessUserThreadLocal.get();

		boolean isAjax = WebUtil.submitDataMode(request);//是否以Ajax方式提交数据
		Map<String,String> error = new HashMap<String,String>();

		//处理CSRF令牌
		csrfTokenManage.processCsrfToken(request, token,error);

		Diary diary = new Diary();
		Date d = new Date();
		diary.setPostTime(d);
		diary.setStatus(20);//20.已发布（日记不需要审核）
		
		//处理标题
		if(title != null && !"".equals(title.trim())){
			diary.setTitle(title.trim());
		}
		
		//处理内容
		if(content != null && !"".equals(content.trim())){
			diary.setContent(content.trim());
			
			//提取摘要（取前100个字符）
			String summary = content.replaceAll("<[^>]*>", "").trim(); // 去除HTML标签
			if(summary.length() > 100){
				diary.setSummary(summary.substring(0, 100));
			}else{
				diary.setSummary(summary);
			}
			
			//统计字数（去除HTML后的纯文本字数）
			diary.setWordCount((long)summary.length());
		}else{
			error.put("content", "日记内容不能为空");
		}

		diary.setUserName(accessUser.getUserName());
		diary.setIsStaff(false);

		if(error.size() == 0){
			try {
				//保存日记
				diaryService.saveDiary(diary);
			} catch (SystemException e) {
				error.put("diary", "提交日记失败");
			}
		}

		Map<String,String> returnError = new HashMap<String,String>();//错误
		if(error.size() >0){
			for (Map.Entry<String,String> entry : error.entrySet()) {
				returnError.put(entry.getKey(), entry.getValue());
			}
		}
		
		if(isAjax == true){
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值

			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			WebUtil.writeToWeb(JsonUtils.toJSONString(returnValue), "json", response);
			return null;
		}else{
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值
			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			return JsonUtils.toJSONString(returnValue);
		}
	}

	/**
	 * 日记  修改
	 */
	@RequestMapping(value="/edit", method=RequestMethod.POST)
	@ResponseBody
	public String edit(ModelMap model,Long diaryId,String title,String content,
			String token,
			HttpServletRequest request, HttpServletResponse response) throws Exception {

		//获取登录用户
	  	AccessUser accessUser = AccessUserThreadLocal.get();

		boolean isAjax = WebUtil.submitDataMode(request);//是否以Ajax方式提交数据
		Map<String,String> error = new HashMap<String,String>();

		//处理CSRF令牌
		csrfTokenManage.processCsrfToken(request, token,error);

		Diary diary = null;

		if(diaryId != null && diaryId >0L){
			diary = diaryService.findById(diaryId);
			if(diary != null){
				if(!diary.getUserName().equals(accessUser.getUserName())){
					error.put("diary", "只允许修改自己发布的日记");
				}
				if(diary.getStatus() > 100){
					error.put("diary", "日记已删除");
				}
			}else{
				error.put("diary", "日记不存在");
			}
		}else{
			error.put("diary", "日记Id不能为空");
		}

		if(error.size() == 0 && diary != null){
			//处理标题
			if(title != null && !"".equals(title.trim())){
				diary.setTitle(title.trim());
			}
			
			//处理内容
			if(content != null && !"".equals(content.trim())){
				diary.setContent(content.trim());
				
				//提取摘要（取前100个字符）
				String summary = content.replaceAll("<[^>]*>", "").trim(); // 去除HTML标签
				if(summary.length() > 100){
					diary.setSummary(summary.substring(0, 100));
				}else{
					diary.setSummary(summary);
				}
				
				//统计字数
				diary.setWordCount((long)summary.length());
			}else{
				error.put("content", "日记内容不能为空");
			}
			
			diary.setLastUpdateTime(new Date());//最后修改时间
		}

		if(error.size() == 0){
			int i = diaryService.updateDiary(diary);
			if(i <= 0){
				error.put("diary", "修改日记失败");
			}
		}

		Map<String,String> returnError = new HashMap<String,String>();//错误
		if(error.size() >0){
			for (Map.Entry<String,String> entry : error.entrySet()) {
				returnError.put(entry.getKey(), entry.getValue());
			}
		}
		
		if(isAjax == true){
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值

			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			WebUtil.writeToWeb(JsonUtils.toJSONString(returnValue), "json", response);
			return null;
		}else{
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值
			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			return JsonUtils.toJSONString(returnValue);
		}
	}

	/**
	 * 日记  删除
	 */
	@RequestMapping(value="/delete", method=RequestMethod.POST)
	@ResponseBody
	public String delete(ModelMap model,Long diaryId,
			String token,
			HttpServletRequest request, HttpServletResponse response) throws Exception {

		//获取登录用户
	  	AccessUser accessUser = AccessUserThreadLocal.get();

		boolean isAjax = WebUtil.submitDataMode(request);//是否以Ajax方式提交数据
		Map<String,String> error = new HashMap<String,String>();

		//处理CSRF令牌
		csrfTokenManage.processCsrfToken(request, token,error);

		Diary diary = null;

		if(diaryId != null && diaryId >0L){
			diary = diaryService.findById(diaryId);
			if(diary != null){
				if(!diary.getUserName().equals(accessUser.getUserName())){
					error.put("diary", "只允许删除自己发布的日记");
				}
			}else{
				error.put("diary", "日记不存在");
			}
		}else{
			error.put("diary", "日记Id不能为空");
		}

		if(error.size() == 0){
			int i = diaryService.deleteDiary(diaryId);
			if(i <= 0){
				error.put("diary", "删除日记失败");
			}
		}

		Map<String,String> returnError = new HashMap<String,String>();//错误
		if(error.size() >0){
			for (Map.Entry<String,String> entry : error.entrySet()) {
				returnError.put(entry.getKey(), entry.getValue());
			}
		}
		
		if(isAjax == true){
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值

			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			WebUtil.writeToWeb(JsonUtils.toJSONString(returnValue), "json", response);
			return null;
		}else{
			Map<String,Object> returnValue = new HashMap<String,Object>();//返回值
			if(error != null && error.size() >0){
				returnValue.put("success", false);
				returnValue.put("error", returnError);
			}else{
				returnValue.put("success", true);
			}
			return JsonUtils.toJSONString(returnValue);
		}
	}
}


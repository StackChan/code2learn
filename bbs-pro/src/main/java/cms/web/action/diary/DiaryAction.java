package cms.web.action.diary;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import cms.bean.PageForm;
import cms.bean.PageView;
import cms.bean.QueryResult;
import cms.bean.RequestResult;
import cms.bean.ResultCode;
import cms.bean.diary.Diary;
import cms.bean.user.AccessUser;
import cms.service.diary.DiaryService;
import cms.service.setting.SettingService;
import cms.utils.JsonUtils;
import cms.utils.WebUtil;
import cms.utils.threadLocal.AccessUserThreadLocal;

/**
 * 日记
 *
 */
@Controller
public class DiaryAction {
	@Resource DiaryService diaryService;
	@Resource SettingService settingService;
	
	/**
	 * 查询日记列表
	 */
	@ResponseBody
	@RequestMapping("/user/control/diary/list") 
	public String execute(ModelMap model, PageForm pageForm, String status,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		
		//获取登录用户
	  	AccessUser accessUser = AccessUserThreadLocal.get();
		
		if(accessUser == null){
			return JsonUtils.toJSONString(new RequestResult(ResultCode.FAILURE, "用户未登录"));
		}
		
		// 处理分页参数
		if(pageForm == null || pageForm.getPage() == null){
			pageForm = new PageForm();
			pageForm.setPage(1);
		}
		
		StringBuffer jpql = new StringBuffer("");
		List<Object> params = new ArrayList<Object>();

		//只查询当前用户的日记
		jpql.append(" and o.userName=?"+ (params.size()+1));
		params.add(accessUser.getUserName());
		
		//根据状态过滤
		if(status != null && !"".equals(status)){
			if("draft".equals(status)){
				//草稿（待审核）
				jpql.append(" and o.status=?"+ (params.size()+1));
				params.add(10);
			}else if("all".equals(status) || "published".equals(status)){
				//已发布
				jpql.append(" and o.status=?"+ (params.size()+1));
				params.add(20);
			}
		}else{
			//默认只显示已发布
			jpql.append(" and o.status=?"+ (params.size()+1));
			params.add(20);
		}

		//删除第一个and
		String _jpql = org.apache.commons.lang3.StringUtils.difference(" and", jpql.toString());
		
		//初始化分页
		PageView<Diary> pageView = new PageView<Diary>(settingService.findSystemSetting_cache().getForestagePageNumber(), pageForm.getPage(), 10);
		
		//当前页
		int firstindex = (pageForm.getPage()-1)*pageView.getMaxresult();
		//排序
		LinkedHashMap<String,String> orderby = new LinkedHashMap<String,String>();
		orderby.put("postTime", "desc");//根据postTime字段降序排序
		
		//调用分页算法类
		QueryResult<Diary> qr = diaryService.getScrollData(Diary.class, firstindex, pageView.getMaxresult(), _jpql, params.toArray(), orderby);
		
		//设置查询结果
		pageView.setQueryResult(qr);
		
		return JsonUtils.toJSONString(pageView);
	}
	
	/**
	 * 查询日记统计信息
	 */
	@ResponseBody
	@RequestMapping("/user/control/diary/statistics")
	public String statistics(HttpServletRequest request, HttpServletResponse response) throws Exception {
		//获取登录用户
	  	AccessUser accessUser = AccessUserThreadLocal.get();
		
		if(accessUser == null){
			return JsonUtils.toJSONString(new RequestResult(ResultCode.FAILURE, "用户未登录"));
		}
		
		Map<String,Object> result = new HashMap<String,Object>();
		
		try {
			//查询统计信息
			Long diaryCount = diaryService.findDiaryCount(accessUser.getUserName());
			Long recordDays = diaryService.findRecordDays(accessUser.getUserName());
			Long totalWords = diaryService.findTotalWords(accessUser.getUserName());
			
			//简单的词频统计（获取最近的20条日记）
			List<Diary> recentDiaries = diaryService.findDiaryByPage(accessUser.getUserName(), new Date(0), 0, 20);
			
			//统计词频
			List<Map<String,Object>> highFreqWords = new ArrayList<Map<String,Object>>();
			if(recentDiaries != null && recentDiaries.size() > 0){
				Map<String, Integer> wordMap = new HashMap<String, Integer>();
				for(Diary diary : recentDiaries){
					String title = (diary.getTitle() != null ? diary.getTitle() : "");
					String content = (diary.getContent() != null ? diary.getContent() : "");
					String text = (title + " " + content.replaceAll("<[^>]*>", "")).toLowerCase();
					
					String[] words = text.split("\\s+");
					for(String word : words){
						if(word.length() > 1 && !word.matches(".*[\\p{Punct}].*")){ // 过滤标点符号
							wordMap.put(word, wordMap.getOrDefault(word, 0) + 1);
						}
					}
				}
				
				//取词频最高的10个词
				wordMap.entrySet().stream()
					.sorted((a, b) -> b.getValue().compareTo(a.getValue()))
					.limit(10)
					.forEach(entry -> {
						Map<String,Object> word = new HashMap<String,Object>();
						word.put("text", entry.getKey());
						word.put("count", entry.getValue());
						highFreqWords.add(word);
					});
			}
			
			result.put("diaryCount", diaryCount != null ? diaryCount : 0);
			result.put("recordDays", recordDays != null ? recordDays : 0);
			result.put("totalWords", totalWords != null ? totalWords : 0);
			result.put("highFreqWords", highFreqWords);
		} catch (Exception e) {
			// 发生错误时返回默认值
			result.put("diaryCount", 0);
			result.put("recordDays", 0);
			result.put("totalWords", 0);
			result.put("highFreqWords", new ArrayList<Map<String,Object>>());
		}
		
		return JsonUtils.toJSONString(new RequestResult(ResultCode.SUCCESS, result));
	}
}


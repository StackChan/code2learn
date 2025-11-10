package cms.web.action.history;


import cms.bean.PageForm;
import cms.bean.PageView;
import cms.bean.QueryResult;
import cms.bean.history.history;
import cms.bean.history.historyView;
import cms.bean.question.Question;
import cms.bean.question.QuestionTag;
import cms.bean.question.QuestionTagAssociation;
import cms.bean.staff.SysUsers;
import cms.bean.user.User;
import cms.service.history.HistoryService;
import cms.service.question.QuestionService;
import cms.service.question.QuestionTagService;
import cms.service.user.UserService;
import cms.utils.HtmlEscape;
import cms.utils.Verification;
import cms.web.action.staff.StaffManage;
import cms.web.action.user.UserManage;
import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cms.bean.RequestResult;
import cms.bean.ResultCode;
import cms.bean.topic.Tag;
import cms.service.setting.SettingService;
import cms.service.topic.TagService;
import cms.utils.FileUtil;
import cms.utils.JsonUtils;
import cms.utils.UUIDUtil;
import cms.web.action.TextFilterManage;
import cms.web.action.fileSystem.FileManage;

import org.apache.commons.lang3.StringUtils;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.Validator;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

/**
 * 标签管理
 *
 */
@Controller
@RequestMapping("/history")
public class historyAction {

	@Resource
	HistoryService historyService;
	@Resource
	UserService userService;
	@Resource SettingService settingService;
	@Resource
	QuestionService questionService;
	@Resource TextFilterManage textFilterManage;
	@Resource FileManage fileManage;
	@Resource
	UserManage userManage;
	@Resource
	StaffManage staffManage;
	@Resource
	QuestionTagService questionTagService;
//	/**
//	 * 标签   添加界面显示
//	 */
//	@ResponseBody
//	@RequestMapping(params="method=add",method=RequestMethod.GET)
//	public String addUI(Tag tag,ModelMap model,
//			HttpServletRequest request, HttpServletResponse response) throws Exception {
//
//		return JsonUtils.toJSONString(new RequestResult(ResultCode.SUCCESS,null));
//	}

	/**
	 * 标签  添加
	 */
	@RequestMapping(method=RequestMethod.POST)
	@ResponseBody
	public String add(ModelMap model,Long userId,Long viewId,Integer type,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		history his=new history();
		his.setType(type);
		his.setUserId(userId);
		his.setViewId(viewId);
		Date time = new Date();
		his.setViewTime(time);
		historyService.saveHistory(his);
	 return JsonUtils.toJSONString(new RequestResult(ResultCode.SUCCESS,"添加成功"));
	}

	@ResponseBody
	@RequestMapping(method=RequestMethod.GET)
	public String search(ModelMap model, PageForm pageForm,
			String keyword,String tagId,String tagName,String account,
			String start_postTime,String end_postTime,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		System.out.println("历史记录浏览");
		//错误
		Map<String,String> error = new HashMap<String,String>();

		String _keyword = null;//关键词
		Long _tagId = null;//标签
		String _userName = null;//用户名
		Long userId = null;//标签
		Date _start_postTime = null;//发表时间 起始
		Date _end_postTime= null;//发表时间	结束

		if(keyword != null && !"".equals(keyword.trim())){
			_keyword = keyword.trim();
		}
		//标签
		if(tagId != null && !"".equals(tagId.trim())){
			boolean tagId_verification = Verification.isPositiveInteger(tagId.trim());//正整数
			if(tagId_verification){
				_tagId = Long.parseLong(tagId.trim());
			}else{
				error.put("tagId", "请选择标签");
			}
		}
		//账号
		if(account != null && !"".equals(account.trim())){
			User user = userService.findUserByAccount(account.trim());
			if(user != null){
				_userName = user.getUserName();
				userId= user.getId();
			}else{
				_userName = account.trim();
				return null;
			}
		}else{
			return null;
		}
		//起始发表时间
		if(start_postTime != null && !"".equals(start_postTime.trim())){
			boolean start_postTimeVerification = Verification.isTime_minute(start_postTime.trim());
			if(start_postTimeVerification){
				DateFormat dd = new SimpleDateFormat("yyyy-MM-dd HH:mm");
				_start_postTime = dd.parse(start_postTime.trim());
			}else{
				error.put("start_postTime", "请填写正确的日期");
			}
		}
		//结束发表时间
		if(end_postTime != null && !"".equals(end_postTime.trim())){
			boolean end_postTimeVerification = Verification.isTime_minute(end_postTime.trim());
			if(end_postTimeVerification){
				DateFormat dd = new SimpleDateFormat("yyyy-MM-dd HH:mm");
				_end_postTime = dd.parse(end_postTime.trim());
			}else{
				error.put("end_postTime", "请填写正确的日期");
			}
		}
		//比较时间
		Calendar start=Calendar.getInstance();//发表时间 起始
		Calendar end=Calendar.getInstance();//发表时间 结束
		if(_start_postTime != null){
			start.setTime(_start_postTime);
		}
		if(_end_postTime != null){
			end.setTime(_end_postTime);
		}
		if(_start_postTime != null && _end_postTime != null){
			int result =start.compareTo(end);//起始时间与结束时间比较
			if(result > 0 ){//起始时间比结束时间大
				error.put("start_postTime", "起始时间不能比结束时间大");
			}
		}



		//调用分页算法代码
		PageView<Question> pageView = new PageView<Question>(settingService.findSystemSetting_cache().getBackstagePageNumber(),pageForm.getPage(),10);
		//当前页
		int firstindex = (pageForm.getPage()-1)*pageView.getMaxresult();

//数据库
			String param = "";//sql参数
	  	String ass = "";//sql参数
			List<Object> paramValue = new ArrayList<Object>();//sql参数值

//			if(userId != null && userId >0){//标签
//				ass += "LEFT JOIN history h ON o.id = h.viewId WHERE h.userId =" +userId;
//			}
			if(userId != null && userId >0){//标签
				param += " and o.userId = ?"+(paramValue.size()+1);
				paramValue.add(userId);
			}
		if(_keyword != null){//标题
			param += " and (o.title like ?"+(paramValue.size()+1)+" escape '/' ";
			paramValue.add("%/"+ _keyword+"%");

			//内容
			param += " or o.content like ?"+(paramValue.size()+1)+" escape '/' )";
			paramValue.add("%/"+ _keyword+"%");
		}
			if(_tagId != null && _tagId >0){//标签
				param += " and exists(select q.questionId from QuestionTagAssociation q where q"
						+ ".questionTagId = ?"+(paramValue.size()+1)+" and q.questionId=o.id) ";
				paramValue.add(_tagId);
			}

			if(_start_postTime != null){//起始发表时间
				param += " and o.viewTime >= ?"+(paramValue.size()+1);

				paramValue.add(_start_postTime);
			}
			if(_end_postTime != null){//结束发表时间
				param += " and o.viewTime <= ?"+(paramValue.size()+1);
				paramValue.add(_end_postTime);
			}
			//删除第一个and
			param = StringUtils.difference(" and", param);
			//排序
			LinkedHashMap<String,String> orderby = new LinkedHashMap<String,String>();
			orderby.put("id", "desc");//排序
		QueryResult<history> qr = questionService.getScrollData2(history.class,firstindex,
				pageView.getMaxresult(), param, paramValue.toArray(),orderby,ass);
    List<Question> Questionlist = new ArrayList<Question>();
		if(qr != null && qr.getResultlist() != null && qr.getResultlist().size() >0){
				for(history his :qr.getResultlist()){
					Question t = questionService.findById(his.getViewId());
					t.setViewTime(his.getViewTime());
					if(t.getTitle() != null && !"".equals(t.getTitle().trim())){
						//转义
						t.setTitle(HtmlEscape.escape(t.getTitle()));
					}
					if(t.getContent() != null && !"".equals(t.getContent().trim())){
						t.setContent(textFilterManage.filterText(t.getContent()));
						if(t.getContent().length() > 190){
							t.setContent(t.getContent().substring(0, 190));
						}
					}
					if(t.getIsStaff()){//如果为员工
						SysUsers sysUsers = staffManage.query_cache_findByUserAccount(t.getUserName());
						if(sysUsers != null){
							t.setNickname(sysUsers.getNickname());
							if(sysUsers.getAvatarName() != null && !"".equals(sysUsers.getAvatarName().trim())){
								t.setAvatarPath(fileManage.fileServerAddress(request)+sysUsers.getAvatarPath());
								t.setAvatarName(sysUsers.getAvatarName());
							}
						}
						t.setAccount(t.getUserName());//员工用户名和账号是同一个
					}else{
						User user = userManage.query_cache_findUserByUserName(t.getUserName());
						if(user != null){
							t.setAccount(user.getAccount());
							t.setNickname(user.getNickname());
							if(user.getAvatarName() != null && !"".equals(user.getAvatarName().trim())){
								t.setAvatarPath(fileManage.fileServerAddress(request)+user.getAvatarPath());
								t.setAvatarName(user.getAvatarName());
							}
						}
					}
					Questionlist.add(t);
				}
			}
			//将查询结果集传给分页List
			pageView.setRecords(Questionlist);
			pageView.setTotalrecord(Questionlist.size());
		if(pageView.getRecords() != null && pageView.getRecords().size() >0){
			List<QuestionTag> questionTagList = questionTagService.findAllQuestionTag();

			if(questionTagList != null && questionTagList.size() >0){
				for(Question question : pageView.getRecords()){
					List<QuestionTagAssociation> questionTagAssociationList = questionService.findQuestionTagAssociationByQuestionId(question.getId());
					if(questionTagAssociationList != null && questionTagAssociationList.size() >0){
						for(QuestionTag questionTag : questionTagList){
							for(QuestionTagAssociation questionTagAssociation : questionTagAssociationList){
								if(questionTagAssociation.getQuestionTagId().equals(questionTag.getId())){
									questionTagAssociation.setQuestionTagName(questionTag.getName());
									question.addQuestionTagAssociation(questionTagAssociation);
									break;
								}
							}
						}
					}
				}
			}

		}

		if(error.size() >0){
			return JsonUtils.toJSONString(new RequestResult(ResultCode.FAILURE,error));
		}else{
			return JsonUtils.toJSONString(new RequestResult(ResultCode.SUCCESS,pageView));
		}
	}

}

package cms.service.history.impl;

import cms.bean.help.Help;
import cms.bean.history.history;
import cms.bean.history.historyView;
import cms.bean.question.Question;
import cms.bean.topic.Topic;
import cms.bean.user.UserRole;
import cms.service.besa.DaoSupport;
import cms.service.help.HelpTypeService;
import cms.service.history.HistoryService;
import cms.service.question.impl.QuestionServiceBean;
import cms.service.topic.impl.TopicServiceBean;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Resource;
import javax.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

;

/**
 * 帮助管理
 *
 */
@Service
@Transactional
public class HistoryServiceBean extends DaoSupport<history> implements HistoryService {
	@Resource
	TopicServiceBean topicService;
	@Resource
	QuestionServiceBean questionService;
	@Transactional(readOnly=true, propagation=Propagation.NOT_SUPPORTED)
	public List<historyView> findById(Long userId){
		Query query = em.createQuery("select o from history o where o.userId =?1")
		.setParameter("1", userId);
		List<history> historyList = query.getResultList();
		List<historyView> historyViewList = new ArrayList<>();
		if(historyList != null && historyList.size() >0){
			for(history his : historyList){
				historyView historyView = new historyView();
				historyView.setId(his.getId());
				historyView.setViewTime(his.getViewTime());
				if(his.getType()==1){
					Topic topic = topicService.findById(his.getViewId());
					historyView.setTitle(topic.getTitle());
					historyView.setType(String.valueOf(his.getType()));
					historyView.setSummary(topic.getSummary());
				} else if (his.getType()==2) {
					Question question = questionService.findById(his.getViewId());
					historyView.setTitle(question.getTitle());
					historyView.setType(String.valueOf(his.getType()));
					historyView.setSummary(question.getSummary());
				}
				historyViewList.add(historyView);
			}
		}
		return historyViewList;
	}

	public void saveHistory(history history){
		this.save(history);
	}

}

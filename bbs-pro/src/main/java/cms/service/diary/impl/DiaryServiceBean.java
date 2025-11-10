package cms.service.diary.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;
import javax.persistence.Query;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import cms.bean.QueryResult;
import cms.bean.diary.Diary;
import cms.service.besa.DaoSupport;
import cms.service.diary.DiaryService;

/**
 * 日记
 *
 */
@Service
@Transactional
public class DiaryServiceBean extends DaoSupport<Diary> implements DiaryService{
	private static final Logger logger = LogManager.getLogger(DiaryServiceBean.class);
	
	/**
	 * 根据Id查询日记
	 * @param diaryId 日记Id
	 * @return
	 */
	@Transactional(readOnly=true, propagation=Propagation.NOT_SUPPORTED)
	public Diary findById(Long diaryId){
		Query query = em.createQuery("select o from Diary o where o.id=?1")
		.setParameter(1, diaryId);
		List<Diary> list = query.getResultList();
		for(Diary p : list){
			return p;
		}
		return null;
	}
	
	/**
	 * 分页查询日记
	 * @param userName 用户名称
	 * @param postTime 日记发表时间（不再使用此参数）
	 * @param firstIndex 开始索引
	 * @param maxResult 需要获取的记录数
	 * @return
	 */
	@Transactional(readOnly=true,propagation=Propagation.NOT_SUPPORTED)
	public List<Diary> findDiaryByPage(String userName, Date postTime, int firstIndex, int maxResult){
		List<Diary> diaryList = new ArrayList<Diary>();
		
		// 查询已发布的日记，并按时间排序
		String sql = "select o from Diary o where o.userName=?1 and o.status < ?2 order by o.postTime desc";

		Query query = em.createQuery(sql);	
		query.setParameter(1, userName);
		query.setParameter(2, 100); // status < 100 表示未删除的记录
		//索引开始,即从哪条记录开始
		query.setFirstResult(firstIndex);
		//获取多少条数据
		query.setMaxResults(maxResult);
			
		List<Diary> diaryList_result = query.getResultList();
		if(diaryList_result != null){
			return diaryList_result;
		}
		return diaryList;
	}
	
	/**
	 * 查询用户的日记数量
	 * @param userName 用户名称
	 * @return
	 */
	@Transactional(readOnly=true,propagation=Propagation.NOT_SUPPORTED)
	public Long findDiaryCount(String userName){
		Query query = em.createQuery("select count(o) from Diary o where o.userName=?1 and o.status < ?2");
		query.setParameter(1, userName);
		query.setParameter(2, 100);
		return (Long)query.getSingleResult();
	}
	
	/**
	 * 查询用户的记录天数
	 * @param userName 用户名称
	 * @return
	 */
	@Transactional(readOnly=true,propagation=Propagation.NOT_SUPPORTED)
	public Long findRecordDays(String userName){
		// 使用 DATE 函数获取日期部分，然后去重统计
		String sql = "SELECT COUNT(DISTINCT DATE(o.postTime)) FROM Diary o WHERE o.userName=?1 AND o.status < ?2";
		Query query = em.createNativeQuery(sql);
		query.setParameter(1, userName);
		query.setParameter(2, 100);
		Object result = query.getSingleResult();
		if(result instanceof Long){
			return (Long)result;
		}else{
			return ((Number)result).longValue();
		}
	}
	
	/**
	 * 查询用户的总字数
	 * @param userName 用户名称
	 * @return
	 */
	@Transactional(readOnly=true,propagation=Propagation.NOT_SUPPORTED)
	public Long findTotalWords(String userName){
		Query query = em.createQuery("select sum(o.wordCount) from Diary o where o.userName=?1 and o.status < ?2");
		query.setParameter(1, userName);
		query.setParameter(2, 100);
		Object result = query.getSingleResult();
		if(result != null){
			return ((Number)result).longValue();
		}
		return 0L;
	}
	
	/**
	 * 保存日记
	 * @param diary
	 */
	public void saveDiary(Diary diary){
		this.save(diary);
	}
	
	/**
	 * 修改日记
	 * @param diary
	 * @return
	 */
	public Integer updateDiary(Diary diary){
		Query query = em.createQuery("update Diary o set o.title=?1, o.content=?2,o.summary=?3,o.status=?4,o.lastUpdateTime=?5,o.wordCount=?6 where o.id=?7")
		.setParameter(1, diary.getTitle())
		.setParameter(2, diary.getContent())
		.setParameter(3, diary.getSummary())
		.setParameter(4, diary.getStatus())
		.setParameter(5, diary.getLastUpdateTime())
		.setParameter(6, diary.getWordCount())
		.setParameter(7, diary.getId());
		int i = query.executeUpdate();
		return i;
	}
	
	/**
	 * 删除日记
	 * @param diaryId 日记Id
	 * @return
	 */
	public Integer deleteDiary(Long diaryId){
		int i = 0;
		Query delete = em.createQuery("delete from Diary o where o.id=?1")
		.setParameter(1, diaryId);
		i = delete.executeUpdate();
		return i;
	}
	
	/**
	 * 修改日记状态
	 * @param diaryId 日记Id
	 * @param status 状态
	 * @return
	 */
	public int updateDiaryStatus(Long diaryId, Integer status){
		Query query = em.createQuery("update Diary o set o.status=?1 where o.id=?2")
				.setParameter(1, status)
				.setParameter(2, diaryId);
		return query.executeUpdate();
	}
}


package cms.service.diary;

import java.util.Date;
import java.util.List;

import cms.bean.QueryResult;
import cms.bean.diary.Diary;
import cms.service.besa.DAO;

/**
 * 日记
 *
 */
public interface DiaryService extends DAO<Diary>{
	/**
	 * 根据Id查询日记
	 * @param diaryId 日记Id
	 * @return
	 */
	public Diary findById(Long diaryId);
	/**
	 * 分页查询日记
	 * @param userName 用户名称
	 * @param postTime 日记发表时间
	 * @param firstIndex 开始索引
	 * @param maxResult 需要获取的记录数
	 * @return
	 */
	public List<Diary> findDiaryByPage(String userName, Date postTime, int firstIndex, int maxResult);
	/**
	 * 查询用户的日记数量
	 * @param userName 用户名称
	 * @return
	 */
	public Long findDiaryCount(String userName);
	/**
	 * 查询用户的记录天数
	 * @param userName 用户名称
	 * @return
	 */
	public Long findRecordDays(String userName);
	/**
	 * 查询用户的总字数
	 * @param userName 用户名称
	 * @return
	 */
	public Long findTotalWords(String userName);
	/**
	 * 保存日记
	 * @param diary
	 */
	public void saveDiary(Diary diary);
	/**
	 * 修改日记
	 * @param diary
	 * @return
	 */
	public Integer updateDiary(Diary diary);
	/**
	 * 删除日记
	 * @param diaryId 日记Id
	 * @return
	 */
	public Integer deleteDiary(Long diaryId);
	/**
	 * 修改日记状态
	 * @param diaryId 日记Id
	 * @param status 状态
	 * @return
	 */
	public int updateDiaryStatus(Long diaryId, Integer status);
}


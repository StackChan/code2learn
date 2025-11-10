package cms.service.history;

import cms.bean.history.history;
import cms.bean.history.historyView;
import java.util.List;

import cms.bean.help.Help;
import cms.service.besa.DAO;

/**
 * 帮助管理
 *
 */
public interface HistoryService extends DAO<history>{

	/**
	 * 根据分类Id查询帮助
	 * @param helpTypeId 帮助分类Id
	 * @return
	 */
	public List<historyView> findById(Long userId);
	/**
	 * 保存帮助
	 * @param help
	 */
	public void saveHistory(history history);
}

package cms.bean.history;

import java.util.Date;
import lombok.Data;

@Data
/**
 * @author YANG FUCHAO
 * @date  2025/3/28 20:50
 * @version 1.0
 */
public class historyView {

  private Long id;
  private Long viedId;
  private String type;
  private String title;
  private String summary;
  private Date viewTime;
}


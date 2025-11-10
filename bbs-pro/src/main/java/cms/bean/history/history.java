package cms.bean.history;

/**
 * @author YANG FUCHAO
 * @version 1.0
 * @date 2025/3/28 20:42
 */

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 历史记录
 */
@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class history implements Serializable {

  private static final long serialVersionUID = 1L;

  /**
   * 用户名
   */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * 用户名
   */
  private Long userId;

  /**
   * 用户名
   */
  private Long viewId;

  /**
   * 用户名
   */
  private Integer type;

  /**
   * 用户名
   */
  @Temporal(TemporalType.TIMESTAMP)
  private Date viewTime;

}

package cms.bean.diary;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

/**
 * 日记
 *
 */
@Entity
@Table(indexes = {@Index(name="diary_idx", columnList="userName,status"),@Index(name="diary_2_idx", columnList="userName,postTime")})
public class Diary implements Serializable{
	private static final long serialVersionUID = 1L;
	
	/** Id **/
	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	/** 标题 **/
	@Column(length=190)
	private String title;
	
	/** 日记内容 **/
	@Lob
	private String content;
	/** 内容摘要 **/
	@Lob
	private String summary;
	
	/** 发表时间 **/
	@Temporal(TemporalType.TIMESTAMP)
	private Date postTime = new Date();
	/** 最后修改时间 **/
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastUpdateTime;
	
	/** 用户名称 **/
	@Column(length=30)
	private String userName;
	
	/** 是否为员工 true:员工  false:会员 **/
	private Boolean isStaff = false;
	
	/** 状态 10.待审核 20.已发布 110.待审核删除 120.已发布删除 **/
	private Integer status = 10;
	
	/** 字数统计 **/
	private Long wordCount = 0L;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getSummary() {
		return summary;
	}
	public void setSummary(String summary) {
		this.summary = summary;
	}
	public Date getPostTime() {
		return postTime;
	}
	public void setPostTime(Date postTime) {
		this.postTime = postTime;
	}
	public Date getLastUpdateTime() {
		return lastUpdateTime;
	}
	public void setLastUpdateTime(Date lastUpdateTime) {
		this.lastUpdateTime = lastUpdateTime;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public Boolean getIsStaff() {
		return isStaff;
	}
	public void setIsStaff(Boolean isStaff) {
		this.isStaff = isStaff;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public Long getWordCount() {
		return wordCount;
	}
	public void setWordCount(Long wordCount) {
		this.wordCount = wordCount;
	}
	
}


import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Button,
  Input,
  Table,
  notification,
  Switch,
  Modal,
  Select,
  Upload,
  Steps,
  Icon,
  Row,
  Form
} from 'antd'
import { CCIFormItem } from '../../../component/form'
import './index.less'
import {
  TYPE_SYSTEM,
  SUCCESS,
  DMS_PREFIX
} from '../../../common/constant'
import {
  STRATEGY_STATUS
} from '../../../common/case'
import { buildUrlParam, buildUrlParamNew, decisionModalError, formatDate } from '../../../util'
import {
  getRuleSetList,
  activeRuleSet,
  deleteRuleSet,
  onOfflineRuleSet,
  copyRuleSet,
  getAppSelect,
  getMatchModeSelect,
  getBusinessList,
  dependenciesRule,
  strategyInput,
  strategyCheck,
  strategyInputCheck,
  strategyInputCheckName
} from '../../../action/rule'
import { fromJS, is, Map } from 'immutable'
import LayoutRight from '../../../component/layout_right'

const { Step } = Steps
const confirm = Modal.confirm
const Option = Select.Option
const { Item: FormItem } = Form
let nameMap = {
  ScenarioDic: '场景校验',
  BasicField: '字段校验',
  Factor: '指标校验',
  Decision: '决策结果校验',
  Blacklist: '名单列表校验'
}
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

class RuleCollection extends Component {
  state = {
    ruleSetType: TYPE_SYSTEM,
    noticeInfo: {
      id: '',
      noticeVisible: false,
      noticeContent: '',
      operation: ''
    },
    searchID: '',
    searchName: '',
    isValid: 1,
    ruleSetList: [],
    selectedRowKeys: [],
    record: {},
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    getRuleSetList: PropTypes.func.isRequired,
    getBusinessList: PropTypes.func.isRequired,
    businessLine: PropTypes.any,
    riskPolicyList: PropTypes.array,
    activeRuleSet: PropTypes.func.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    // getSceneSelect: PropTypes.func.isRequired,
    copyRuleSet: PropTypes.func.isRequired,
    onOfflineRuleSet: PropTypes.func.isRequired,
    deleteRuleSet: PropTypes.func.isRequired,
    getMatchModeSelect: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    if (!is(fromJS(nextProps.location), fromJS(this.props.location))) {
      const { state = {} } = nextProps.location
      const { searchID = '', searchName = '', current = 1, pageSize = 10 } = state
      this.setState({
        searchID,
        searchName,
        current,
        pageSize
      }, () => {
        this.doSearch()
      })
    } else {
      this.doSearch()
    }
  }

  componentDidMount() {
    const { state = {} } = this.props.location
    this.props.getBusinessList()
    if (state) {
      const { searchID = '', searchName = '', current = 1, pageSize = 10 } = state
      this.setState({
        searchID,
        searchName,
        current,
        pageSize
      }, () => {
        this.loadLists()
      })
    } else {
      this.loadLists()
    }
  }

  render() {
    const { form, businessLine = [] } = this.props
    const { getFieldProps } = form
    const {
      pagination, ruleSetList, selectedRowKeys, noticeInfo,
      searchName, selectBusinessId, stepsCurrent = 0, uploadCheckActive = false,
      decisionValidationResp: { isMatching = true } = {},
      copyVisible = false, copyRecord: { name = '' } = {}
    } = this.state
    console.log('ruleSetList', ruleSetList, pagination)
    const { noticeVisible, noticeContent } = noticeInfo
    const columns = [{
      title: '规则集编码',
      dataIndex: 'strategyCode',
      key: 'strategyCode'
    }, {
      title: '规则集名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text, record) => {
        return (<div className="text-overflow" style={{ width: 104 }}
                     title={text}>{text}</div>)
      }
    }, {
      title: '业务条线',
      dataIndex: 'businessLineName',
      key: 'businessLineName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 50
    }, {
      title: '规则数',
      dataIndex: 'ruleNum',
      key: 'ruleNum',
      render: (text, record) => {
        const { strategyStatus } = record
        const isView = strategyStatus !== 'EDITING'
        return <div style={{ cursor: 'pointer' }} onClick={() => this.onRuleSetEdit(record, isView)}>{text}</div>
      }
    }, {
      title: '激活',
      dataIndex: 'activeStatus',
      key: 'activeStatus',
      render: (text, record) => {
        const { strategyStatus, loading } = record
        const checked = strategyStatus !== 'EDITING'
        return <Switch style={{ width: 55 }} loading={loading} onChange={() => this.onChangeActive(record)}
                       checked={checked}
                       checkedChildren="ON"
                       unCheckedChildren="OFF" />
      }
    }, {
      title: '状态',
      dataIndex: 'strategyStatus',
      key: 'strategyStatus',
      render: (text) => {
        return this.getStrategyStatusText(text)
      }
    }, {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text) => {
        return text != null ? formatDate(text) : '-'
      }
    }, {
      title: '操作',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        const { strategyStatus: status } = record
        const isEditing = status === 'EDITING'
        const isActive = status === 'ACTIVE'
        const isOnline = status === 'ONLINE'
        return <Fragment>
          {
            isEditing ? <span className="operation-span" onClick={() => this.onRuleSetEdit(record)}>编辑</span>
              : <span className="operation-span" onClick={() => this.onRuleSetEdit(record, true)}>查看</span>
          }
          {
            isEditing ? null : <span className="operation-span" onClick={() => this.confirmCopy(record)}>复制</span>
          }
          {
            isEditing ? <span className="operation-span" onClick={() => this.showDelNotice(record)}>删除</span>
              : null
          }
          {
            isActive ? <span className="operation-span" onClick={() => this.onLineRuleSet(record)}>上线</span>
              : isOnline ? <span className="operation-span" onClick={() => this.offLineRuleSet(record)}>下线</span>
              : null
          }
        </Fragment>
      }
    }]

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }

    let footer = [
      <Button type="primary" onClick={this.nextUpload}>下一步</Button>
    ]
    if (stepsCurrent === 1) {
      footer = [
        <Button onClick={() => {
          this.setState({ stepsCurrent: stepsCurrent - 1 })
        }}>上一步</Button>,
        <Button type="primary" disabled={!uploadCheckActive || !isMatching} onClick={this.uploadCheckOk}>完成</Button>
      ]
    }
    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Input placeholder="规则集编码/规则集名称" style={{ width: 200 }} value={searchName} onChange={this.onInputName} />
          <Select placeholder="请选择业务条线" style={{ width: 200 }} allowClear value={selectBusinessId}
                  onChange={this.selectBusiness}>
            {
              businessLine.map(item => {
                return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
              })
            }
          </Select>
          <Button type="primary" onClick={this.filterData} style={{ marginRight: '10px' }}>查询</Button>
          <Button type="default" onClick={this.resetData}>重置</Button>
          <div style={{ float: 'right' }}>
            <Button type="primary" onClick={this.newRuleCollection}>新建</Button>
            <Button type="default" disabled={selectedRowKeys.length === 0} onClick={this.exportRules}>导出</Button>
            <Button type="default" onClick={this.importRules}>导入</Button>
          </div>
        </div>
        <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
          <Table rowKey="rulesetId" locale={{ emptyText: '暂无数据' }}
                 rowSelection={rowSelection} columns={columns}
                 pagination={pagination}
                 dataSource={ruleSetList}
                 onChange={this.handleChange} />
        </div>
        <Modal
          title="提示"
          visible={noticeVisible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.cancelNoticeWindow}
          onOk={this.okNoticeWindow}
        >
          {noticeContent}
        </Modal>
        <Modal
          title="规则集复制"
          visible={copyVisible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.copyCancel}
          onOk={this.copyRuleSet}
        >
          <Form>
            <Row className="form-row-item">
              <FormItem {...formItemLayout} label="规则集名称">
                <Input {...getFieldProps('ruleSetName', {
                  initialValue: name,
                  validate: [{
                    rules: [
                      { required: true, whitespace: true, message: '最多50个字符' }
                    ]
                  }]
                })} placeholder="最多50个字符" maxLength="50" />
              </FormItem>
            </Row>
          </Form>
        </Modal>
        <Modal
          title="导入规则集"
          visible={this.state.importRulesShow}
          centered
          okText="确认"
          cancelText="取消"
          width={740}
          onCancel={() => {
            this.setState({
              importRulesShow: false,
              fileList: [],
              fileUrl: '',
              stepsCurrent: 0,
              dependenceCheckResult: {},
              strategyNameValidation: {}
            })
          }}
          footer={footer}
          className={'upload-modal'}
        >
          <Steps style={{ width: '80%' }} current={stepsCurrent}>
            <Step title="导入文件" />
            <Step title="信息校验" />
          </Steps>
          {this.renderUploadBox()}
        </Modal>
      </LayoutRight>
    )
  }

  renderUploadBox = () => {
    const { riskPolicyList = [] } = this.props
    const {
      stepsCurrent = 0,
      fileList = [],
      fileUrl = '',
      cciFormValidate = {},
      decisionValidationResp: { isMatching = true, importDecisionList = [] } = {},
      dependenceCheckResult = {},
      strategyNameValidation = {}
    } = this.state
    const props = {
      beforeUpload: (file) => {
        this.setState({
          fileUrl: file.name,
          fileList: [file]
        })
        return false
      },
      fileList: []
    }
    console.log('fileList', fileList)
    const { isDuplicated = false, strategyName = '' } = strategyNameValidation
    const err = <Icon style={{ color: '#D0021B', marginLeft: 10 }} type="close" />
    const succ = <Icon style={{ color: '#7ED321', marginLeft: 10 }} type="check" />
    if (stepsCurrent === 0) {
      return <div className={'upload-box'}>
        <CCIFormItem label={'文件'} labelStyle={{ width: '55px' }} required colon validate={cciFormValidate}>
          <Input disabled value={fileUrl} style={{ width: '250px', marginRight: '10px' }} />
          <Upload {...props}><Button type="primary">选择文件</Button></Upload>
        </CCIFormItem>
      </div>
    } else if (stepsCurrent === 1) {
      return <div className={'upload-box'}>
        <div className={'check-item'}>
          <div className="check-item-title">
            规则集校验
            {
              isDuplicated ? err : succ
            }
          </div>
          {
            isDuplicated ? <div className="check-item-content">
              1、名称重复 <Input value={strategyName} onChange={this.uploadChangeName}
                            style={{ width: '250px', marginRight: '10px' }} maxLength={50} /> <Button
              type="primary" onClick={this.checkName}>检查</Button>
            </div> : null
          }
        </div>
        <div className={'check-item'}>
          <div className="check-item-title">
            决策结果校验
            {
              !isMatching ? err : succ
            }
          </div>
          {
            !isMatching ? <div className="check-item-content" style={{ width: 500, paddingLeft: 10 }}>
              <div className="header">
                <div className="half">原决策结果</div>
                <div className="half">现决策结果</div>
              </div>
              {
                importDecisionList.map((importDecision, i) => {
                  const { decisionName = '', decisionCode = '' } = importDecision
                  return <div className="row">
                    <div className="half">{decisionName}</div>
                    <div className="half">
                      <Select placeholder="请选择" style={{ width: '100%' }} allowClear
                              onChange={e => this.selectStrategyResult(e, decisionCode)}>
                        {
                          riskPolicyList.map(riskPolicy => {
                            const { decisionName, decisionCode } = riskPolicy
                            return (
                              <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                            )
                          })
                        }
                      </Select>
                    </div>
                  </div>
                })
              }
            </div> : null
          }
        </div>
        {
          Object.keys(nameMap).map((key) => {
            const isSucc = dependenceCheckResult[key]
            return <div className={'check-item'} key={key}>
              <div className="check-item-title">
                {nameMap[key]}
                {
                  isSucc ? err : succ
                }
              </div>
              {isSucc ? <div style={{ paddingLeft: '20px' }}>
                {
                  dependenceCheckResult[key].list.map((item, index) => {
                    return <div key={index}>{index + 1}、{item}</div>
                  })
                }
              </div> : null
              }
            </div>
          })
        }
      </div>
    }
  }

  selectStrategyResult = (value, decisionCode) => {
    let {
      decisionValidationResp = {},
      decisionResultParam = {}
    } = this.state
    const { importDecisionList = [] } = decisionValidationResp
    if (value) {
      decisionResultParam = { ...decisionResultParam, [decisionCode]: value }
    } else {
      delete decisionResultParam[decisionCode]
    }
    this.setState({
      decisionResultParam,
      decisionValidationResp: {
        ...decisionValidationResp,
        isMatching: Object.keys(decisionResultParam).length === importDecisionList.length
      }
    })
  }

  checkName = () => {
    let { strategyNameValidation = {}, dependenceCheckResultSrc = [], uploadCheckActive } = this.state

    strategyInputCheckName(strategyNameValidation.strategyName).then(res => {
      strategyNameValidation.isDuplicated = false
      if (dependenceCheckResultSrc.length === 0) {
        uploadCheckActive = true
      }
      this.setState({ strategyNameValidation, uploadCheckActive })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  uploadCheckOk = () => {
    const { fileList = [], strategyNameValidation, decisionResultParam = {} } = this.state
    const { strategyName = '' } = strategyNameValidation

    let cciFormValidate = { err: false }
    if (fileList.length === 0) {
      cciFormValidate = { err: true, msg: '请选择文件' }
      this.setState({
        cciFormValidate
      })
      return
    }
    const formData = new window.FormData()
    fileList.forEach((file) => {
      formData.append('file', file)
    })
    formData.append('strategyName', strategyName)
    if (Object.keys(decisionResultParam).length > 0) {
      let matchingInfo = ''
      Object.keys(decisionResultParam).forEach(k => {
        matchingInfo = `${matchingInfo}${k}:${decisionResultParam[k]},`
      })
      formData.append('matchingInfo', matchingInfo.substr(0, matchingInfo.length - 1))
    }
    this.setState({
      uploading: true,
      cciFormValidate
    })
    strategyInput(formData).then(res => {
      let { content = [] } = res
      if (content.length > 0) {
        decisionModalError(content, nameMap, { title: '导入校验未通过，请按照下述提示进行修改:' })
      } else {
        notification.success({ message: '导入成功' })
        this.setState({ importRulesShow: false, fileList: [], fileUrl: '', stepsCurrent: 0, decisionResultParam: {} })
        this.filterData()
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  uploadChangeName = (e) => {
    let { strategyNameValidation = {} } = this.state
    strategyNameValidation.strategyName = e.target.value
    this.setState({ strategyNameValidation })
  }
  nextUpload = () => {
    const { fileList = [] } = this.state
    let cciFormValidate = { err: false }
    if (fileList.length === 0) {
      cciFormValidate = { err: true, msg: '请选择文件' }
      this.setState({
        cciFormValidate
      })
      return
    }
    const formData = new window.FormData()
    fileList.forEach((file) => {
      formData.append('file', file)
    })
    this.setState({
      uploading: true,
      cciFormValidate
    })
    strategyInputCheck(formData).then(res => {
      let { content = [] } = res
      console.log('strategyInputCheck', content)
      const { decisionValidationResp = {}, dependenceCheckResult = [], strategyNameValidation = {} } = content
      let uploadCheckActive = false
      if (dependenceCheckResult.length === 0 && !strategyNameValidation.isDuplicated) {
        uploadCheckActive = true
      }
      let map = {}
      dependenceCheckResult.forEach(item => {
        const { dependencePath, dependenceType } = item
        if (!map[dependenceType]) {
          map[dependenceType] = {
            type: dependenceType,
            list: []
          }
        }
        map[dependenceType].list.push(dependencePath)
      })
      this.setState({
        stepsCurrent: 1,
        uploadCheckActive,
        dependenceCheckResultSrc: dependenceCheckResult,
        decisionValidationResp,
        dependenceCheckResult: map,
        strategyNameValidation
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  importRules = () => {
    this.setState({ importRulesShow: true })
  }

  exportRules = () => {
    const { selectedRowKeys = [] } = this.state
    const data = {
      ids: selectedRowKeys.join(','),
      strategyType: 'RULE_SET'
    }
    strategyCheck(data).then(res => {
      window.location.href = `/${DMS_PREFIX}/strategy/export?${buildUrlParam(data)}`
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }

  resetData = () => {
    this.setState({ searchName: '', selectBusinessId: undefined })
  }
  newRuleCollection = () => {
    const { searchID, searchName } = this.state
    const state = {
      searchID, searchName
    }
    this.props.history.push({ pathname: '/policy/bazaar/collection/new', state })
  }

  loadLists = () => {
    this.doSearch().then(() => {
      this.props.getAppSelect()
      // this.props.getSceneSelect()
      this.props.getMatchModeSelect()
    }).catch(() => {
    })
  }

  getStrategyStatusText = strategyStatus => {
    return STRATEGY_STATUS[strategyStatus]
  }

  copyCancel = () => {
    this.setState({
      copyVisible: false,
      copyRecord: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  confirmCopy = record => {
    this.setState({
      copyVisible: true,
      copyRecord: record
    }, () => {
      this.props.form.resetFields()
    })
  }

  copyRuleSet = async () => {
    try {
      const { copyRecord: { rulesetId: id = '' } = {} } = this.state
      this.props.form.validateFields(async (errors, values) => {
        if (errors) {
          return
        }
        try {
          let { ruleSetName } = values
          const { promise } = await this.props.copyRuleSet({ id, ruleSetName })
          promise.then((data) => {
            this.setState({
              selectedRowKeys: [],
              copyVisible: false,
              copyRecord: {}
            }, () => {
              this.doSearch()
            })
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } catch (err) {
          this.setState({ loading: false })
        }
      })
    } catch (err) {
    }
  }

  onLineOfflineRuleSet = async (data) => {
    const { UpLoading } = this.state
    if (UpLoading) {
      return
    }
    try {
      await this.setState({ UpLoading: true })
      const { promise } = await this.props.onOfflineRuleSet(data)
      promise.then((data) => {
        this.doSearch()
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      }).finally(() => {
        this.setState({ UpLoading: false })
      })
    } catch (err) {
    }
  }

  onLineRuleSet = (record) => {
    const { rulesetId } = record
    confirm({
      title: '上线当前规则集，会自动下线已上线规则集。是否继续？',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        this.onLineOfflineRuleSet({ id: rulesetId })
      },
      onCancel: () => {
        // this.cancelNoticeWindow()
      }
    })
  }

  offLineRuleSet = (record) => {
    const { rulesetId } = record
    dependenciesRule(buildUrlParamNew({ id: rulesetId })).then(res => {
      let { content = [] } = res
      if (content.length > 0) {
        decisionModalError(content)
      } else {
        this.onLineOfflineRuleSet({ id: rulesetId })
      }
    })
  }

  okNoticeWindow = async () => {
    const { noticeInfo } = this.state
    const { id: rulesetId, operation = '' } = noticeInfo
    console.log(noticeInfo)
    switch (operation) {
      case 'DEL':
        try {
          const { promise } = await
            this.props.deleteRuleSet({
              id: rulesetId
            })
          promise.then((data) => {
            const { actionStatus = '', content = {} } = data
            if (actionStatus === SUCCESS) {
              console.log(content)
              noticeInfo.id = ''
              noticeInfo.operation = ''
              noticeInfo.noticeVisible = false
              this.setState({ selectedRowKeys: [], noticeInfo }, () => {
                this.doSearch()
              })
            }
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } catch (err) {
        }
        break
      case 'COPY':
        this.copyRuleSet()
        break
      default:
        noticeInfo.noticeVisible = false
        this.setState({ noticeInfo })
    }
  }

  cancelNoticeWindow = () => {
    const { noticeInfo } = this.state
    noticeInfo.id = ''
    noticeInfo.operation = ''
    noticeInfo.noticeVisible = false
    this.setState({ noticeInfo })
  }

  onRuleSetEdit = (record, isView = false) => {
    const {
      rulesetId: ruleSetId, strategyStatus,
      activeStatus, description, matchMode, name, ruleNum, conditionNum,
      policyThresholds, scenarioName, scenarioValue, strategyCode, businessLineId
    } = record
    const { searchID, searchName, pagination } = this.state
    const { current, pageSize } = pagination
    const state = {
      ruleSetId,
      strategyStatus,
      searchID,
      searchName,
      activeStatus,
      description,
      matchMode,
      name,
      ruleNum,
      conditionNum,
      policyThresholds,
      scenarioName,
      scenarioValue,
      strategyCode,
      businessLineId,
      current,
      pageSize,
      isView
    }
    this.props.history.push({ pathname: '/policy/bazaar/collection/config', state })
  }

  showDelNotice = (record) => {
    const {
      rulesetId, ruleNum, conditionNum
    } = record
    let { noticeInfo } = this.state
    if (ruleNum > 0 || conditionNum > 0) {
      noticeInfo.noticeContent = `该规则集关联的${ruleNum}个规则，${conditionNum}个条件将被一并删除，确定删除吗？`
    } else {
      noticeInfo.noticeContent = '是否确认删除？'
    }
    noticeInfo.id = rulesetId
    noticeInfo.operation = 'DEL'
    confirm({
      title: noticeInfo.noticeContent,
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        this.okNoticeWindow()
      },
      onCancel: () => {
        this.cancelNoticeWindow()
      }
    })
    this.setState({ noticeInfo })
  }

  onChangeActive = async (record) => {
    // TODO missing logic 该规则集已过期，无法激活，请重新设置有效时间。
    try {
      const {
        ruleNum, conditionNum, rulesetId
      } = record
      if (ruleNum === 0) {
        this.setState({
          noticeInfo: {
            noticeVisible: true,
            noticeContent: <div>该规则集下有效规则为0，无法激活。<br />点击规则列表添加规则或等待审批完成。
            </div>
          }
        })
        return
      } else if (ruleNum > 0 && conditionNum === 0) {
        this.setState({
          noticeInfo: {
            noticeVisible: true,
            noticeContent: <div>该规则集下有效条件为0，无法激活。<br />点击规则列表在对应规则下添加条件或等待审批完成
            </div>
          }
        })
        return
      }
      const { ruleSetList } = this.state
      record.loading = true
      ruleSetList.forEach(item => {
        if (item.id === record.id) {
          item = record
        }
      })
      await this.setState({ ruleSetList })
      const { promise } = await this.props.activeRuleSet({
        id: rulesetId
      })
      promise.then((data) => {
        const { content = {} } = data
        console.log(content, record.activeStatus)
        const { ruleSetList, pagination: { current, pageSize } } = this.state
        record.loading = false
        ruleSetList.forEach(item => {
          if (item.id === record.id) {
            item = record
          }
        })
        this.setState({ ruleSetList, current, pageSize }, () => {
          this.doSearch()
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
        const { ruleSetList } = this.state
        record.loading = false
        ruleSetList.forEach(item => {
          if (item.id === record.id) {
            item = record
          }
        })
        this.setState({ ruleSetList })
      })
    } catch (err) {
    }

    console.log(record)
    // this.setState({ selectedRowKeys })
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.doSearch(pagination.current)
    })
  }

  doSearch = async (offset = 0) => {
    if (offset === 0) {
      try {
        const {
          searchID: rulesetId, searchName: name, isValid: isvalid, pagination,
          current, pageSize, selectBusinessId: businessLineId
        } = this.state
        const { promise } = await this.props.getRuleSetList(buildUrlParamNew({
          rulesetId,
          name,
          isvalid,
          businessLineId
        }))
        promise.then((data) => {
          const { actionStatus = '', content: ruleSetList = {} } = data
          if (actionStatus === SUCCESS) {
            ruleSetList.forEach((s, index) => {
              const { rulesetId } = s
              s.key = rulesetId
              ruleSetList[index] = s
            })
            pagination.current = current
            pagination.pageSize = pageSize
            this.setState({ pagination, ruleSetList })
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      } catch (err) {
      }
    }
  }

  onInputName = (e) => {
    this.setState({ searchName: e.target.value })
  }

  filterData = () => {
    this.doSearch()
  }
}

function mapStateToProps(state) {
  const { rule = Map({}), decision = Map({}) } = state
  const { businessLine = [] } = rule.toJS()
  const { riskPolicyList = [] } = decision.toJS()
  return { businessLine, riskPolicyList }
}

function mapDispatchToProps(dispatch) {
  return {
    getRuleSetList: bindActionCreators(getRuleSetList, dispatch),
    deleteRuleSet: bindActionCreators(deleteRuleSet, dispatch),
    onOfflineRuleSet: bindActionCreators(onOfflineRuleSet, dispatch),
    copyRuleSet: bindActionCreators(copyRuleSet, dispatch),
    activeRuleSet: bindActionCreators(activeRuleSet, dispatch),
    getAppSelect: bindActionCreators(getAppSelect, dispatch),
    getBusinessList: bindActionCreators(getBusinessList, dispatch),
    // getSceneSelect: bindActionCreators(getSceneSelect, dispatch),
    getMatchModeSelect: bindActionCreators(getMatchModeSelect, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleCollection))

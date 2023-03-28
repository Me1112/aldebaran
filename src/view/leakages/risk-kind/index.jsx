import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Select,
  Input,
  Table,
  Modal,
  Form,
  Row,
  notification,
  Checkbox,
  Switch,
  Radio,
  InputNumber
} from 'antd'
import LayoutRight from '@component/layout_right'
import {
  FACTOR_TEMPLATE_NEW_TYPES,
  FACTOR_TEMPLATE_TYPE_MAP
} from '@common/constant'

import {
  fetchRiskKindList,
  addRiskKind,
  delRiskKind,
  updateRiskKindActive,
  riskKindDependencies,
  updateRiskKind,
  fetchRiskMainCategoryList
} from '@action/leakage'
import { decisionModalError } from '@util'
import './index.less'

const { Option } = Select
const { Item: FormItem } = Form
const { confirm } = Modal
const UN_ACTIVED = 'UN_ACTIVED'
const ACTIVED = 'ACTIVED'

class RiskKind extends Component {
  state = {
    domainType: 'ANTI_LEAKAGE',
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: '',
    record: {},
    riskKindInfo: {},
    fieldSaveError: '',
    enumShow: false,
    enumList: [{}],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    form: PropTypes.any
  }

  componentDidMount() {
    this.loadRiskKinds()
    this.loadRiskMainCategoryList()
  }

  render() {
    const {
      riskKindInfo,
      fieldSaveError,
      isView = false,
      promptShow,
      promptMsg,
      loading = false,
      continued = false,
      domainType,
      ruleRiskCategory,
      keyword,
      dataSource = [],
      mainRiskList4Leakage = [],
      mainRiskList4Fraud = [],
      pagination
    } = this.state

    const columns = [
      {
        title: '领域',
        dataIndex: 'domainType',
        key: 'domainType',
        width: 120,
        onCell: (record) => {
          const { domainType } = record
          return { title: FACTOR_TEMPLATE_TYPE_MAP[domainType] }
        },
        render: (text) => {
          return FACTOR_TEMPLATE_TYPE_MAP[text]
        }
      }, {
        title: '规则风险大类',
        dataIndex: 'riskMainValue',
        key: 'riskMainValue',
        width: 140,
        onCell: (record) => {
          const { riskMainValue } = record
          return { title: riskMainValue }
        }
      }, {
        title: '规则风险小类',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        onCell: (record) => {
          const { name } = record
          return { title: name }
        }
      }, {
        title: '风险提示信息模板',
        dataIndex: 'riskTipInformation',
        key: 'riskTipInformation',
        width: '35%',
        onCell: (record) => {
          const { riskTipInformation } = record
          return { title: riskTipInformation }
        }
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 185
      }, {
        title: '激活',
        dataIndex: 'activeStatus',
        key: 'activeStatus',
        width: 90,
        render: (text, record) => {
          return <Switch style={{ width: 55 }} checkedChildren="ON" unCheckedChildren="OFF"
                         checked={record.activeStatus === ACTIVED}
                         onChange={(checked) => this.changeFieldActive(checked, record)} />
        }
      }, {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 110,
        render: (text, record) => {
          const isActive = record.activeStatus === ACTIVED
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record)
            }}>编辑</span>
            {
              !isActive && <span className="operation-span" onClick={() => {
                this.onDeleteIconClick(record)
              }}>删除</span>
            }
          </Fragment>
        }
      }]

    const {
      id,
      name: tName = '',
      riskMainKey: tRiskMainKey,
      tipNumber: tTipNumber = 'ONE',
      riskTipInformation: tRiskTipInformation,
      priority: tPriority = 10,
      domainType: tDomainType = 'ANTI_LEAKAGE',
      activeStatus: tActiveStatus
    } = riskKindInfo

    let mainRiskList4Condition = []
    switch (domainType) {
      case 'ANTI_LEAKAGE':
        mainRiskList4Condition = mainRiskList4Leakage
        break
      case 'ANTI_FRAUD':
        mainRiskList4Condition = mainRiskList4Fraud
        break
    }

    const readOnly = tActiveStatus === ACTIVED
    const antiFraudDisabled = tDomainType === 'ANTI_FRAUD' && id > 0
    const isAntiFraud = this.props.form.getFieldValue('domainType') === 'ANTI_FRAUD'

    let mainRiskList = []
    if (isAntiFraud) {
      mainRiskList = mainRiskList4Fraud
    } else {
      mainRiskList = mainRiskList4Leakage
    }

    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 }
    }
    const formTailLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16, offset: 7 }
    }

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select placeholder="领域" style={{ width: 200 }} value={domainType}
                  onChange={this.changeBusinessType}>
            {
              FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                return <Option key={type} value={type}>{FACTOR_TEMPLATE_TYPE_MAP[type]}</Option>
              })
            }
          </Select>
          <Select placeholder="规则风险大类" allowClear style={{ width: 200 }} value={ruleRiskCategory}
                  onChange={this.changeRiskCategory}>
            {
              mainRiskList4Condition.map(item => {
                const { riskMainKey, riskMainValue } = item
                return <Option key={riskMainKey} value={riskMainKey} title={riskMainValue}>{riskMainValue}</Option>
              })
            }
          </Select>
          <Input value={keyword} placeholder="规则风险小类" style={{ width: 200 }} onChange={this.changeKeyword} />
          <Button type="primary" onClick={this.onQuery}>查询</Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button type="primary" style={{ float: 'right' }} onClick={this.onCreateBtnClick}>新建</Button>
        </div>
        <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
          <Table className="ellipsis" rowKey="id" columns={columns} dataSource={dataSource} onChange={this.handleChange}
                 pagination={pagination} loading={loading} />
        </div>
        <Modal
          title="提示"
          wrapClassName="edit-confirm-modal"
          visible={promptShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={() => this.setState({ promptShow: false })}
          onOk={() => this.setState({ promptShow: false })}
        >
          {promptMsg}
        </Modal>
        <Modal
          title={`${id > 0 ? isView ? '查看' : '编辑' : '新建'}风险类型`}
          wrapClassName="leakage-risk-kind-modal"
          width={600}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onFieldSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="领域">
              <Select disabled={readOnly || antiFraudDisabled} {...getFieldProps('domainType', {
                initialValue: tDomainType,
                validate: [{
                  rules: [
                    { required: true, message: '请选择领域' }
                  ]
                }],
                onChange: this.domainTypeChange
              })} placeholder="请选择">
                {
                  FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                    return <Option key={type} value={type}>{FACTOR_TEMPLATE_TYPE_MAP[type]}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="规则风险小类">
              <Input {...getFieldProps('name', {
                initialValue: tName,
                validate: [{
                  rules: [
                    { required: true, message: '最多50个字符' }
                  ]
                }]
              })} placeholder="最多50个字符" maxLength="50" disabled={readOnly} />
            </FormItem>
            <FormItem {...formItemLayout} label="规则风险大类">
              <Select disabled={readOnly} {...getFieldProps('riskMainKey', {
                initialValue: tRiskMainKey,
                validate: [{
                  rules: [
                    { required: true, message: '请选择规则风险大类' }
                  ]
                }]
              })} placeholder="请选择">
                {
                  mainRiskList.map(item => {
                    const { riskMainKey, riskMainValue } = item
                    return <Option key={riskMainKey} value={riskMainKey} title={riskMainValue}>{riskMainValue}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="因子提示数量">
              <Radio.Group {...getFieldProps('tipNumber', {
                initialValue: tTipNumber,
                validate: [{
                  rules: [
                    { required: true }
                  ]
                }]
              })} placeholder="请选择">
                <Radio value="ONE">1个</Radio>
                <Radio value="TWO" disabled={isAntiFraud}>2个</Radio>
              </Radio.Group>
            </FormItem>
            <FormItem {...formItemLayout} label="风险提示信息模板">
              <Input.TextArea rows={6} {...getFieldProps('riskTipInformation', {
                initialValue: tRiskTipInformation,
                validate: [{
                  rules: [
                    { required: true, message: '最多255个字符' }
                  ]
                }]
              })} placeholder={`最多255个字符${isAntiFraud ? '' : '且包含【命中值】'}`} maxLength="255" />
            </FormItem>
            <FormItem {...formItemLayout} label="优先级">
              <InputNumber {...getFieldProps('priority', {
                initialValue: tPriority,
                validate: [{
                  rules: [
                    { required: true, message: '请输入优先级' }
                  ]
                }]
              })} min={1} max={9999.99} precision={2} step={0.1} />
            </FormItem>
            {
              !id && <FormItem {...formTailLayout} style={{ marginBottom: 0 }}>
                <Checkbox disabled={readOnly} {...getFieldProps('continued', {
                  initialValue: continued,
                  valuePropName: 'checked'
                })}>
                  连续添加
                </Checkbox>
              </FormItem>
            }
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  domainTypeChange = (e) => {
    this.props.form.resetFields(['name', 'riskMainKey', 'riskTipInformation'])
    this.props.form.setFields({
      tipNumber: {
        value: 'ONE'
      }
    })
    this.loadRiskMainCategoryList(e)
  }

  onQuery = () => {
    this.loadRiskKinds()
  }

  onReset = () => {
    this.setState({
      keyword: undefined,
      ruleRiskCategory: undefined,
      domainType: 'ANTI_LEAKAGE'
    }, () => {
      this.onQuery()
    })
  }

  loadRiskMainCategoryList = (dType) => {
    if (!dType) {
      const { domainType } = this.state
      dType = domainType
    }
    fetchRiskMainCategoryList({ domainType: dType }).then(res => {
      const { content = [] } = res
      let data = {}
      switch (dType) {
        case 'ANTI_LEAKAGE':
          data = { mainRiskList4Leakage: content }
          break
        case 'ANTI_FRAUD':
          data = { mainRiskList4Fraud: content }
          break
      }
      this.setState({ ...data })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadRiskKinds = (page = 1) => {
    const { pagination, domainType, ruleRiskCategory, keyword } = this.state
    const { pageSize: size } = pagination
    const data = {
      domainType,
      ruleRiskCategory,
      keyword,
      page,
      size
    }
    this.setState({
      loading: true
    })
    fetchRiskKindList(data).then(res => {
      const { content = {} } = res
      const { data = [], page = 1, total = 0 } = content
      if (data.length === 0 && page > 1) {
        // 用户非法操作 前端兼容处理
        this.loadRiskKinds()
        return
      }
      data.forEach(item => {
        const { id } = item
        item.key = id
      })
      pagination.total = total
      pagination.current = page
      this.setState({ dataSource: data, loading: false, pagination })
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  onCancel = () => {
    this.setState({
      enumAddVisible: false
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.loadRiskKinds(pagination.current)
    })
  }

  changeRiskCategory = e => {
    this.setState({ ruleRiskCategory: e })
  }

  changeBusinessType = e => {
    this.setState({ domainType: e, ruleRiskCategory: undefined, keyword: undefined }, () => {
      this.loadRiskMainCategoryList()
    })
  }

  changeKeyword = (e) => {
    this.setState({ keyword: e.target.value })
  }

  changeFieldActive = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.state
    if (checked) {
      updateRiskKindActive(record).then(res => {
        record.activeStatus = checked ? ACTIVED : UN_ACTIVED
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadRiskKinds(current)
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } else {
      riskKindDependencies({ id: record.id }).then(res => {
        const { content = [] } = res
        if (content.length === 0) {
          updateRiskKindActive(record).then(res => {
            record.activeStatus = checked ? ACTIVED : UN_ACTIVED
            this.setState({ editConfirmShow: false, loading: false }, () => {
              this.loadRiskKinds(current)
            })
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } else {
          const nameMapError = {
            BASIC_INFO_TYPE: '基础信息类型',
            RULE_TYPE: '规则类型'
          }
          decisionModalError(content, nameMapError, {
            title: '该风险类型正在被以下组件使用，无法进行此操作，请取消后重试。'
          })
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
  }

  onCreateBtnClick = () => {
    this.setState({
      editConfirmShow: true,
      riskKindInfo: {},
      fieldSaveError: '',
      enumShow: false,
      enumList: [{}]
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditIconClick = (riskKindInfo, editType = 'edit') => {
    this.setState({
      isView: editType === 'view',
      editConfirmShow: true,
      riskKindInfo
    }, () => {
      this.props.form.resetFields()
      this.props.form.validateFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      isView: false,
      isModify: false,
      editConfirmShow: false,
      riskKindInfo: {},
      enumShow: false,
      enumList: [{}],
      fieldSaveError: ''
    }, () => {
      this.props.form.resetFields()
    })
  }

  onFieldSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      this.setState({ loading: true })
      try {
        let { riskKindInfo = {}, pagination } = this.state
        const { id = '' } = riskKindInfo
        let { continued, priority, ...other } = values
        priority = Number(priority).toFixed(2)
        const isEdit = id > 0
        const postData = isEdit ? { id, priority, ...other } : { priority, ...other }
        const promise = isEdit ? updateRiskKind(postData) : addRiskKind(postData)
        promise.then((data) => {
          this.setState({ editConfirmShow: continued, loading: false }, () => {
            if (continued) {
              this.props.form.resetFields(['name', 'tipNumber', 'riskTipInformation'])
            }
            this.loadRiskKinds(isEdit ? pagination.current : 1)
          })
        }).catch((data) => {
          notification.warning(data.content)
          this.setState({ loading: false })
          // this.props.form.setFields({
          //   fieldDisplayName: {
          //     errors: [{
          //       message
          //     }]
          //   }
          // })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  onDeleteIconClick = (record) => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        this.onRiskKindDelete()
      },
      onCancel: () => {
        this.onFieldCancel()
      }
    })
    this.setState({
      // deleteConfirmShow: true,
      record
    })
  }

  onFieldCancel = () => {
    this.setState({
      deleteConfirmShow: false,
      fieldSaveError: ''
    })
  }

  onRiskKindDelete = async () => {
    const { record: { id } = {}, pagination } = this.state
    delRiskKind({ id }).then(res => {
      this.setState({
        deleteConfirmShow: false
      }, () => {
        this.loadRiskKinds(pagination.current)
      })
    }).catch((data) => {
      const { content = {} } = data
      const { message = '' } = content
      this.setState({
        deleteConfirmShow: false,
        promptShow: true,
        promptMsg: message
      })
    })
  }
}

export default Form.create()(RiskKind)

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import './index.less'

export default class RestoreInfo extends PureComponent {
  static propTypes = {
    restoreData: PropTypes.array.isRequired
  }

  render() {
    const { restoreData = [] } = this.props
    return (
      <div className="scene-restore">
        {
          restoreData.map((restore, index) => {
            const { title = '', info = [] } = restore
            return <div key={index} className="restore">
              <div className="header">
                {
                  title
                }
              </div>
              <div className="content">
                {
                  info.filter(item => item).filter(item => {
                    const { name, value } = item
                    const match = title === '基础信息' && name === '标记人姓名'
                    if (match) {
                      this.value = value
                    }
                    return !match
                  }).map((item, i) => {
                    const { name = '', value = '' } = item
                    const match = title === '基础信息' && name === '标记人'
                    let label = value
                    if (match) {
                      label = this.value
                    }
                    return <div key={i} className="item text-overflow" title={label}>
                      <div className="name">
                        {index === 3 ? `${i + 1}、` : ''}{name}
                      </div>
                      <div className="value">
                        : {value}
                      </div>
                    </div>
                  })
                }
              </div>
            </div>
          })
        }
      </div>
    )
  }

  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }
}

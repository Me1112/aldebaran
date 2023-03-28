import React from 'react'
import PropTypes from 'prop-types'
import { Breadcrumb } from 'antd'
import classnames from 'classnames'
import { Link } from 'react-router-dom'

function LayoutRight(props) {
  const { breadCrumb = [], children = null, className = '', type } = props
  return <div className={`${className} height100`}>
    <div className="cci-layout-bread-crumbs">
      <Breadcrumb>
        {
          breadCrumb.map((item, index) => {
            let url = ''
            let name = item
            let linkState = {}
            if (typeof item === 'object') {
              const { title, url: itemUrl, state } = item
              name = title
              url = itemUrl
              linkState = state
            }
            return url ? <Breadcrumb.Item key={index}><Link
                to={{ pathname: url, state: linkState }}>{name}</Link></Breadcrumb.Item>
              : <Breadcrumb.Item key={index}>{name}</Breadcrumb.Item>
          })
        }
      </Breadcrumb>
    </div>
    <div className={classnames('cci-layout-content', { 'cci-layout-content-tabs': type === 'tabs' })}>
      {children}
    </div>
  </div>
}

LayoutRight.propTypes = {
  children: PropTypes.any,
  className: PropTypes.any,
  type: PropTypes.any,
  breadCrumb: PropTypes.array
}
export default LayoutRight

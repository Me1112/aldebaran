import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import { formatNumber } from '../../util'

export default class CCIStatistic extends React.PureComponent {
  static propTypes = {
    className: PropTypes.any,
    type: PropTypes.any,
    style: PropTypes.any,
    title: PropTypes.any,
    value: PropTypes.any,
    valueStyle: PropTypes.object,
    prefix: PropTypes.any,
    formatValue: PropTypes.any,
    suffix: PropTypes.any
  }

  render() {
    let { suffix, prefix, value, title, valueStyle = {}, className = '', style = {}, type = 'auto', formatValue } = this.props
    if (type === 'auto') {
      if (value === '--') {
        valueStyle = { color: 'rgba(0,0,0,0.65)', ...valueStyle }
      } else if (value < 0) {
        if (prefix === undefined) prefix = <Icon type="arrow-down" />
        valueStyle = { color: '#7ED321 ', ...valueStyle }
      } else if (value >= 0) {
        if (prefix === undefined) prefix = <Icon type="arrow-up" />
        valueStyle = { color: '#D0021B', ...valueStyle }
      }
    }

    if (formatValue === true) {
      if (isNaN(value)) {
        value = 0
      }
      value = formatNumber(value)
    } else if (typeof formatValue === 'function') {
      value = formatValue(value)
    }
    return <span className={`cci-component-statistic ${className}`} style={style}>
      {title ? <span className="cci-component-statistic-title">
        {title}
      </span> : null}
      <span style={valueStyle}>
        {prefix ? <span className="cci-component-statistic-prefix">
        {prefix}
      </span> : null}
        {value !== undefined ? <span className="cci-component-statistic-value">
        {value}
      </span> : null}
        {suffix ? <span className="cci-component-statistic-suffix">
        {suffix}
      </span> : null}
      </span>
    </span>
  }
}

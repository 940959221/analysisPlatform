import React from 'react';
import { Link } from 'dva/router';
import PageHeader from 'ant-design-pro/lib/PageHeader';

export default ({
  children, wrapperClassName, top, ...restProps
}) => (
  <div className="snk-page-wapper">
    {top}
    <PageHeader key="pageheader" {...restProps} linkElement={Link} />
    {children ? <div className="snk-page-wapper-content">{children}</div> : null}
  </div>
);

import React, { createElement } from 'react';
import classNames from 'classnames';
import { Button } from 'snk-web';
import config from './typeConfig';
import styles from './index.less';

export default ({ className, linkElement = 'a', type, title, desc, img, actions, ...rest }) => {
  const pageType = type in config ? type : '404';
  const clsString = classNames(styles.exception, className);
  return (
    <div className={clsString} {...rest}>
      <div className={styles.imgBlock}>
        <div
          className={styles.imgEle}
          style={{ backgroundImage: `url(${img || config[pageType].img})` }}
        />
      </div>
      <div className={styles.content}>
        <h1>{title || config[pageType].title}</h1>
        <div className={styles.desc}>{desc || config[pageType].desc}</div>
        <div className={styles.actions}>
          {
            actions ||
            createElement('p', {
              // to: '/',
              // href: '/',
            },
              // <Button type="primary">返回首页</Button>
              <p style={{ fontSize: 20 }}>如果您访问的是正确地址，请先进行授权</p>)
          }
        </div>
      </div>
    </div>
  );
};

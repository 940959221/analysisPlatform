const ThemeConfig = {
  theme_a: {
    key: 'theme_a', // !style!css!
    Theme: () => { return import(/* webpackChunkName: "theme_a" */ '!style!css!./theme_a.css'); },
    color: '#0088CC',
  },
  theme_b: {
    key: 'theme_b',
    Theme: () => { return import(/* webpackChunkName: "theme_b" */ '!style!css!./theme_b.css'); },
    color: '#D5562C',
  },
  theme_c: {
    key: 'theme_c',
    Theme: () => { return import(/* webpackChunkName: "theme_c" */ '!style!css!./theme_c.css'); },
    color: '#4B544B',
  },
  theme_d: {
    key: 'theme_d',
    Theme: () => { return import(/* webpackChunkName: "theme_d" */ '!style!css!./theme_d.css'); },
    color: '#2F7307',
  },
};
// const ThemeConfig = {
//   theme_a: {
//     key: 'theme_a',
//     Theme: () => { return import(/* webpackChunkName: "theme_a" */ './theme_a.less'); },
//     color: '#0088CC',
//   },
//   theme_b: {
//     key: 'theme_b',
//     Theme: () => { return import(/* webpackChunkName: "theme_b" */ './theme_b.less'); },
//     color: '#D5562C',
//   },
//   theme_c: {
//     key: 'theme_c',
//     Theme: () => { return import(/* webpackChunkName: "theme_c" */ './theme_c.less'); },
//     color: '#4B544B',
//   },
//   theme_d: {
//     key: 'theme_d',
//     Theme: () => { return import(/* webpackChunkName: "theme_d" */ './theme_d.less'); },
//     color: '#2F7307',
//   },
// };

const ThemeMap = {};

export default {
  ThemeConfig,
  changeTheme: (key) => {
    const realKey = key || 'theme_a';
    window.localStorage.setItem('snk-theme', realKey);
    if (ThemeMap[realKey]) {
      window.location.reload();
    } else {
      const data = ThemeConfig[realKey] || ThemeConfig.theme_a;
      data.Theme().then(() => {
        ThemeMap[realKey] = true;
      }).catch(() => {
      });
    }
  },
};


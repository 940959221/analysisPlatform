export default {
  namespace: 'template',

  state: {
    list: [
      {
        templateId: 'db18f6b226d141901231231222228936e71275e2222ab81111111',
        templateCode: '0001',
        templateName: '车险保单',
        remark: '青岛',
        classify: ['车险', '招行掌上生活APP'],
        status: 0,
        createAt: new Date(),
      },
      {
        templateId: 'ni',
        templateCode: '0002',
        templateName: '车险投保单',
        remark: '北京',
        classify: ['车险', '恒大经纪'],
        status: 1,
        createAt: new Date(),
      },
    ],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: 5,
      total: 13,
    },
  },

  reducers: {

  },

  effects: {

  },
};

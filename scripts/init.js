var config = {
  _id: 'dbrs',
  version: 1,
  members: [
    {
      _id: 1,
      host: '27021:27017',
      priority: 2,
    },
    {
      _id: 2,
      host: '27022:27017',
      priority: 1,
    },
    {
      _id: 3,
      host: '27023:27017',
      arbiterOnly: true,
    },
  ],
};
rs.initiate(config, { force: true });

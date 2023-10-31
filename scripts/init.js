// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
var config = {
  _id: 'dbrs',
  version: 1,
  members: [
    {
      _id: 1,
      host: 'mongo-primary:27017',
      priority: 2,
    },
    {
      _id: 2,
      host: 'mongo-secondary:27017',
      priority: 1,
    },
    {
      _id: 3,
      host: 'mongo-arbiter:27017',
      arbiterOnly: true,
    },
  ],
};
rs.initiate(config, { force: true });

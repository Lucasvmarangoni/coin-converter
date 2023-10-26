const mongoUser = process.argv[2];
const mongoPwd = process.argv[3];
const mongoDatabase = process.argv[4];


// rs.addArb('27023:27017');
// rs.status();

db.createCollection(mongoDatabase)
db.createUser({
  user: mongoUser,
  pwd: mongoPwd,
  roles: [{ role: 'root', db: mongoDatabase }]
});


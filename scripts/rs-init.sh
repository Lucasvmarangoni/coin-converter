#!/bin/bash

DELAY=25

INIT_SCRIPT="/scripts/init.js"

execute_mongo_script() {
    local script_path=$1
    mongo < $script_path
}

delay_execution() {
    local delay=$1
    echo "➔ Waiting for ${delay} seconds for replicaset configuration to be applied"
    sleep $delay
}

echo "➔ Executing initialization script"
execute_mongo_script $INIT_SCRIPT

delay_execution $DELAY
echo "➔ DELAY FINISHED"

echo "➔ Creating database, and add roles"
mongo <<EOF
use $MONGO_DB
use admin
db.createRole( { role: "app", privileges: [ { resource: { cluster: true }, actions: [ "find", "update", "insert", "remove" ] }, ], roles: [ { role: "read", db: "admin" } ] }, { w: "majority", wtimeout: 5000 } )
exit
EOF

sleep 5

echo "➔ Creating user"
mongo $MONGO_DB --eval "try {db.createUser({ user: '$MONGO_USER', pwd: '$MONGO_PWD', roles: [] })} catch(err){}"

echo "➔ Time delay before checking the cluster status."
sleep 15

mongo --eval "rs.status()"

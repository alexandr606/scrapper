module.exports = {
    user: 'power_user', //env var: PGUSER
    database: 'sm', //env var: PGDATABASE
    password: 'dhjnvytyjub', //env var: PGPASSWORD
    host: 'ec2-52-59-53-178.eu-central-1.compute.amazonaws.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
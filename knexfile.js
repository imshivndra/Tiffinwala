

module.exports = {

  development: {
    client: 'pg',
    useNullAsDefault: true,
    migrations: {
      directory: './src/migrations'
    },
    seeds: {
      directory: './src/seeds'
    },
    connection: {
      host: "localhost",
      user: "postgres",
      password: "root",
      database: "TiffinWala"  // Create Database with same name on your local machine in postgres.
    }
  },
  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + `?ssl=true`,
    migrations: {
      directory: './src/migrations'
    },
    useNullAsDefault: true
  }
};

// this file connects to the remote prisma file and quesy it with js
const { Prisma } = require('prisma-binding');

const db = new Prisma({
    typeDefs:'src/generated/prisma.graphql',
    endpoint : process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    debug:false
});

module.exports = db;


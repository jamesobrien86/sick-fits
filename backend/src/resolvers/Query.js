const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    me(parent, args, ctx, info){
        // check if there is a curret user id
        if(!ctx.request.userId){        
            return null;
        }
        return ctx.db.query.user({
            where: {id: ctx.request.userId}
        }, info);
    },
    async users(parent, args, ctx, info){
        // 1. Check if they are logged in
        if(!ctx.request.userId){
            throw new Error("You must be logged in");
        }
        // 2. Check if the user has the permissions to
        hasPermission(ctx.request.user, ['USER', 'ADMIN', 'PERMISSIONUPDATE'] );
        // query all the users
        // 3. if they do, query all the users
        return ctx.db.query.users({}, info);
    }

};

module.exports = Query;

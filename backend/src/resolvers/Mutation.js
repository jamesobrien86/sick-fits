const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { hasPermission } = require('../utils');

const { transport, makeANiceEmail} = require('../mail');


const mutations = {
    async createItem(parent, args, ctx, info){
        // TODO: check if they are logged in
        if(!ctx.request.userId){
            throw new Error('You must be logged in to do that!');
        }

        const item = await ctx.db.mutation.createItem({
            data:{
                user:{
                    // this is how we create a relationship
                    // between the item and the user
                    connect: {
                        id: ctx.request.userId
                    }
                },
                ...args
            }
        }, info);

        return item;
    },

    updateItem(parent, args, ctx, info){
        // first take of a copy of updates
        const updates = { ...args };
        // remove the id from the updates
        delete updates.id;
        // run the update method
        return ctx.db.mutation.updateItem({
            data:updates,
            where:{
                id: args.id,
            },
        },
         info
        );
    },
    async deleteItem(parent, args, ctx, info){
        throw new Error("You're not allowed");
        const where = {id: args.id};
        // find item
        const item = await ctx.db.query.item({where}, `{ id title user { id }}`);
        // check if owned / permissons
        const ownsItem = item.user.id = ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(
            permission => ['ADMIN', 'ITEMDELETE'].includes(permission)
        )
        if(!ownsItem || !hasPermissions){
            throw new Error("You dont have permissions")
        }
        // delete item
        return ctx.db.mutation.deleteItem({ where }, info)
    },
    async signup(parent, args, ctx, info){
        
        // lower case emails
        args.email = args.email.toLowerCase();
        // hasf their password
        const password = await bcrypt.hash(args.password, 10);
        // create user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password,
                permissions: { set: ['USER']},
            },
        }, info);
        // create jwt token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // we set the jwt as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
        });
        // return user 
        return user;

    },

    async signin(parent, {email, password}, ctx, info){
        // check if user has that email
        const user = await ctx.db.query.user({ where: { email }});
        if(!user){
            throw new Error(`No Such user found for email ${email}`);
        }
        // check password is correct
        const valid = await bcrypt.compare(password, user.password);
        
        if(!valid){
            throw new Error(`Invalid Password`)
        }
        // generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        // set the cookie with token
        ctx.response.cookie('token', token , {
            httpOnly:true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // return user
        return user;
    },
    async signout(parent, args, ctx, info){
        ctx.response.clearCookie('token');
        return { message: 'Goodbye!'};
    },    
    async requestReset(parent, args, ctx, info){
       // check if real usre
       const user = await ctx.db.query.user({where: {email: args.email}})
       if(!user){
           throw new Error(`No such user found for email ${args.email}`);
       }
       //set reset token and expiry
       const randomBytesPromisified = promisify(randomBytes);
       const resetToken = (await randomBytesPromisified(20)).toString('hex');
       const resetTokenExpiry = Date.now() + 3600000;// one hour from now
       const res = await ctx.db.mutation.updateUser({
           where: { email: args.email},
           data: { resetToken, resetTokenExpiry}
       })
       // email reset token
       const mailRes = await transport.sendMail({
           from:'james@gmail.com',
           to:user.email,
           subject:'Your password reset',
           html: makeANiceEmail(`You PasswordReset token is here 
           \n\n
           <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}"></a>
           `)
       });
       // return message
       return {message: "Thanks"}
    },
    async resetPassword(parent, args, ctx, info){
        // check if password matchs

        if(args.password !== args.confirmPassword){
            throw new Error(`Your passwords don/'t match!`)
        }
        // check if is legit reset token
         // check if token expired
        const [user] = await ctx.db.query.users({
            where:{
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 360000
            }
        })

        if(!user){
            throw new Error('This token is either invalied or expired')
        }
        // Hash new password
        const password = await bcrypt.hash(args.password, 10);

         // save the new passowrd to the user and remove reset token
         const updatedUser = await ctx.db.mutation.updateUser({
             where: { email: user.email},
             data : {
                 password,
                 resetToken:null,
                 resetTokenExpiry:null
             }
         })

        // generate JWT

        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)

        // Set the JWT Cookie
         ctx.response.cookie('token', token, {
             httpOnly: true,
             maxAge: 1000 * 60 * 60 * 24 * 365
         })
        // return new User
        return updatedUser
    },
    async updatePermissions(parent, args, ctx, info){
        // 1. check if they are logged in
        if(!ctx.request.userId){
            throw new Error("You must be logged in")
        }
        // 2. Query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId,
            },
          },info
        )
        // 3. Check if they have permissions to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        // 4. Update the permissons
        return ctx.db.mutation.updateUser({
          data:{
            permissions: {
              set: args.permissions,
            }
          },
          where: {
            id: args.userId
          }
        },info)

    }


};

module.exports = mutations;

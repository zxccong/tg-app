import Rounter from 'koa-router';
import Redis from 'koa-redis';
import nodeMailer from 'nodemailer';
import User from '../dbs/models/users';
import Passport from './utils/passport';
import Email from '../dbs/config';
import axios from './utils/axios';

let router = new Rounter({
  prefix:'/users'
});

let Store = new Redis().client;

//注册接口
router.post('/signup', async (ctx) => {
  const {username, password, email, code} = ctx.request.body;

  if (code) {
    const saveCode = await Store.hget(`nodemail:${username}`, 'code')
    const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
    if (code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码已过期，请重新尝试'
        }
        return false
      }
    } else {
      ctx.body = {
        code: -1,
        msg: '请填写正确的验证码'
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
  }
  let user = await User.find({username})
  if (user.length) {
    ctx.body = {
      code: -1,
      msg: '已被注册'
    }
    return
  }
  let nuser = await User.create({username, password, email})
  if (nuser) {
    ctx.body = {
          code: 0,
          msg: '注册成功',
          user: nuser
        }
    let res = await axios.post('/users/signin', {username, password})
    if (res.data && res.data.code === 0) {
      ctx.body = {
        code: 0,
        msg: '注册成功',
        user: res.data.user
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'error'
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '注册失败'
    }
  }
})
// router.post('/signup',async (ctx)=> {
  // const {
  //   username,
  //   password,
  //   email,
  //   code
  // } = ctx.request.body;
//   window.console.log(`${ctx.request.body}`)
//
  // //验证验证码
  // if(code){
  //   const saveCode =await Store.hget(`nodemail:${username}`,'code');
  //   const saveExpire = await Store.hget(`nodemail:${username}`,'expire');
  //
  //   //是否和缓存中的验证码一致
  //   if (code===saveCode) {
  //     //是否超时
  //     if (new Date().getTime()-saveExpire>0){
  //       ctx.body={
  //         code:-1,
  //         msg: '验证码已过期，请重新尝试'
  //       }
  //       return false
  //     }
  //   }else {
  //     ctx.body={
  //       code:-1,
  //       msg: '验证码错误，请填写正确验证码'
  //     };
  //     return false
  //   }
  // }else {
  //   ctx.body={
  //     code:-1,
  //     msg: '请填写 验证码'
  //   };
  //   return false
  // }
  //
  // let user = await User.find({
  //   username
  // });
  // if (user.length){
  //   ctx.body={
  //     code:-1,
  //     msg: '用户名已被注册'
  //   };
  //   return;
  // }
  //
  // let nuser = await User.create({
  //   username,
  //   password,
  //   email
  // });
  //
  // if (nuser){
  //   let res = await  axios.post('/users/signin',{
  //     username,
  //     password
  //   });
  //   if (res.data &&res.data.code===0){
  //     ctx.body={
  //       code: 0,
  //       msg: '注册成功',
  //       user: res.data.user
  //     };
  //     return true
  //     //登录失败
  //   } else {
  //     ctx.body={
  //       code: -1,
  //       msg: 'error',
  //     };
  //     return false
  //   }
  //   //写库失败
  // }else {
  //   ctx.body={
  //     code: -1,
  //     msg: '注册失败',
  //   };
  //   return false
  // }
// })

//登录接口
router.post('/signin', async (ctx, next) => {
  return Passport.authenticate('local', function(err, user, info, status) {
    //是否有错误
    if (err) {
      ctx.body = {
        code: -1,
        msg: err
      }
    } else {
      //登录用户
      if (user) {
        ctx.body = {
          code: 0,
          msg: '登录成功',
          user
        }
        return ctx.login(user)
        //
      } else {
        ctx.body = {
          code: 1,
          msg: info
        }
      }
    }
    //传递参数
  })(ctx, next)
})

//验证码验证
router.post('/verify', async (ctx, next) => {
  let username = ctx.request.body.username
  const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
  //有设置过期时间，且未过期
  if (saveExpire && new Date().getTime() - saveExpire < 0) {
    ctx.body = {
      code: -1,
      msg: '验证请求过于频繁，1分钟内1次'
    }
    return false
  }
  let transporter = nodeMailer.createTransport({
    host: Email.smtp.host,
    port:587,
    secure:false,
    service: 'qq',
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  })
  let ko = {
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }
  //组装邮件
  let mailOptions = {
    from: `"认证邮件" <${Email.smtp.user}>`,
    to: ko.email,
    subject: '《基于Vue高仿团购网全栈实战》注册码',
    html: `您在《基于Vue高仿团购网全栈实战》中注册，您的邀请码是${ko.code}`
  }
  //发送邮件
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      //设置进redis
      Store.hmset(`nodemail:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
    }
  })
  ctx.body = {
    code: 0,
    msg: '验证码已发送，可能会有延时，有效期1分钟'
  }
})

//退出登录
router.get('/exit', async (ctx, next) => {
  await ctx.logout()
  //检查现在是不是登录状态
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 0
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})

//获取用户名
router.get('/getUser', async (ctx) => {
  if (ctx.isAuthenticated()) {
    const {username, email} = ctx.session.passport.user
    ctx.body={
      user:username,
      email
    }
  }else{
    ctx.body={
      user:'',
      email:''
    }
  }
})

export default router

<template>
<div class="m-user">
  <template v-if="user">
    欢迎您，<span class="username">{{user}}</span>
    [<nuxt-link to="/exit">退出</nuxt-link>]
  </template>
  <template v-else>
    <nuxt-link to="/login"
               class="login">立即登录</nuxt-link>
    <nuxt-link class="/register"
               to="/register">注册</nuxt-link>
  </template>
</div>
</template>

<script>
export default {
  data(){
    return{
      user: ''
    };
  },
  //异步调用，在页面加载完成后加载，不影响性能
  async mounted() {
    //第一种方式then接返回值，这是第二种方式
    //status格式返回格式是由$axios决定的
    const {status,data:{user}}=await this.$axios.get('/users/getUser')
    if(status===200){
      this.user =user
    }
  }
};
</script>

<style lang="scss">
  .m-user {
    .username {
      color: #31BBAC;
      cursor: pointer;
    }
    .login,
    .register {
      font-size: 12px;
      /*line-height: 40px;*/
      color: #999;
      margin: 0 5px;
      &.login {
        color: #31BBAC;
        margin: 0 5px 0 20px;
      }
      &:hover {
        color: #31BBAC;
      }
    }
  }
</style>

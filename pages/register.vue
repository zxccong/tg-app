<template>
  <div class="page-register">
    <article class="header">
      <!--<hearder>-->
        <a href="/"
           class="site-logo">1</a>
        <span class="login">
          <em class="bold">已有团购账号</em>
          <a href="/login">
            <el-button type="primary"
                       size="small">登录</el-button>
          </a>
        </span>
      <!--</hearder>-->
    </article>
    <section>
      <el-form ref="ruleForm"
               :model="ruleForm"
               :rules="rules"
               label-width="100px">
        <el-form-item label="昵称"
                      prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱"
                      prop="email">
          <el-input v-model="ruleForm.email"></el-input>
          <el-button size="mini" round
                     @click="sendMsg">发送验证码</el-button>
          <span class="status">{{statusMsg}}</span>
        </el-form-item>
        <el-form-item label="验证码"
                      prop="code">
          <el-input v-model="ruleForm.code"
                    maxlength="4"></el-input>
        </el-form-item>
        <el-form-item label="密码"
                      prop="pwd">
          <el-input v-model="ruleForm.pwd"
                    type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码"
                      prop="cpwd">
          <el-input v-model="ruleForm.cpwd"
                    type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="register">同意以下协议并注册</el-button>
          <div class="error">{{error}}</div>
        </el-form-item>
        <el-form-item>
          <nuxt-link class="f1" to="/protocols" target="_blank">
          《团购用户协议》
          </nuxt-link>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script>
import  CryptoJs from 'crypto-js';
export default {

  data(){
    return {
      statusMsg:'',
      error:'',
      ruleForm:{
        name:'',
        code:'',
        pwd:'',
        cpwd:'',
        email:''
      },
      rules:{
        name: [{
          required:true,type:'string',message:'请输入昵称',trigger:'blur'
        }],
        email:[{
          required:true,type:'email',message:'请输入邮箱',trigger:'blur'
        }],
        pwd:[{
          required:true,message:'创建密码',trigger:'blur'
        }],
        cpwd:[{
          required:true,message:'确认密码',trigger:'blur'
        },{
          validator:(rule,value,callback)=>{
            if (value===''){
              callback(new Error('请再次输入密码'));
            }else if (value!=this.ruleForm.pwd) {
              callback(new Error('两次输入密码不一样'));
            }else {
              callback();
            }
          },trigger:'blur'
        }]
      }
  };
  },
  methods:{
    sendMsg:function() {
      const self = this;
      let  namePass;
      let  emailPass;
      //timerid 是判断定时器是否跑完60s
      if (self.timerid) {
        return false;

      }
      //判断name的表单验证结果
      this.$refs['ruleForm'].validateField('name',(valid)=>{
        namePass = valid;
      });
      self.statusMsg='';
      if (namePass){
        return false;
      }

      //表单验证判断email
      this.$refs['ruleForm'].validateField('email',(valid)=>{
        emailPass = valid;
      });
      //有值表示不通过，
      if (!namePass&&!emailPass){
        //中文要转码
        self.$axios.post('/users/verify',{username:encodeURIComponent(self.ruleForm.name),
          email:self.ruleForm.email
        }).then(({status,data})=>{
          if (status === 200 && data&&data.code===0){
            let count = 60;
            self.statusMsg= `验证码已发送，剩余${count--}秒`;
            self.timerid = setInterval(function() {
              //定时更新消息
              self.statusMsg= `验证码已发送，剩余${count--}秒`;
              //当到达0秒清空定时器
              if (count===0){
                self.statusMsg= `验证码已经超时，请重新发送`;
                clearInterval(self.timerid);
              } ;
            },1000);
          } else {
            self.statusMsg=data.msg;
          }
        });
      } ;

    },
    register:function() {
      let self = this;
      this.$refs['ruleForm'].validate((valid)=>{
        if (valid){
          self.$axios.post('/users/signup',{
            username:window.encodeURIComponent(self.ruleForm.name),
            password:CryptoJs.MD5(self.ruleForm.pwd).toString(),
            email:self.ruleForm.email,
            code:self.ruleForm.code
          }).then(({status,data})=>{
            if (status === 200) {
              if (data&&data.code===0){
                location.href = '/login';
              }else {
                self.error=data;
              };
            }else {
              self.error=`服务器出错，错误码${status}`;
            };
            //添加定时器定时清空错误信息
            setTimeout(function() {
              self.error=''
            },1500);
          });
        } ;
      });
    }
  },
  layout: 'blank'

};
</script>

<style lang="scss">
@import "../assets/css/register/index.scss";
</style>

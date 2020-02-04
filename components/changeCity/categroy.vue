<template>
  <div class="">
    <dl class="m-categroy">
      <dt>按拼音首字母选择：</dt>
      <dd
        v-for="item in list"
        :key="item">
        <!--跳转到id为-->
        <a :href="'#city-'+item">{{ item }}</a>
      </dd>
    </dl>
    <dl
      v-for="item in block"
      :key="item.title"
      class="m-categroy-section">
      <dt :id="'city-'+item.title">{{ item.title }}</dt>
      <dd >
        <span class="city-item"
          v-for="c in item.city"
          :key="c" @click="changeCity(c)">{{ c }}</span>
      </dd>
    </dl>
  </div>
</template>

<script>
import pyjs from 'js-pinyin'
export default {
  data(){
    return {
      list:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      block:[]
    }
  },
  methods:{
    changeCity(name){
      let self = this;
      // let city = self.$store.state.geo.position.city
      // console.log(name);
      // console.log(city);
      self.$store.commit('geo/setPosition',{city:name,province:name})
      // console.log(self.$store.state.geo.position)
      self.$router.push({ path:'/'})
    }
  },
  async mounted(){
    let self=this;
    let blocks=[]
    let {status,data:{city}}=await self.$axios.get('/geo/city');
    if(status===200){
      let p
      let c
      let d={}
      //循环
      city.forEach(item=>{
        //获得拼音的全拼-》转小写-》获取第一个
        p=pyjs.getFullChars(item.name).toLocaleLowerCase().slice(0,1)
        c=p.charCodeAt(0)
        // 'a'.charCodeAt(0) -》97
        //分组，排序
        if(c>96&&c<123){
          if(!d[p]){
            d[p]=[]
          }
          d[p].push(item.name)
        }
      })
      //遍历d对象
      for(let [k,v] of Object.entries(d)){
        blocks.push({
          title:k.toUpperCase(),
          city:v
        })
      }
    //排序
      blocks.sort((a,b)=>a.title.charCodeAt(0)-b.title.charCodeAt(0))
      self.block=blocks
    }
  }
}
</script>

<style lang="scss">
  @import "../../assets/css/changeCity/categroy.scss";
</style>

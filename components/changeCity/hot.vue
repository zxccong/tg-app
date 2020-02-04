<template>
  <div class="m-hcity">
    <dl>
      <dt>热门城市：</dt>
      <dd
        v-for="item in list"
        :key="item.id" @click="changCity(item.name==='市辖区'?item.province:item.name)" class="city-item">{{ item.name==='市辖区'?item.province:item.name }}</dd>
    </dl>
  </div>
</template>

<script>

export default {
  data(){
    return {
      list:[]
    }
  },
  methods:{
    changCity(name){
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
    let {status,data:{hots}}=await this.$axios.get('/geo/hotCity')
    if(status===200){
      this.list=hots
    }
  }
}
</script>

<style lang="scss">
  @import "../../assets/css/changeCity/hot.scss";
</style>

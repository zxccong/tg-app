<template>
  <div class="m-iselect">
    <span class="name">按省份选择:</span>
    <el-select
      v-model="pvalue"
      placeholder="省份">
      <el-option
        v-for="item in province"
        :key="item.value"
        :label="item.label"
        :value="item.value"/>
    </el-select>
    <el-select
      v-model="cvalue"
      :disabled="!city.length"
      placeholder="城市">
      <el-option
        v-for="item in city"
        :key="item.value"
        :label="item.label"
        :value="item.value"/>
    </el-select>
    <span ><b>直接搜索:</b></span>
    <el-autocomplete
      v-model="input"
      :fetch-suggestions="querySearchAsync"
      placeholder="请输入城市中文或拼音"
      @select="handleSelect"
    />
  </div>
</template>

<script>
import _ from 'lodash';
export default {
  data(){
    return {
      //省份
      province:[],
      pvalue:'',
      //城市
      city:[],
      cvalue:'',
      input:'',
      //全国的城市列表
      cities:[]
    }
  },
  //监听省份发生变化，城市对应变化
  watch:{
    pvalue:async function(newPvalue){
      let self=this;
      let {status,data:{city}}=await self.$axios.get(`/geo/province/${newPvalue}`)
      if(status===200){
        self.city=city.map(item=>{
          return {
            value:item.id,
            label:item.name
          }
        })
        self.cvalue=''
      }
    }
  },
  //页面加载的时候加载所有省份数据
  mounted:async function(){
    let self=this;
    let {status,data:{province}}=await self.$axios.get('/geo/province')
    if(status===200){
      self.province=province.map(item=>{
        return {
          value:item.id,
          label:item.name
        }
      })
    }
  },
  methods:{
    //搜索方法
    querySearchAsync:_.debounce(async function(query,cb){
      let self=this;
      //如果全国城市列表
      if(self.cities.length){
        cb(self.cities.filter(item => item.value.indexOf(query)>-1))
      }else{
        let {status,data:{city}}=await self.$axios.get('/geo/city')
        if(status===200){
          //编辑符合条件的数据格式
          self.cities=city.map(item=>{return {
            value:item.name
          }})
          cb(self.cities.filter(item => item.value.indexOf(query)>-1))
        }else{
          cb([])
        }
      }
    },200),

    handleSelect:function(item){
      //todo 设置跳转到指定城市
      console.log(item.value);
    }
  }
}
</script>

<style lang="scss">
  @import "../../assets/css/changeCity/iselect.scss";
</style>

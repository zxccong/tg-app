<template>
  <div class="search-panel">
    <el-row class="m-header-searchbar">
      <el-col class="left"
              :span="3"><img alt="美团"
                             height="100%"
                             onclick="jump('http://www.meituan.com');"
                             src='/wKiRg14LHeyAdJ2UAAASAMHogiw437.png'
                             width="82px;"></el-col>
      <el-col class="center"
              :span="15">
        <div class="wrapper">
          <el-input v-model="search"
                    placeholder="搜索商家或地点"
                    @blur="blur"
                    @focus="focus"
                    @input="input"></el-input>
          <button class="el-button el-button--primary" @click="searchKey"><i class="el-icon-search"></i></button>
          <dl v-if="isHotPlace"
              class="hotPlace">
            <dt>热门搜索</dt>
            <dd v-for="(item, index) in $store.state.home.hotPlace.slice(0, 5)"
                :key="index"><a :href="'/products?keyword='+encodeURIComponent(item.name)">{{item.name}}</a>
            </dd>
          </dl>
          <dl v-if="isSearchList"
              class="searchList">
            <dd v-for="(item, index) in searchList"
                :key="index"><a :href="'/products?keyword='+encodeURIComponent(item.name)">{{ item.name }}</a>
            </dd>
          </dl>
        </div>
        <p class="suggest">
          <a v-for="(item, index) in $store.state.home.hotPlace.slice(0, 5)"
             :key="index" :href="'/products?keyword='+encodeURIComponent(item.name)">{{item.name}}</a>
        </p>
        <ul class="nav">
          <li>
            <nuxt-link class="takeout"
                       to="/">团购外卖
            </nuxt-link>
          </li>
          <li>
            <nuxt-link class="movie"
                       to="/">猫眼电影
            </nuxt-link>
          </li>
          <li>
            <nuxt-link class="hotel"
                       to="/">团购酒店
            </nuxt-link>
          </li>
          <li>
            <nuxt-link class="apartment"
                       to="/">民宿/公寓
            </nuxt-link>
          </li>
          <li>
            <nuxt-link class="business"
                       to="/">商家入驻
            </nuxt-link>
          </li>
        </ul>
      </el-col>
      <el-col class="right"
              :span="6">
        <ul class="security">
          <li><i class="refund"/>
            <p class="txt">随时退</p></li>
          <li><i class="single"/>
            <p class="txt">不满意免单</p></li>
          <li><i class="overdue"/>
            <p class="txt">过期退</p></li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//延时函数
import _ from 'lodash';
import {BASE} from '@/storage/config.js';
export default {
  data() {
    return {
      //搜索文本
      search: '',
      //是否获得焦点
      isFocus: false,
      hotPlace: [],
      searchList: []
    };
  }, computed: {
    isHotPlace: function() {
      return this.isFocus && !this.search;
    },
    isSearchList: function() {
      return this.isFocus && this.search;
    }
  },
  // watch:{
  //   search: function (o, n) {
  //     console.log(o + ":" + n);
  //
  //   }
  // },
  methods: {
    searchKey(){
      let self = this;
      if (this.search) {
        // this.$router.push({ path:"/products?keyword=" + this.search  })
        self.$router.push({ path:'/products?keyword='+this.search })
        // self.location.href = "/products?keyword=" + this.search;
      }
      // console.log(this.search);

    },
    //获得焦点
    focus: function() {
      this.isFocus = true;
    },
    //失去焦点
    blur: function() {
      // this.isFocus = false
      //  防止点出后不能跳转指定的热门搜索
      //  做延时处理
      let self = this;
      setTimeout(function() {
        self.isFocus = false;
      }, 200);
    },
    //延时函数减小接口调用次数
    input: _.debounce(async function() {
      let self = this;
      //通过vuex获取城市，把'市'去掉
      let city = self.$store.state.geo.position.city.replace('市', '');
      self.searchList = [];
      let {status, data: {top}} = await self.$axios.get('/search/top', {
        params: {
          input: self.search,
          city
        }
      });
      self.searchList = top.slice(0, 10);//截取十条
    }, 300)
  },
  mounted() {
    console.log(this.$store)
  }
};
</script>


<style lang="scss">
  @import "../../../assets/css/public/header.scss";
</style>

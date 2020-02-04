//利用ssr方式渲染到页面
export const state = () => ({position: {city:'',province:''}})

export const mutations = {
  setPosition(state, val) {
    console.log(val)
    state.position = val
  }
}





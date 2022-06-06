
import { convertScript as vuexConvertScript } from '@vue-reconstruct/vuex'
export const vuexTemplateCode = `
import * as types from '../mutation-types'

const state = {
  userInfo: {},
  isLogin: undefined,
}

const getters = {
  getUserInfo: state => state.userInfo,
  getIsLogin: state => state.isLogin,
}

const actions = {
  setUserInfo({ commit }, userInfo) {
    commit(types.SET_USERINFO, userInfo)
  },
  setIsLogin({ commit }, isLogin) {
    commit(types.SET_ISLOGIN, isLogin)
  },
}

const mutations = {
  [types.SET_USERINFO](state, userInfo) {
    state.userInfo = userInfo
    state.isLogin = true
  },
  [types.SET_ISLOGIN](state, isLogin) {
    state.isLogin = isLogin
  },
}

export default {
  state,
  getters,
  mutations,
  actions
}`.trim()


export const vuexTemplateTypes = {
  'vuex': vuexConvertScript,
}

export const vuexTemplate = {
  template: vuexTemplateCode,
  types: vuexTemplateTypes
}

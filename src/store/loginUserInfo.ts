import { defineStore } from 'pinia'
import { UserInfosStates, ILogin } from '@/models/login'

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useLoginUserInfo = defineStore('loginUserInfo', {
  state: (): UserInfosStates => ({
    userInfos: uni.getStorageSync('loginUserInfo') || {
      userName: '',
      photo: '',
      time: '',
      roles: [],
      authBtnList: [],
    },
    token: uni.getStorageSync('token'),
    cid: '',
    certKey: '',
    publicKey: '',
  }),
  getters: {
    clientId(state): string {
      if (state.cid.length !== 0) {
        return state.cid
      }
      state.cid = Math.random().toString(36).substring(2) + Date.now().toString(36)
      uni.setStorageSync('client_id', state.cid)
      return state.cid
    },
  },
  actions: {
    async setUserInfos(userInfos: ILogin) {
      // 存储用户信息到浏览器缓存
      uni.setStorageSync('loginUserInfo', userInfos)
      this.userInfos = userInfos
      console.log(this.userInfos)
    },
    setToken(token: string) {
      this.token = token
      uni.setStorageSync('token', token)
    },
    setCertKey(certKey: string) {
      this.certKey = certKey
      uni.setStorageSync('cert_key', certKey)
    },
    setPublicKey(publicKey: string) {
      this.publicKey = publicKey
      uni.setStorageSync('public_key', publicKey)
    },
  },
})
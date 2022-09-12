<template>
  <view class="login_box">
    <view class="ipt_box">
      <u-input v-model="loginInfo.username" type="text" :border="true"/>
      <uni-easyinput type="password" v-model="loginInfo.password" placeholder="请输入密码"/>
    </view>

  </view>
  <view class="mt-4">
    <u-button
        open-type="getUserInfo"
        class=""
        type="primary"
        hover-class="none"
        ripple
        @click="handleLogin"
    >
      登录
    </u-button>
  </view>
</template>

<script setup lang="ts">
import {reactive} from 'vue'
import {login} from '../../utils/login'

const loginInfo = reactive({
  username: '',
  password: ''
})
const handleLogin = () => {
  console.log('登录')
  let loginOb = new login()
  loginOb
      .doLogin(loginInfo.username, loginInfo.password)
      .then((result: any) => {
        if (result.code == 0) {
          goHome()
        } else {
          console.log(result.message)
        }
      })
      .catch(error => {
        console.log(error.message)
      })
}
const goHome = () => {
  console.log('go home')
}
</script>


<style scoped lang="scss">
.login_box {
  @include flex_center;
  width: 100%;
  height: 50vh;

  .ipt_box {
    width: 80%;
    height: 50 rpx;
  }
}
</style>

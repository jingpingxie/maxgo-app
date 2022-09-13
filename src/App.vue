<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/*每个页面公共css */
@import 'vk-uview-ui/index.scss';
@import './static/styles/reset.css';
@import './common/styles/qui_weex.scss';
@import './pages/auth/styles/skin02.scss';
</style>

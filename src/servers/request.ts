import { Toast, Alert } from '@/utils/toast'
import { XHeaderOption, XParamOption } from './request-type'
import { useLoginUserInfo } from '@/store/loginUserInfo'
import { cryptUtil } from '@/utils/cryptUtil'
import { baseURL } from '@/config/index'

let headerOption: XHeaderOption = {
  'content-type': 'application/json;charset=utf-8'
}

/**
 *
 */
class BaseRequest {
  /**
   * Post请求
   * @param {String} api 接口地址
   * @param {Object} param 参数
   * @param {Object} option 配置
   * @return {Promise}
   */
  public post(api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) {
    const url = `${baseURL}${api}`
    return this.commonRequest(url, 'POST', param, option)
  }

  /**
   *
   * @param {string} api
   * @param {TAnyObject} param
   * @param {XParamOption} option
   * @returns {Promise<unknown>}
   */
  public put(api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) {
    const url = `${baseURL}${api}`
    return this.commonRequest(url, 'PUT', param, option)
  }

  /**
   *
   * @param {string} api
   * @param {TAnyObject} param
   * @param {XParamOption} option
   * @returns {Promise<unknown>}
   */
  public delete(api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) {
    const url = `${baseURL}${api}`
    return this.commonRequest(url, 'DELETE', param, option)
  }

  /**
   * Get请求
   * @param {String} api 接口地址
   * @param {Object} param 参数
   * @param {Object} option 配置
   * @return {Promise}
   */
  public get(api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) {
    const url = this.getParamDispose(`${baseURL}${api}`, param)
    return this.commonRequest(url, 'GET', {}, option)
  }

  /**
   * Description placeholder
   * @date 2022/9/13 - 20:38:40
   *
   * @private
   * @returns {*}
   */
  private getEncryptedAuthText() {
    const requestJsonData = {
      cid: useLoginUserInfo().clientId,
      ctime: Date.parse(new Date().toString()) / 1000
    }
    const requestJsonText = JSON.stringify(requestJsonData)
    cryptUtil.setPublicKey(useLoginUserInfo().publicKey)
    return cryptUtil.rsa_encrypt(requestJsonText)
  }

  /**
   * 描述
   * @author Author
   * @date 2022-09-13
   * @param {any} headerOption:XHeaderOption
   * @returns {any}
   */
  private getHeaderAuthOption(headerOption: XHeaderOption) {
    headerOption.authorization = uni.getStorageSync('token')
    headerOption.cert_key = uni.getStorageSync('cert_key')
    return headerOption
  }

  /**
   * Description placeholder
   * @date 2022/9/13 - 20:40:56
   *
   * @private
   * @param {string} url
   * @param {?('GET' | 'POST' | 'PUT' | 'DELETE')} [method]
   * @param {TAnyObject} [param={}]
   * @param {XParamOption} [option={isAuth: true}]
   * @returns {*}
   */
  private commonRequest(
    url: string,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
    param: TAnyObject = {},
    option: XParamOption = { isAuth: true }
  ) {
    if (option.isAuth) {
      headerOption = this.getHeaderAuthOption(headerOption)
      param['encrypt'] = this.getEncryptedAuthText()
    }
    return new Promise((resolve, reject) => {
      uni.request({
        url,
        data: { ...param },
        method: method,
        timeout: 30000,
        header: headerOption,
        success: res => {
          if (this.ajaxFilter(res.data) && res.statusCode === 200) {
            this.setAuthInfo(res.header)
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: res => {
          reject(res)
          setTimeout(() => {
            Toast('服务繁忙，请稍后重试 !')
          }, 0)
        }
      })
    })
  }

  /**
   * 描述
   * @date 2022-09-13
   * @param {any} header:XHeaderOption
   * @returns {any}
   */
  private setAuthInfo(header: XHeaderOption) {
    const storeLoginUserInfo = useLoginUserInfo()
    if (header.authorization) {
      storeLoginUserInfo.setToken(header.authorization)
    }
    if (header.cert_key) {
      storeLoginUserInfo.setCertKey(header.cert_key)
    }
    if (header.public_key) {
      storeLoginUserInfo.setPublicKey(header.public_key)
    }
  }

  /**
   * Get参数处理
   * @param {String} url 接口地址
   * @param {Object} param 参数
   * @return {String} 处理后的接口地址
   */
  private getParamDispose(url: string, param: TAnyObject) {
    const keyArr = Object.keys(param)
    const valueArr = Object.values(param)
    const length = keyArr.length
    let newUrl = url
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        newUrl += `?${keyArr[i]}=${valueArr[i]}`
      } else {
        newUrl += `&${keyArr[i]}=${valueArr[i]}`
      }
    }
    return newUrl
  }

  // 验证登录情况
  ajaxFilter(data: any) {
    let status = true
    if (data.code == 401) {
      status = false
      Alert('登录状态失效').then(result => {
        const storeLoginUserInfo = useLoginUserInfo()
        storeLoginUserInfo.clearAuthInfo()
        uni.reLaunch({
          url: '/pages/auth/login/login'
        })
      })
    }
    return status
  }
}

const Request: BaseRequest = new BaseRequest()
export default Request

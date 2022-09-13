import { Toast } from '@/utils/toast'
import { XHeaderOption, XParamOption } from './request-type'
import { useLoginUserInfo } from '@/store/loginUserInfo'
import { cryptUtil } from '@/utils/cryptUtil'

const baseURL = 'http://localhost:9090'
let headerOption: XHeaderOption = {
  'content-type': 'application/json;charset=utf-8'
}

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
   * @param api
   * @param param
   * @param option
   */
  public put(api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) {
    const url = `${baseURL}${api}`
    return this.commonRequest(url, 'PUT', param, option)
  }

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

  private getEncryptedAuthText() {
    const requestJsonData = {
      cid: useLoginUserInfo().clientId,
      ctime: Date.parse(new Date().toString()) / 1000
    }
    const requestJsonText = JSON.stringify(requestJsonData)
    cryptUtil.setPublicKey(useLoginUserInfo().publicKey)
    return cryptUtil.rsa_encrypt(requestJsonText)
  }

  private getHeaderAuthOption(headerOption: XHeaderOption) {
    headerOption.authorization = uni.getStorageSync('token')
    headerOption.cert_key = uni.getStorageSync('cert_key')
    return headerOption
  }

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
          if (res.statusCode === 200) {
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
}

const Request: BaseRequest = new BaseRequest()
export default Request

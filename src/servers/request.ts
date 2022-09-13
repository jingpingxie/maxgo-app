import { Toast } from '@/utils/toast'
import { XHeaderOption, XParamOption } from './request-type'
import { useLoginUserInfo } from '@/store/loginUserInfo'
import { cryptUtil } from '@/utils/cryptUtil'

const baseURL = 'http://localhost:9090'
let headerOption: XHeaderOption = {
  'content-type': 'application/json;charset=utf-8'
}

/**
 * Get参数处理
 * @param {String} url 接口地址
 * @param {Object} param 参数
 * @return {String} 处理后的接口地址
 */
const getParamDispose = (url: string, param: TAnyObject) => {
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

const Request = {
  /**
   * Post请求
   * @param {String} api 接口地址
   * @param {Object} param 参数
   * @param {Object} option 配置
   * @return {Promise}
   */
  post: (api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) => {
    const url = `${baseURL}${api}`
    return Request.baseRequest(url, 'POST', param, option)
  },
  put: (api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) => {
    const url = `${baseURL}${api}`
    return Request.baseRequest(url, 'PUT', param, option)
  },
  delete: (api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) => {
    const url = `${baseURL}${api}`
    return Request.baseRequest(url, 'DELETE', param, option)
  },
  /**
   * Get请求
   * @param {String} api 接口地址
   * @param {Object} param 参数
   * @param {Object} option 配置
   * @return {Promise}
   */
  get: (api: string, param: TAnyObject = {}, option: XParamOption = { isAuth: true }) => {
    const url = getParamDispose(`${baseURL}${api}`, param)
    return Request.baseRequest(url, 'GET', {}, option)
  },
  getEncryptedAuthText: () => {
    const requestJsonData = {
      cid: useLoginUserInfo().clientId,
      ctime: Date.parse(new Date().toString()) / 1000
    }
    const requestJsonText = JSON.stringify(requestJsonData)
    cryptUtil.setPublicKey(useLoginUserInfo().publicKey)
    return cryptUtil.rsa_encrypt(requestJsonText)
  },
  getHeaderAuthOption: (headerOption: XHeaderOption) => {
    headerOption.authorization = uni.getStorageSync('token')
    headerOption.cert_key = uni.getStorageSync('cert_key')
    return headerOption
  },
  setAuthInfo: (header: XHeaderOption) => {
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
  },
  baseRequest: (
    url: string,
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
    param: TAnyObject = {},
    option: XParamOption = { isAuth: true }
  ) => {
    if (option.isAuth) {
      headerOption = Request.getHeaderAuthOption(headerOption)
      param['encrypt'] = Request.getEncryptedAuthText()
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
            Request.setAuthInfo(res.header)
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
}

export default Request

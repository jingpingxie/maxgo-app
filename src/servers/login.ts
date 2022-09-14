import { cryptUtil } from '@/utils/cryptUtil'
import { useLoginUserInfo } from '@/store/loginUserInfo'
import { baseURL } from '@/config/index'

export class login {
  doLogin(account: string, password: string) {
    return new Promise((resolve, reject) => {
      this.sendDisposableCertRequest()
        .then((disposableCertKey: any) => {
          this.sendEncryptLoginRequest(account, password, disposableCertKey)
            .then(result => {
              resolve(result)
            })
            .catch(error => {
              reject(error)
            })
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  sendDisposableCertRequest() {
    //获取一次性证书，以便加密请求数据
    const certRequestUrl = baseURL + `/api/v1/passport/disposablecert`
    return new Promise((resolve, reject) => {
      uni.request({
        url: certRequestUrl,
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (result: any) => {
          //处理成功后的逻辑
          if (!result.data) {
            return Promise.reject({ code: -200, message: 'failed to get cert' })
          }
          if (result.data.code != 0) {
            return Promise.reject({ code: -200, message: 'failed to get cert' })
          }
          const disposableCertKey = result.header.cert_key
          const disposablePublicKey = result.header.public_key
          cryptUtil.setPublicKey(disposablePublicKey)
          resolve(disposableCertKey)
        },
        fail(error) {
          reject({ code: -300, message: error })
        }
      })
    })
  }

  sendEncryptLoginRequest(account: string, password: string, cert_key: string) {
    const storeLoginUserInfo = useLoginUserInfo()
    const requestJsonData = {
      account: account,
      password: password,
      cid: storeLoginUserInfo.clientId,
      ctime: Date.parse(new Date().toString()) / 1000
    }
    const requestJsonText = JSON.stringify(requestJsonData)
    const encryptedText = cryptUtil.rsa_encrypt(requestJsonText)
    console.log('加密后的文字：' + encryptedText)

    const certRequestUrl = baseURL + `/api/v1/user/login`
    return new Promise((resolve, reject) => {
      uni.request({
        url: certRequestUrl,
        method: 'POST',
        data: {
          encrypt: encryptedText
        },
        header: {
          'content-type': 'application/json',
          cert_key: cert_key
        },
        success: (result: any) => {
          if (!result.data) {
            return Promise.reject({ code: -200, message: 'failed to login' })
          }
          if (result.data.code != 0) {
            return Promise.reject({ code: -200, message: 'failed to login' })
          }
          storeLoginUserInfo.setToken(result.header.authorization)
          storeLoginUserInfo.setCertKey(result.header.cert_key)
          storeLoginUserInfo.setPublicKey(result.header.public_key)
          resolve({ code: 0, message: 'success to login' })
        },
        fail(error) {
          reject({ code: -300, message: error })
        }
      })
    })
  }
}

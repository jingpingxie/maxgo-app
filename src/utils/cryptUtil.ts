import CryptoJS from 'crypto-js'
import JsEncrypt from 'jsencrypt'

/** 加解密数据类型 */
interface ICryptProps {
  /** 加密数据 */
  requestData: string
  /** 加密n位字符串 */
  encrypted: string
}

/** 加解密模块 */
class CryptUtil {
  // 公钥
  private publicKey: string
  // 私钥
  private privateKey: string

  constructor() {
    // 公钥
    this.publicKey = ''
    // 私钥
    this.privateKey = ''
  }

  setPublicKey(publicKey: string): void {
    this.publicKey = publicKey
  }

  setPrivateKey(privateKey: string): void {
    this.privateKey = privateKey
  }

  /** 生成n位随机16进制字符串 */
  randomKeys(n: number): string {
    const charList = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    let str = ''
    const len = charList.length
    for (let i = 0; i < n; i++) {
      str += charList[Math.floor(Math.random() * len)]
    }
    return str
  }

  /**
   * AES加密原始数据
   * @param params js对象
   * @param randomKey n位16进制随机字符串
   */
  aes_encrypt(params: object, randomKey: string): string {
    const src = CryptoJS.enc.Utf8.parse(
      typeof params === 'object' ? JSON.stringify(params) : params
    )
    const key = CryptoJS.enc.Utf8.parse(randomKey)
    const encryptedParams = CryptoJS.AES.encrypt(src, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encryptedParams.toString()
  }

  /**
   * AES解密加密的json数据
   * @param params 加密后的json字符串
   * @param randomKey n位16进制随机字符串
   */
  aes_decrypt(params: string, randomKey: string) {
    const key = CryptoJS.enc.Utf8.parse(randomKey)
    const decryptParams = CryptoJS.AES.decrypt(params, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decryptParams).toString()
  }

  /**
   * rsa算法公钥加密
   * @param params
   */
  rsa_encrypt(params: object | string): string | false {
    const Encrypt = new JsEncrypt()
    Encrypt.setPublicKey(this.publicKey)
    return Encrypt.encrypt(typeof params === 'object' ? JSON.stringify(params) : params)
  }

  /**
   * rsa算法私钥解密
   * @param params
   */
  rsa_decrypt(params: object | string) {
    const Decrypt = new JsEncrypt()
    Decrypt.setPrivateKey(this.privateKey)
    return Decrypt.decrypt(typeof params === 'object' ? JSON.stringify(params) : params)
  }

  /** 普通对象转换成加密对象 */
  encryptParams(params: object): ICryptProps {
    const randomKey = this.randomKeys(16)
    const requestData = this.aes_encrypt(params, randomKey)
    const encrypted = this.rsa_decrypt(randomKey) || ''
    return {
      requestData,
      encrypted
    }
  }

  /** 加密对象转换成普通对象 */
  decryptParams(params: ICryptProps): object {
    const { requestData, encrypted } = params
    const randomKey = this.rsa_decrypt(encrypted) || ''
    return JSON.parse(this.aes_decrypt(requestData, randomKey) || '{}')
  }
}

/** 导出默认实例 */
export const cryptUtil = new CryptUtil()

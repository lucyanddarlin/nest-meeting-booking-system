/** 验证码过去时间 */
export const CAPTCHA_EXPIRE_TIME = 5 * 60
/** 验证码开始下标 */
export const CAPTCHA_START_INDEX = 2
/** 验证码结束下标 */
export const CAPTCHA_END_INDEX = 8

/**
 * 验证码发送类型
 */
export enum CAPTCHA_KEY {
  user_register = 'captcha_user_register_',
  update_password = 'captcha_update_password_',
  update_userinfo = 'captcha_update_userinfo_',
}

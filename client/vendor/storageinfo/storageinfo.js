/**
 * 
 * 用处存储本地数据信息
 * 
 */

function setLocalDataInfo(key, value) {
  try {
    console.log("setLocalDataInfo: key= ",key, "  value= ",value)
    wx.setStorageSync(key, value)
  } catch (e) {
    console.log(e)
  }
}

function getLocalDataInfo(key) {
  try {
    var value = wx.getStorageSync(key)
    console.log("getLocalDataInfo=", value)
    if (value) {
      // Do something with return value
      return value;
    }
  } catch (e) {
    // Do something when catch error
  }
}

module.exports = {
  setLocalDataInfo,
  getLocalDataInfo
}

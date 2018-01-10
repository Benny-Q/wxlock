// pages/pwdinput/pwdinput.js
var exportP = require('../../vendor/storageinfo/storageinfo.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tmp_pwd: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const arrayBuffer = new Uint8Array([1, 2, 3,4,5,6])
    const base64 = wx.arrayBufferToBase64(arrayBuffer)

    console.log("base64=" + base64)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  // add Benny
  bindButtonTap: function () {
    var that = this;
    //判断密码是否合法有效
    var psw = exportP.getLocalDataInfo('myLockPwd')
    console.log("psw.length=" + psw,":");
    var pswd_str = new String(that.data.tmp_pwd)
    console.log("psw.length= " + pswd_str.length);
    console.log("localeCompare= " + pswd_str.localeCompare("undefined"));
    if ((pswd_str.localeCompare("undefined") == 0) || (pswd_str.length < 6)) {
      wx.showLoading({
        title: '输入密码不合法',
      })

      setTimeout(function () {
        wx.hideLoading()
      }, 500)
    } else {
      wx.showLoading({
        title: '密码设置成功',
      })

      setTimeout(function () {
        wx.hideLoading()
      }, 500)
    }
  },
  
  bindKeyInput: function (e) {
    var that = this;
    console.log("e.detail.value= " + e.detail.value);
    that.setData({
      tmp_pwd: e.detail.value
    })

    console.log("pwdinput.js", "lenght= " + that.data.tmp_pwd.length)
    //存储客户锁端密码作为全局变量使用
    if (that.data.tmp_pwd.length > 5) {
      exportP.setLocalDataInfo('myLockPwd', e.detail.value)
    }
  },

  bindKeyBlur: function (e) {
    console.log("pwdinput.js", "value= " + e.detail.value)
  }
})
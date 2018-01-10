/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/wafer2-client-sdk/index');

// 引入配置
var config = require('../../config');

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};

var exportI = require('../../vendor/storageinfo/storageinfo.js');

/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
Page({

    /**
     * 初始数据，我们把服务地址显示在页面上
     */
  data: {
    devicePwd: ""
  },  

  onLoad: function () {
    console.log("index-----onLoad()");
    try {
      var res = wx.getSystemInfoSync()
      //console.log(res.model)
      //console.log(res.pixelRatio)
      //console.log(res.windowWidth)
      //console.log(res.windowHeight)
      //console.log(res.language)
      //console.log(res.version)
      console.log(res.platform)
      wx.setStorage({
        key: 'myDevicePlatform',
        data: res.platform,
      })
    } catch (e) {
      // Do something when catch error
    }
  },

  onReady: function () {
    // Do something when page ready.
    console.log("index-----onReady()");
  },
  onShow: function () {
    // Do something when page show.
    console.log("index-----onShow()");
  },
  onHide: function () {
    // Do something when page hide.
    console.log("index-----onHide()");
  },
  onUnload: function () {
    // Do something when page close.
    console.log("index-----onUnload()");
  },
  onPullDownRefresh: function () {
    // Do something when pull down.
    console.log("index-----onPullDownRefresh()");
  },
  onReachBottom: function () {
    // Do something when page reach bottom.
    console.log("index-----onReachBottom()");
  },
  onShareAppMessage: function () {
    // return custom share data when user share.
    console.log("index-----onShareAppMessage()");
  },
  onPageScroll: function () {
    // Do something when page scroll
    console.log("index-----onPageScroll()");
  },  

  // add Benny
  
  buttonSet: function () {
    wx.navigateTo({
      url: '../pwdinput/pwdinput',
    })
  },

  // add Benny
  buttonBle: function () {
    var that = this;
    //获取配置的客户锁端密码
    let value = exportI.getLocalDataInfo('myLockPwd')
    console.log("index.js myLockPwd= ", value)
    that.setData({ myLockPwd: value })

    console.log("index.js that.data.devicePwd=", that.data.devicePwd)
    
    if (that.data.devicePwd.length <= 5) {
      wx.navigateTo({
        url: '../bleunlock/bleunlock',
      })
    } else {
      wx.navigateTo({
        url: '../pwdinput/pwdinput',
      })
    }

  },


  // add Benny
  buttonKey: function () {
    wx.navigateTo({
      url: '../keyunlock/keyunlock',
    })
  }
});

// pages/scan/scan.js
var exportS = require('../../vendor/storageinfo/storageinfo.js');

//配置只显示匹配UUID的蓝牙
var bleUUID = "5970";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceID: "",
    servicesList: [],
    filterList: [],
    list: [],
    serviceID: "",

    name: '',
    services: [],
    uuid01: '',
    uuid02: '',
    uuid03: '',
    characteristics01: null,
    characteristics02: null,
    characteristics03: null,
    result: '',
    devicePlatform: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取用户使用设备的平台
    that.setData({
      devicePlatform: exportS.getLocalDataInfo('myDevicePlatform'), //this.getLocalStorageSyncInfo('myDevicePlatform'),
    })
    console.log("devicePlatform= ",that.data.devicePlatform)

    //打开蓝牙适配器
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res)
        //开始搜索
        wx.startBluetoothDevicesDiscovery({
          //services: ['5970'],
          success: function (res) {
            console.log("scan.js::scan success:", JSON.stringify(res.devices));
            // show loading...
            wx.showLoading({
              title: '搜索蓝牙',
            })

            //获取发现的设备
            setTimeout(function () {
              wx.getBluetoothDevices({
                success: function (res) {
                  //是否有已连接设备  
                  wx.getConnectedBluetoothDevices({
                    success: function (res) {
                      console.log("scan.js::getConnBle:", JSON.stringify(res.devices));
                    }
                  })
                  console.log("scan.js::getBLEDevices:", res.devices);
                  //过滤UUID
                  var j = 0;
                  for (var i = 0; i < res.devices.length; i++) {
                    console.log("advertisServiceUUIDs :", res.devices[i].advertisServiceUUIDs);
                    if (res.devices[i].advertisServiceUUIDs != null) {
                      var serviceUUID = new String(res.devices[i].advertisServiceUUIDs[0]);
                      if (serviceUUID.indexOf(bleUUID) != -1) {
                        that.data.filterList[j] = res.devices[i];
                        j++;
                        console.log("filterList :", that.data.filterList[j]);
                      }
                    }
                  } // end for
                  //console.log("getBLEDevices filterList :", that.data.filterList);

                  that.setData({
                    list: that.data.filterList,
                  })

                  that.setData({
                    deviceID: res.devices.deviceId
                  })
                }, //end success: getBluetoothDevices

                //complete
                complete: function (res) {
                  // complete
                  wx.stopBluetoothDevicesDiscovery({
                    success: function (res) {
                      console.log("stopBluetoothDevicesDiscovery",res)
                    }
                  })

                  console.log("getBLEDeviceCharacteristics: COMPLETE");
                  var devicesID = JSON.stringify(res.devices);
                  console.log("getBLEDeviceCharacteristics: COMPLETE= ", res.devices);
                  if (devicesID == null) {
                    wx.showLoading({
                      title: '未发现设备',
                    })
                  }
                  //隐藏loading界面
                  setTimeout(function () {
                    wx.hideLoading()
                  }, 1000)
                } // end complete: getBluetoothDevices
              }) // end getBluetoothDevices
            }, 5000);
          },
          fail: function (res) {
            // fail
            console.log("scan fail:", res);
          },
          complete: function (res) {
            // complete
            console.log("scan complete:", res);
          }
        })
      }
    })

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

  //Item点击事件
  bindVitwTap: function (e) {
    var that = this;
    var myDeviceId = e.currentTarget.dataset.deviceid;
    var myUUID = e.currentTarget.dataset.uuid;
    var myName = e.currentTarget.dataset.name;
    console.log("scan.js:: dataset: ", e.currentTarget.dataset);

    //存储已连接设备信息,使用同步方式
    //wx.setStorage({
    //  key: "myConnDataSet",
    //  data: e.currentTarget.dataset
    //})
    exportS.setLocalDataInfo('myConnDataSet', e.currentTarget.dataset)
    that.setData({ deviceID: myDeviceId });
  
  //#################################连接设备实现代码#######################################################################
    //获取已连接设备信息
    
    /**
     * 连接设备
     */
   
    wx.createBLEConnection({
      deviceId: that.data.deviceID,
      success: function (res) {
        console.log("createBLEConnection");
        // success
        console.log(res);
        wx.onBLEConnectionStateChanged(function (res) {
          console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
          //设置蓝牙连接状态
          exportS.setLocalDataInfo('myBleConnState', res.connected)
        })
        /**
         * 连接成功，后开始获取设备的服务列表
         */
        wx.getBLEDeviceServices({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices中获取
          deviceId: that.data.deviceID,
          success: function (res) {
            console.log('device services:', res.services)
            that.setData({ services: res.services });
            if (that.data.devicePlatform == 'ios') {
              console.log('iso device services:', that.data.services[1].uuid);
              that.setData({ serviceID: that.data.services[1].uuid });
            } else {
              console.log('android device services:', that.data.services[0].uuid);
              that.setData({ serviceID: that.data.services[0].uuid });
            }
            console.log('--------------------------------------');
            console.log('device设备的id:', that.data.deviceID);
            console.log('device设备的服务id:', that.data.serviceID);

            /**
            * 延迟3秒，根据服务获取特征 
            */
            setTimeout(function () {
              wx.getBLEDeviceCharacteristics({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                deviceId: that.data.deviceID,
                // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                serviceId: that.data.serviceID,
                success: function (res) {
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                  //获取远程设备中UUID
                  for (var i = 0; i < 3; i++) {
                    console.log("res.characteristics[i].uuid:", res.characteristics[i].uuid);
                    //uuid01 写操作
                    if (res.characteristics[i].uuid.indexOf("0100") != -1) {
                      that.setData({
                        uuid01: res.characteristics[i].uuid,
                        characteristics01: res.characteristics[i]
                      });
                    }
                    //uuid02 读操作
                    if (res.characteristics[i].uuid.indexOf("0200") != -1) {
                      that.setData({
                        uuid02: res.characteristics[i].uuid,
                        characteristics02: res.characteristics[i]
                      });
                    }
                    //uuid03 暂未知
                    if (res.characteristics[i].uuid.indexOf("0300") != -1) {
                      that.setData({
                        uuid03: res.characteristics[i].uuid,
                        characteristics03: res.characteristics[i]
                      });
                    }
                  } // end for 
                  //保存设备写操作的 characteristicsID
                  exportS.setLocalDataInfo('myConnCharacteristicsID', that.data.uuid01)
                  //console.log("uuid01= " + that.data.uuid01 + "uuid02= " + that.data.uuid02 + "uuid03= " + that.data.uuid03);

                  console.log("getBLEDeviceCharacteristics: SUCCESS");
                  // show tip
                  wx.showToast({
                    title: "设备已连接",
                    duration: 500
                  });
                },  // end success

                fail: function (res) {
                  // fail
                  console.log("getBLEDeviceCharacteristics: FAIL");
                },
                complete: function (res) {
                  // complete
                  console.log("getBLEDeviceCharacteristics: COMPLETE");
                }

              }) // end wx.getBLEDeviceCharacteristics
            }, 500);   //  end setTimeout

          }
        })
        
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
    
  }, // end bindViewTap function

  // to hex
  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  
})
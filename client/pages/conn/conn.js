// pages/conn/conn.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      motto: 'Hello World',
      userInfo: {},
      deviceId: '',
      name: '',
      serviceId: '',
      services: [],
      cd20: '',
      cd01: '',
      cd02: '',
      cd03: '',
      cd04: '',
      characteristics20: null,
      characteristics01: null,
      characteristics02: null,
      characteristics03: null,
      characteristics04: null,
      result: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log("onLoad");
    console.log('deviceId=' + options.deviceId);
    console.log('name=' + options.name);
    //获取已连接设备信息
    if (options.deviceId != null)  {
      that.setData({ deviceId: options.deviceId });
    } else {
      wx.getStorage({
        key: 'myConnDeviceId',
        success: function (res) {
          console.log("myConnDeviceId",res.data)
          that.setData({ deviceId: res.data });
        }
      })
    }
   

    //that.setData({ deviceId: options.deviceId });
    /**
     * 监听设备的连接状态
     */
    wx.onBLEConnectionStateChanged(function (res) {
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    })
    /**
     * 连接设备
     */
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        console.log("createBLEConnection");
        // success
        console.log(res);
        /**
         * 连接成功，后开始获取设备的服务列表
         */
        wx.getBLEDeviceServices({
          // 这里的 deviceId 需要在上面的 getBluetoothDevices中获取
          deviceId: that.data.deviceId,
          success: function (res) {
            console.log('device services:', res.services)
            that.setData({ services: res.services });
            console.log('device services:', that.data.services[1].uuid);
            that.setData({ serviceId: that.data.services[1].uuid });
            console.log('--------------------------------------');
            console.log('device设备的id:', that.data.deviceId);
            console.log('device设备的服务id:', that.data.serviceId);

            /**
            * 延迟3秒，根据服务获取特征 
            */
            setTimeout (function () {
              wx.getBLEDeviceCharacteristics({
                // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                deviceId: that.data.deviceId,
                // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                serviceId: that.data.serviceId,
                success: function (res) {
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                  //获取远程设备中UUID
                  for (var i=0 ; i<3; i++) {
                    console.log("res.characteristics[i].uuid:",res.characteristics[i].uuid);
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

                  console.log("uuid01= " + that.data.uuid01 + "uuid02= " + that.data.uuid02 + "uuid03= " + that.data.uuid03);

                  // 必须在这里的回调才能获取
                  wx.onBLECharacteristicValueChange(function (characteristic) {
                    console.log('characteristic value comed:', characteristic)
                    /**
                     * 监听cd04cd04中的结果
                    */
                    if (characteristic.characteristicId.indexOf("0100") != -1) {
                      const result = characteristic.value;
                      const hex = that.buf2hex(result);
                      console.log("0100 hex：",hex);
                    }
                    if (characteristic.characteristicId.indexOf("0200") != -1) {
                      const result = characteristic.value;
                      const hex = that.buf2hex(result);
                      console.log("0200 hex: ",hex);
                      that.setData({ result: hex });
                    }
                  }) // end wx.onBLECharacteristicValueChange

                  //顺序开发设备特征notifiy
                  wx.notifyBLECharacteristicValueChanged({
                  deviceId: that.data.deviceId,
                    serviceId: that.data.serviceId,
                      characteristicId: that.data.uuid01,
                        state: true,
                          success: function (res) {
                            // success
                            console.log('notifyBLECharacteristicValueChanged01 success', res);
                          },
                          fail: function (res) {
                            // fail
                          },
                          complete: function (res) {
                            // complete
                          }
                  })

                  wx.notifyBLECharacteristicValueChanged({
                    deviceId: that.data.deviceId,
                    serviceId: that.data.serviceId,
                    characteristicId: that.data.uuid02,
                    state: true,
                    success: function (res) {
                      // success
                      console.log('notifyBLECharacteristicValueChanged02 success', res);
                    },
                    fail: function (res) {
                      // fail
                    },
                    complete: function (res) {
                      // complete
                    }
                  })

                  console.log("getBLEDeviceCharacteristics: SUCCESS");
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
            } ,3000);   //  end setTimeout

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
  },

  //发送数据 到设备中
  bindViewTap: function () {
    var that = this;
    // 向蓝牙设备发送一个0x00的16进制数据
    var hex = '75322c3132333435365d5e'
    //var hex = '55322cB10000B5'
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    console.log(typedArray)
    console.log([0xAA, 0x55, 0x04, 0xB1, 0x00, 0x00, 0xB5])
    var buffer1 = typedArray.buffer
    console.log(buffer1)

    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.uuid01,
      // 这里的value是ArrayBuffer类型
      value: buffer1,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
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
    console.log("conn.js----onUnload");
    wx.redirectTo({
      url: '../conn/conn',
    })
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
  
  }
})
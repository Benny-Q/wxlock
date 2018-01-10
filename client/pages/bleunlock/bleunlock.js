// pages/bleunlock/bleunlock.js

var exportB = require('../../vendor/storageinfo/storageinfo.js');

var flag = 0;

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
    deviceName:"无",
    characteristicID:"",
    myDataSet:"",
    myConnState:"",
    myLockPwd:"",
    BTAdapterState:"false",

    uuid01: '',
    uuid02: '',
    uuid03: '',
    characteristics01: null,
    characteristics02: null,
    characteristics03: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    let value = exportB.getLocalDataInfo('myConnDataSet')
    console.log("myConnDataSet= ", value)
    if (value != null) {
      that.setData({ myDataSet: value });
      that.setData({ deviceID: that.data.myDataSet.deviceid });
      that.setData({ serviceID: that.data.myDataSet.uuid[0] });
      that.setData({ deviceName: that.data.myDataSet.name });
    }

    //判断本地蓝牙设备是否可用
    //获取蓝牙状态
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log("BTstate=",res.available)
        that.setData({ BTAdapterState: res.available });
      },
      fail: function (res) {
        console.log("BTstate fail=", res.available)
      },
      complete: function (res) {
        console.log("BTstate complete=", res.available)
      }
    })
    console.log("BTAdapterState=", that.data.BTAdapterState)
    if (that.data.BTAdapterState == null || that.data.BTAdapterState == "false") {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log("success:",JSON.stringify(res))
          setTimeout(function () {
            wx.createBLEConnection({
              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
              deviceId: that.data.deviceID,
              success: function (res) {
                console.log(res)
                wx.showLoading({
                  title: '设备已连接',
                })
                setTimeout(function () {
                  wx.hideLoading()
                }, 500)
              }
            })
          },1000)
        },

        fail: function (res) {
          console.log(res)
          wx.showModal({
            title: '提示',
            content: '请检测本机设备是否可用',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../index/index',
                })
              }
            }
          })
        },
        complete: function (res) {
          console.log("complete:",JSON.stringify(res))
        }
      })
    }
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
  //获取已经匹配过的设备serverUUID, deviceID, deicename,characteristicID
  var that = this;

    let value = exportB.getLocalDataInfo('myConnDataSet')
    console.log("onShow::myConnDataSet= ", value)
    if (value != null) {
      that.setData({ myDataSet: value });
      that.setData({ deviceID: that.data.myDataSet.deviceid });
      that.setData({ serviceID: that.data.myDataSet.uuid[0] });
      that.setData({ deviceName: that.data.myDataSet.name });
    }
    value = exportB.getLocalDataInfo('myConnCharacteristicsID')
    console.log("myConnCharacteristicsID= ", value)
    if (value != null) {
      that.setData({ characteristicID: value })
    }
  
    //获取配置的客户锁端密码
    value = exportB.getLocalDataInfo('myLockPwd')
    console.log("myLockPwd= ", value)
    if (value != null) {
      that.setData({ myLockPwd: value })
    }

    // 主动监听设备的连接状态
    wx.onBLEConnectionStateChanged(function (res) {
      console.log(`bleunlock::device ${res.deviceId} state has changed, connected: ${res.connected}`)
      //设置蓝牙连接状态
      exportB.setLocalDataInfo('myBleConnState', res.connected)
    })
    // 获取连接状态
    value = exportB.getLocalDataInfo('myBleConnState')
    console.log("myBleConnState= ", value)
    that.setData({ myConnState: value })
    
    // 当界面focus，系统主动去连接一次蓝牙
    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: that.data.deviceID,
      success: function (res) {
        console.log(res)
        /*wx.showLoading({
          title: '设备已连接',
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 500)
        */
        /*
        *获取设备的特征值
        */
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
            exportB.setLocalDataInfo('myConnCharacteristicsID', that.data.uuid01)
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

        /**
         * 启动BLE特征值状态监听
         */
        wx.notifyBLECharacteristicValueChanged({
          deviceId: that.data.deviceID,
          serviceId: that.data.serviceID,
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
          deviceId: that.data.deviceID,
          serviceId: that.data.serviceID,
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
        })  // end wx.notifyBLECharacteristicValueChanged
        
        /**
         * 监听低功耗蓝牙连接的事件
         */
        wx.onBLECharacteristicValueChange(function (characteristic) {
          console.log('ble--characteristic value comed:', characteristic)
          /**
           * 监听cd04cd04中的结果
          */
          if (characteristic.characteristicId.indexOf("0100") != -1) {
            const result = characteristic.value;
            const hex = that.buf2hex(result);
            console.log("ble--0100 hex：", hex);
          }
          if (characteristic.characteristicId.indexOf("0200") != -1) {
            const result = characteristic.value;
            const hex = that.buf2hex(result);
            console.log("ble--0200 hex: ", hex);
            }
        }) // end wx.onBLECharacteristicValueChange
      }
    })

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
  // Benny  begin

  // 本机蓝牙适配器状态  

  //搜索设备
  buttonScan: function () {
    wx.navigateTo({
      url: '../scan/scan',
    })
  },

  //断开设备连接  
  buttonStop: function () {
    var that = this;
    wx.closeBLEConnection({
      deviceId: that.data.deviceID,
      success: function (res) {
        console.log("buttonStop:",res)
        that.setData({ deviceName: "无" });
        }
      })
  },
  //关于我们
  buttonAbout: function () {
    wx.navigateTo({
      url: '../about/about',
    })
  },

//###############开锁######################
  //发送数据 到设备中
  buttonUnlock: function (event) {
    var that = this;
    // 向蓝牙设备发送一个0x00的16进制数据
    //密码组成：'u'+'3'+','+'6-8位密码' +']'+'^'
    //var hex = '75332c3132333435365d5e'
    //判断设备是否连接上
    console.log("myBleConnState02:", that.data.myConnState)
    if (that.data.myConnState == false || that.data.myConnState == null) {
      return;
    }
    //console.log("local password: ", that.data.myLockPwd)

    let buffer_pwd = new ArrayBuffer(16)
    let dataView = new DataView(buffer_pwd)
    var get_str = new String(that.data.myLockPwd)
    var password_length = that.data.myLockPwd.length;
    //console.log("password_length= ", password_length)
    dataView.setUint8(0, 0x75)
    dataView.setUint8(1, 0x33)
    dataView.setUint8(2, 0x2c)
    for (var i= 0; i<that.data.myLockPwd.length; i++) {
      var get_char = get_str.charCodeAt(i).toString(10)   // 密码转换为10进制
      dataView.setUint8(i + 3, get_char)
    }
    dataView.setUint8(that.data.myLockPwd.length+3, 0x5d)
    dataView.setUint8(that.data.myLockPwd.length+4, 0x5e)

    //console.log("that.data.deviceID:", that.data.deviceID)
    //console.log("that.data.serviceID:", that.data.serviceID)
    //console.log("that.data.characteristicID:", that.data.characteristicID)
    //@@--1 先发个空包，用于唤醒系统
    /*  let buffer01 = new ArrayBuffer(1)
      let dataView01 = new DataView(buffer01)
      dataView01.setUint8(0, 0x5e)

      wx.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
        deviceId: that.data.deviceID,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: that.data.serviceID,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
        characteristicId: that.data.characteristicID,
        // 这里的value是ArrayBuffer类型
        value: buffer01,
        success: function (res) {
          console.log('writeBLECharacteristicValue01 success', res.errMsg) 
        },
        complete: function (res) {
        }
      })
      */
    //@@--2 再次发送解决数据包,开锁
      wx.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
        deviceId: that.data.deviceID,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: that.data.serviceID,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
        characteristicId: that.data.characteristicID,
        // 这里的value是ArrayBuffer类型
        value: buffer_pwd,
        success: function (res) {
          console.log('writeBLECharacteristicValue success', res.errMsg)
        },

        fail: function (res) {
          // fail
          console.log('写入特征信息失败', JSON.stringify(res));
        },
        complete: function (res) {
          // complete
          console.log('writeBLECharacteristicValue complete', res.errMsg)

        }
      })
  }, // end buttonUnlock


  // to hex
  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
})
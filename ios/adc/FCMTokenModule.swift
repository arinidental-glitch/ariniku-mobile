import Foundation
import React
import FirebaseMessaging

@objc(FCMTokenModule)
class FCMTokenModule: NSObject {

  @objc
  func getToken(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Messaging.messaging().token { token, error in
      if let error = error {
        reject("FCM_TOKEN_ERROR", error.localizedDescription, error)
        return
      }

      resolve(token)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

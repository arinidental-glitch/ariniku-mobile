#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <FirebaseCore/FirebaseCore.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [FIRApp configure];

    self.moduleName = @"main";
    self.initialProps = @{};

    NSLog(@"===== BEFORE SUPER APP =====");

    BOOL result = [super application:application
        didFinishLaunchingWithOptions:launchOptions];

    NSLog(@"===== AFTER SUPER APP: %d =====", result);

    return result;
}

- (NSURL *)bundleURL
{
#if DEBUG
    NSURL *jsURL = [[RCTBundleURLProvider sharedSettings]
        jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];

    NSLog(@"===== BUNDLE URL: %@ =====", jsURL);

    return jsURL;
#else
    return [[NSBundle mainBundle] URLForResource:@"main"
                                   withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    return [super application:application
                       openURL:url
                       options:options]
        || [RCTLinkingManager application:application
                                   openURL:url
                                   options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application
 continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
    BOOL result =
        [RCTLinkingManager application:application
                 continueUserActivity:userActivity
                   restorationHandler:restorationHandler];

    return [super application:application
        continueUserActivity:userActivity
          restorationHandler:restorationHandler] || result;
}

// Remote notifications
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [super application:application
didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application
didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [super application:application
didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    [super application:application
didReceiveRemoteNotification:userInfo
fetchCompletionHandler:completionHandler];
}

@end
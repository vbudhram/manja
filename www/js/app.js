// Ionic Manja App
var app = angular.module('starter', ['ionic', 'manja.controllers', 'manja.services', 'manja.directives', 'ngCordova', 'ionicLazyLoad', 'ngOpenFB', 'ion-zoom-view'])

    .run(function ($ionicPlatform, $rootScope) {
        $ionicPlatform.ready(function () {
            // Parse.initialize("XXX", "XXX");

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleBlackTranslucent();
            }

            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 150);

            //$rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
            //    if (notification.alert) {
            //        navigator.notification.alert(notification.alert);
            //    }
            //
            //    if (notification.sound) {
            //        var snd = new Media(event.sound);
            //        snd.play();
            //    }
            //
            //    if (notification.badge) {
            //        $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
            //            // Success!
            //        }, function (err) {
            //            // An error occurred. Show a message to the user
            //        });
            //    }
            //});
            //
            //$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
            //    switch(notification.event) {
            //        case 'registered':
            //            if (notification.regid.length > 0 ) {
            //                alert('registration ID = ' + notification.regid);
            //            }
            //            break;
            //
            //        case 'message':
            //            // this is the actual push notification. its format depends on the data model from the push server
            //            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
            //            break;
            //
            //        case 'error':
            //            alert('GCM error = ' + notification.msg);
            //            break;
            //
            //        default:
            //            alert('An unknown GCM event has occurred');
            //            break;
            //    }
            //});
        });
    })

    //.run(function ($cordovaSplashscreen) {
    //    if ($cordovaSplashscreen) {
    //        setTimeout(function () {
    //            $cordovaSplashscreen.hide();
    //        }, 250);
    //    }
    //})

    //.run(function ($ionicPlatform) {
    //
    //})
    .config(function ($ionicConfigProvider) {
        //$ionicConfigProvider.tabs.position('top'); // other values: top
        //$ionicConfigProvider.tabs.position('bottom'); // other values: top
    })

    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(1);
    })

    .config(function ($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/\/img|..\/\b/);

        //$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            .state('main', {
                url: '/main',
                templateUrl: "templates/main.html"
            })

            .state('login', {
                url: '/login',
                templateUrl: "templates/login.html"
            })

            .state('signup', {
                url: '/signup',
                templateUrl: "templates/signup.html",
                controller: 'RegisterCtrl'
            })

            .state('slides', {
                url: '/slides',
                templateUrl: "templates/slides.html"
            })

            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            .state('tab.feed', {
                url: '/feed',
                views: {
                    'tab-feed': {
                        templateUrl: 'templates/tab-feed.html',
                        controller: 'FeedCtrl'
                    }
                }
            })

            .state('tab.search', {
                url: '/search',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/tab-search.html',
                        controller: 'SearchCtrl'
                    }
                }
            })

            .state('tab.camera', {
                url: '/camera',
                views: {
                    'tab-camera': {
                        templateUrl: 'templates/tab-camera.html',
                        controller: 'CameraCtrl'
                    }
                }
            })

            .state('tab.camera-post', {
                url: '/camera/post',
                views: {
                    'tab-camera': {
                        templateUrl: 'templates/tab-post.html',
                        controller: 'UploadCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })

            .state('tab.account-avatar', {
                url: '/account/avatar',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/avatar.html',
                        controller: 'AvatarCtrl'
                    }
                }
            })

            .state('tab.account-settings', {
                url: '/account/settings',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('tab.account-privacy', {
                url: '/account/privacy',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/privacy.html'
                    }
                }
            })

            .state('tab.account-eula', {
                url: '/account/eula',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/eula-modal.html'
                    }
                }
            })

            .state('tab.account-terms', {
                url: '/account/terms',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/terms.html'
                    }
                }
            })

            .state('tab.account-about', {
                url: '/account/about',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/about.html'
                    }
                }
            })

            .state('tab.account-user', {
                url: '/account/user/:id',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })

            .state('tab.photo', {
                url: '/photo',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/photo/photo.html'
                    }
                }
            })

            .state('user', {
                url: '/user',
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            })

            .state('user-detail', {
                url: '/user/:id',
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            })

            .state('user-followers', {
                url: '/user/:id/followers',
                templateUrl: 'templates/user-list.html',
                controller: 'FollowerCtrl'
            })

            .state('user-following', {
                url: '/user/:id/following',
                templateUrl: 'templates/user-list.html',
                controller: 'FollowingCtrl'
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/main');
    });
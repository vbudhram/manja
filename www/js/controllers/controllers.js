var app = angular.module('manja.controllers', [])
    .controller('DashCtrl', function ($scope) {
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.backgroundColorByHexString('#F89406');
        }
    });
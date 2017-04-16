var app = angular.module('manja.controllers');

app.controller('SettingsCtrl', function ($scope, $state, $ionicHistory, $location, $window, UserService) {
    $scope.logout = function () {
        UserService.logout().then(function () {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go('main', {}, {reload: true});
        });
    };

    $scope.openEmail = function () {
        cordova.plugins.email.open({
            to: 'team.motiveate@gmail.com',
            cc: ['vbudhram@gmail.com', 'bmayrsohn@knights.ucf.edu'],
            subject: 'Manja Feedback',
            body: 'Found a bug? Wanna leave feedback? We love to hear from you!'
        });
    }
});

app.controller('AboutCtrl', function ($scope) {
    if(window.cordova){
        window.cordova.getAppVersion.getVersionNumber().then(function (version) {
            $scope.version = version;
        });
    }else{
        $scope.version = 'Browser Version';
    }

});

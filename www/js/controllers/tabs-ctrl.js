var app = angular.module('manja.controllers')

    .controller('TabsCtrl', function ($scope, $rootScope, $state, $location, $ionicHistory, $ionicNavBarDelegate, UserService) {
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            console.log('Changing state: ' + toState.name);

            //console.log('View stack: ' + JSON.stringify($ionicHistory.viewHistory()));
            //if($ionicNavBarDelegate.showBackButton()){
            //    $rootScope.closeButton = false;
            //}else{
            //    $rootScope.closeButton = true;
            //}

            $rootScope.closeButton = true;
            switch (toState.name){
                case 'tab.account': {
                    $rootScope.closeButton = false;
                    break;
                }
            }
        });
    });
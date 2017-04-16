/**
 * Created by vbudhram on 6/12/15.
 */
var app = angular.module('manja.controllers')
    .controller('FollowingCtrl', function ($scope, $state, $stateParams, $location, $rootScope, $ionicHistory, UserService) {
        $scope.title = 'Following';

        function getUserFollowing() {
            var userId = $stateParams.id || Parse.User.current().id;
            UserService.getUserFollowing(userId).then(function (users) {
                users.forEach(function (user) {
                    if(user && user.id){
                        user.href = '#/user/' + user.id;
                    }
                });
                $scope.users = users;
            });
        }

        $scope.close = function () {
            var backView = $ionicHistory.backView();
            $location.path(backView.url);
        };

        $scope.init = function () {
            getUserFollowing();
        }
    });
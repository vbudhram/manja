/**
 * Created by vbudhram on 6/12/15.
 */
var app = angular.module('manja.controllers')
    .controller('FollowerCtrl', function ($scope, $state, $stateParams, $location, $rootScope, $ionicHistory, UserService) {
        $scope.title = 'Followers';

        function getUserFollowers() {
            var userId = $stateParams.id || Parse.User.current().id;
            UserService.getUserFollowers(userId).then(function (users) {
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
            getUserFollowers();
        }
    });
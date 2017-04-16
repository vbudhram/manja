/**
 * Created by vbudhram on 6/1/15.
 */
var app = angular.module('manja.controllers')
    .controller('AccountHistoryCtrl', function ($scope, $rootScope, $ionicHistory, $state, $stateParams, PostService) {
        var userId = $stateParams.id || Parse.User.current().id;
        PostService.getPosts(userId).then(function (posts) {
            console.log('Got ' + posts.length + ' posts');
            var index = 0;
            var rowParts = [];
            rowParts[0] = [];
            posts.forEach(function(post, i){
                if(i%2 === 0){
                    index++;
                    rowParts[index] = [];
                }
                rowParts[index].push(post);
            });

            $scope.rowParts = rowParts;
            $scope.posts = posts;
        });
    });
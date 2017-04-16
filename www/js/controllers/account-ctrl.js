var app = angular.module('manja.controllers');
app.controller('AccountCtrl', function ($scope, $rootScope, $ionicHistory, $state, $stateParams, $location, $ionicModal, UserService, PostService, UtilService) {
    var userId = $stateParams.id || Parse.User.current().id;
    //$scope.isSelf = true;
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (Parse.User.current().id === userId) {
            $scope.canFollow = false;
            $scope.isSelf = true;
        } else {
            $scope.isSelf = false;
        }
    });

    function updateHistory(posts) {
        console.log('Got ' + posts.length + ' posts');
        var index = 0;
        var rowParts = [];
        rowParts[0] = [];
        posts.forEach(function (post, i) {
            if (i % 3 === 0) {
                index++;
                rowParts[index] = [];
            }
            rowParts[index].push(post);
        });

        $scope.$apply(function () {
            $scope.rowParts = rowParts;
        });
    }

    function updateView() {
        return new Promise.resolve().then(function () {
            return [UserService.getUser(userId), UserService.getUserFollowers(userId), UserService.getUserFollowing(userId), PostService.getPosts(userId)]
        }).spread(function (user, followers, following, posts) {
            $scope.currentUser = user;
            $scope.followerCount = followers.length;
            $scope.followingCount = following.length;
            $scope.uploadCount = posts.length;

            // Enable follow button if user is not currently following person
            var currentUserId = Parse.User.current().id;
            if (currentUserId === userId) {
                $scope.canFollow = false;
                $scope.isSelf = true;
            } else {
                $scope.canFollow = true;
                $scope.isSelf = false;
                for (var i = 0; i < followers.length; i++) {
                    var tempUser = followers[i];
                    if (currentUserId === tempUser.id) {
                        $scope.canFollow = false;
                        break
                    }
                }
            }
            updateHistory(posts);
        });
    }

    $scope.doRefresh = function () {
        UtilService.showLoading('Loading');
        updateView().then(function () {
            $scope.$broadcast('scroll.refreshComplete');
            UtilService.hideLoading('Loading');
        }).catch(function (err) {
            UtilService.hideLoading('Loading');
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.init = function () {
        $scope.doRefresh();
    };

    $scope.close = function () {
        var backView = $ionicHistory.backView();
        console.log(JSON.stringify(backView));
        $state.go(backView.stateId);
        //$location.path(backView.url);
    };

    $scope.clickedFollow = function () {
        console.log('Clicked following...');
        UserService.toggleFollowUser(Parse.User.current().id, userId).then(function () {
            console.log('Toggled following user: ' + userId);
            $scope.canFollow = !$scope.canFollow;
        }).catch(function (err) {
            console.log('Error toggling following user: ' + userId);
        })
    };

    $ionicModal.fromTemplateUrl('templates/modals/image-modal.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.imageModal = modal;
    });

    $scope.openModal = function (post) {
        var url = post._serverData.imageFile._url;
        $scope.imageModal.post = post;
        $scope.imageModal.show();
        $scope.imgUrl = url;
    };

    $scope.flagPostModal = function (post) {
        console.log('Flagging post postId: ' + post.id);
        var confirm = UtilService.showConfirmation('Flag Post', 'Are you sure you want to flag this post as inappropriate? Doing so will remove it from your feed and notify administrators.');
        confirm.then(function (yes) {
            if (yes) {
                PostService.flagPost(post).then(function (postUpdated) {
                    $scope.doRefresh();
                    $scope.imageModal.hide();
                }, function (err) {
                    console.log('Error: ' + err.message);
                });
            }
        });
    };

    $scope.blockUser = function () {
        var user = $scope.currentUser;
        console.log('Block userId: ' + user.id);
        var confirm = UtilService.showConfirmation('Block User', 'Are you sure you want to block ' + user.displayName + '?');
        confirm.then(function (yes) {
            if (yes) {
                UserService.blockUser(Parse.User.current().id, user.id).then(function (result) {
                    if(result.length > 0){

                    }else{

                    }
                    $scope.doRefresh();
                }, function (err) {
                    console.log('Error: ' + err.message);
                });
            }
        });
    };
});
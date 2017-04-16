/**
 * Created by vbudhram on 5/31/15.
 */
var app = angular.module('manja.controllers');

app.controller('FeedCtrl', function ($scope, $rootScope, $state, $ionicHistory, UserService, PostService, UtilService, $ionicModal) {

    var isLoadingMore = false;
    $scope.comment = {};

    $rootScope.$on('postEvent', function () {
        console.log('New post, reloading feed');
        $scope.init();
    });

    $scope.init = function () {
        $scope.doRefresh();
    };

    $scope.doRefresh = function () {
        var currentUser = UserService.getCurrentUser();
        //UtilService.showLoading('Searching...');
        PostService.getFollowingPosts(currentUser.id, true).then(function (posts) {
            console.log('Updating feed...');
            //UtilService.hideLoading();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.posts = posts;
        }, function (err) {
            console.log('Error occurred' + err.message);
            //UtilService.hideLoading();
        });
    };

    $ionicModal.fromTemplateUrl('templates/modals/image-modal.html', {
        scope: $scope
    }).then(function (imageModal) {
        $scope.imageModal = imageModal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/comments-modal.html', {
        scope: $scope,
        controller: 'CommentCtrl'
    }).then(function (commentModal) {
        $scope.commentModal = commentModal;
    });

    $scope.openImageModal = function (post) {
        var url = post._serverData.imageFile._url;
        $scope.imageModal.post = post;
        $scope.imageModal.show();
        $scope.imgUrl = url;
    };

    $scope.flagPostModal = function(post){
        $scope.flagPost(post);
        $scope.imageModal.hide();
    };

    $scope.openCommentModal = function (post) {
        PostService.getComments(post).then(function(comments){
            $scope.comments = comments;
            $scope.commentModal.show();
            $scope.selectedPost = post;
        }, function(err){
            UtilService.showAlert('Error', 'Failed to get comments. Try again later')
        });
    };

    $scope.likePost = function (post) {
        PostService.likePost(post).then(function (postUpdated) {
            post = postUpdated;
        }, function (err) {
            console.log('Error: ' + err.message);
        });
    };

    $scope.addRating = function (post, rating) {
        console.log('Adding rating ' + rating + ' to postId: ' + post.id);
        PostService.addRating(post, rating).then(function(postUpdated){
            post.rated = true;
        }, function (err) {
            console.log('Error: ' + err.message);
        });
    };

    $scope.flagPost = function(post){
        console.log('Flagging post postId: ' + post.id);
        var confirm = UtilService.showConfirmation('Flag Post', 'Are you sure you want to flag this post as inappropriate? Doing so will remove it from your feed and notify administrators.');

        confirm.then(function(yes){
            if(yes){
                PostService.flagPost(post).then(function(postUpdated){
                    $scope.posts.splice($scope.posts.indexOf(post), 1);
                }, function (err) {
                    console.log('Error: ' + err.message);
                });
            }
        });
    };

    $scope.addComment = function () {
        if($scope.comment && $scope.comment.text){
            var post = $scope.selectedPost;
            console.log('Adding comment to post: ' + post.id);
            PostService.addComment(post, $scope.comment.text).then(function(comment){
                $scope.comments.push(comment);
                $scope.comment.text = '';

                if($scope.selectedPost.attributes.commentCount){
                    $scope.selectedPost.attributes.commentCount += 1;
                }else{
                    $scope.selectedPost.attributes.commentCount = 1;
                }
            });
        }else{
            UtilService.showAlert('Error', 'Please enter a comment.')
        }
    };

    $scope.loadMoreFeed = function () {
        if ($scope.posts && ($scope.posts.length > 0) && !isLoadingMore) {
            isLoadingMore = true;
            var lastPostDate = $scope.posts[$scope.posts.length - 1];
            var currentUser = UserService.getCurrentUser();
            PostService.getFollowingPosts(currentUser.id, true, lastPostDate.createdAt).then(function (posts) {
                console.log('Fetching more feed posts...');
                $scope.$broadcast('scroll.infiniteScrollComplete');
                posts.forEach(function (post) {
                    $scope.posts.push(post);
                });
                isLoadingMore = false;
            }, function (err) {
                console.log('Error occurred' + err.message);
                isLoadingMore = false;
            });
        }else{
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
    };
});
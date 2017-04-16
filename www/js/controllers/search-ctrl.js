var app = angular.module('manja.controllers');
app.controller('SearchCtrl', function ($scope, $state, $stateParams, PostService, UtilService, UserService, $ionicModal) {

    $scope.devicePlatform = ionic.Platform.platform();

    // TODO This sucks...need to find a better way to debugging on device and chrome
    try {
        if (device && device.platform) {
            $scope.device = true;
        }
    } catch (err) {
        $scope.device = false;
    }

    //console.log(ionic.Platform.device());
    //console.log(ionic.Platform.isWebView());
    //console.log(ionic.Platform.isIPad());
    //console.log(ionic.Platform.isIOS());
    //console.log(ionic.Platform.isAndroid());
    //console.log(ionic.Platform.isWindowsPhone());
    //console.log(ionic.Platform.platform());
    //console.log(ionic.Platform.version());
    //console.log('Device: ' + $scope.devicePlatform);

    $scope.searchOptions = {};
    $scope.searchType = 'photo';

    function updateSearch(posts) {
        console.log('Got ' + posts.length + ' posts');
        var index = 0;
        var rowParts = [];
        rowParts[0] = [];
        posts.forEach(function (post, i) {
            if (i % 4 === 0) {
                index++;
                rowParts[index] = [];
            }
            rowParts[index].push(post);
        });

        //$scope.$apply(function () {
        $scope.rowParts = rowParts;
        //});
    }

    $scope.init = function () {
        $scope.search();
    };

    $scope.setSearchType = function (type) {
        $scope.searchType = type;
        $scope.search();
    };

    $scope.search = function (searchTerm) {
        var term = searchTerm || $scope.searchOptions.searchTerm;
        console.log('Searching for : ' + term);
        UtilService.showLoading('Searching...');

        $scope.hideKeyboard();

        if ($scope.searchType === 'photo') {
            PostService.searchPost(term).then(function (posts) {
                UtilService.hideLoading();
                updateSearch(posts);

                //var wookmark = new Wookmark('#image-results');
            });
        } else if ($scope.searchType === 'people') {
            UserService.searchUsers(term).then(function (users) {
                UtilService.hideLoading();
                $scope.users = users;
            });
        }
    };

    $scope.hideKeyboard = function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.close();
        }
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

    $scope.flagPostModal = function(post){
        console.log('Flagging post postId: ' + post.id);
        var confirm = UtilService.showConfirmation('Flag Post', 'Are you sure you want to flag this post as inappropriate? Doing so will remove it from your feed and notify administrators.');

        confirm.then(function(yes){
            if(yes){
                PostService.flagPost(post).then(function(postUpdated){
                    $scope.search();
                    $scope.imageModal.hide();
                }, function (err) {
                    console.log('Error: ' + err.message);
                });
            }
        });
    };
});
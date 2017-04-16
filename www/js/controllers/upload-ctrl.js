var app = angular.module('manja.controllers')

    .controller('UploadCtrl', function ($scope, $state, $ionicHistory, UploadService, UserService, PostService, $cordovaGeolocation) {
        var image = document.getElementById('post-image');
        image.src = UploadService.getLastUploadB64();

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                console.log('Position: ' + JSON.stringify(position));
            }, function (err) {
                // error
            });

        function updateStarTo(value) {
            for (var i = 0; i < 5; i++) {
                if (i <= value) {
                    $scope['star' + i] = true;
                } else {
                    $scope['star' + i] = false;
                }
            }

            $scope.rating = (value + 1) * 2;
        }

        updateStarTo(-1);

        $scope.description = {};
        $scope.rating = 0;
        $scope.submit = function () {
            var postData = {};
            if ($scope.description.text) {
                postData.description = $scope.description.text;
            }

            postData['user_rating'] = $scope.rating;

            PostService.createPost(postData).then(function () {
                $ionicHistory.clearHistory();
                $state.go('tab.feed');
            });
        };

        $scope.selectStar = function (star) {
            switch (star) {
                case 'star0':
                {
                    updateStarTo(0);
                    break;
                }
                case 'star1':
                {
                    updateStarTo(1);
                    break;
                }
                case 'star2':
                {
                    updateStarTo(2);
                    break;
                }
                case 'star3':
                {
                    updateStarTo(3);
                    break;
                }
                case 'star4':
                {
                    updateStarTo(4);
                    break;
                }
            }
        }
    });
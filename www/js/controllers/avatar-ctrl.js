var app = angular.module('manja.controllers');

app.controller('AvatarCtrl', function ($scope, $rootScope, $ionicHistory, $state, $stateParams, AvatarService) {
    var userId = $stateParams.id || Parse.User.current().id;

    function configureAvatar() {
        AvatarService.getScore(userId).then(function (stats) {

            var score = stats.score;
            var crowdAverage = 0;
            var userAverage = 0;
            Object.keys(stats.dayStats).forEach(function(day){
                var dayStat = stats.dayStats[day];
                crowdAverage = dayStat.crowdRatingAvg ? dayStat.crowdRatingAvg : 0;
                userAverage = dayStat.userRatingAvg ? dayStat.userRatingAvg : 0;
            });

            console.log('Setting avatar with score ' + score);
            var avatarImage = ['img/avatar/', score, '.png'].join('');
            var avatar = {
                image: avatarImage,
                score: score,
                crowdAverage: crowdAverage,
                userAverage: userAverage
            };
            $scope.avatar = avatar;
        }, function (err) {

        });
    }

    configureAvatar();
});
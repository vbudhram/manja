var app = angular.module('manja.controllers');

app.controller('LoginCtrl', function ($scope, $rootScope, $state, $q, $timeout, $window, $ionicHistory, $ionicModal, UserService, UtilService) {

    $scope.$on("$ionicView.enter", function () {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
    });

    $scope.facebookLogin = function () {
        UtilService.showLoading('Logging in...');
        var currentPlatform = ionic.Platform.platform();
        if (currentPlatform === 'macintel') {
            // Using a computer
            return UserService.facebookLogin().then(function () {
                UtilService.hideLoading();
                $state.go('tab.feed');
            }).catch(function (err) {
                UtilService.hideLoading();
                UtilService.showAlert('Error', err.message);
            });
        } else {
            var fbLoginSuccess = function (userData) {
                if (!userData.authResponse) {
                    fbLoginError("Cannot find the authResponse");
                    return;
                }
                var expDate = new Date(
                    new Date().getTime() + userData.authResponse.expiresIn * 1000
                ).toISOString();
                var authData = {
                    id: String(userData.authResponse.userID),
                    access_token: userData.authResponse.accessToken,
                    expiration_date: expDate
                };
                fbLogged.resolve(authData);
                fbLoginSuccess = null;
            };

            var fbLoginError = function (error) {
                fbLogged.reject(error);
            };

            var fbLogged = new Parse.Promise();
            facebookConnectPlugin.login(["email", "user_birthday"], fbLoginSuccess, fbLoginError);

            return fbLogged.then(function (authData) {
                return Parse.FacebookUtils.logIn(authData);
            }).then(function (user) {
                UserService.handleFacebookLogin(user).then(function (updatedUser) {
                    UtilService.hideLoading();
                    $state.go('tab.feed', {}, {reload: true});
                }).catch(function (err) {
                    console.log('err object ' + JSON.stringify(err));
                    UtilService.hideLoading();
                    UtilService.showAlert('Error', JSON.stringify(err));
                })
            }, function (err) {
                UtilService.hideLoading();
                UtilService.showAlert('Error', JSON.stringify(err));
            });
        }
    };

    $scope.login = function () {
        UtilService.showLoading('Logging in...');
        return UserService.login($scope.username, $scope.password).then(function () {
            UtilService.hideLoading();
            $state.go('tab.feed', {}, {reload: true});
        }).catch(function (err) {
            UtilService.hideLoading();
            UtilService.showAlert('Error', 'Failed to login with credentials');
        });
    };

    $ionicModal.fromTemplateUrl('templates/modals/eula-modal.html', {
        scope: $scope
    }).then(function (eulaModal) {
        $scope.eulaModal = eulaModal;
    });
});
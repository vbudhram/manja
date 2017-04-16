var app = angular.module('manja.controllers');

app.controller('RegisterCtrl', function ($scope, $rootScope, $state, $q, $timeout, $window, $ionicModal, UserService, UtilService) {
    $scope.signup = function () {
        console.log('Creating user...');
        var userOptions = {
            username: $scope.username,
            email: $scope.email,
            password: $scope.password
        };

        return UserService.createUser(userOptions)
            .then(function () {
                return UserService.login(userOptions.email, userOptions.password);
            })
            .then(function () {
                $state.go('tab.feed', {}, {reload: true});
            })
            .catch(function (err) {
                console.log(JSON.stringify(err));
                UtilService.showAlert('Error', 'Failed to create user: ' + err.message);
            });
    };

    $ionicModal.fromTemplateUrl('templates/modals/eula-modal.html', {
        scope: $scope
    }).then(function (eulaModal) {
        $scope.eulaModal = eulaModal;
    });
});
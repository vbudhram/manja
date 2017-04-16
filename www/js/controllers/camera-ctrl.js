var app = angular.module('manja.controllers')

    .controller('CameraCtrl', function ($scope, $state, UploadService, CameraService, UtilService) {
        $scope.takePicture = function () {
            try {
                CameraService.getCameraPicture().then(function (data) {
                    UploadService.setLastUploadData(data);
                    $state.go('tab.camera-post');
                }, function (err) {
                    if(err.message){
                        UtilService.showAlert('Error', err.message);
                    }
                });
            } catch (err) {
                if(err.message){
                    UtilService.showAlert('Error', err.message);
                }
            }
        };

        $scope.useCameraRoll = function () {
            try {
                CameraService.getRollPicture().then(function (data) {
                    UploadService.setLastUploadData(data);
                    $state.go('tab.camera-post');
                }, function (err) {
                    if(err.message){
                        UtilService.showAlert('Error', err.message);
                    }
                });
            } catch (err) {
                //UtilService.showAlert('Error', err.message);
                //UploadService.setLastUploadData(data);
                $state.go('tab.camera-post');
            }

        }
    });
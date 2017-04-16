/**
 * Created by vbudhram on 5/31/15.
 */
angular.module('manja.services')
    .factory('UtilService', function ($ionicPopup, $ionicLoading) {
        return {
            showConfirmation: function(title, message){
                var confirmPopup = $ionicPopup.confirm({
                    title: title,
                    template: message
                });
                return confirmPopup;
            },
            showAlert: function (title, message) {
                var alert = $ionicPopup.alert({
                    title: title,
                    template: message
                });

                return alert;
            },
            showLoading: function (message) {
                $ionicLoading.show({
                    content: message || 'Loading...',
                    animation: 'fade-in',
                    maxWidth: 200,
                    showDelay: 500
                });
            },
            hideLoading: function () {
                $ionicLoading.hide();
            }
        };
    })

    .factory('CameraService', function ($cordovaCamera) {

        return {
            getCameraPicture: function () {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    correctOrientation: true,
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    targetWidth: 1024,
                    targetHeight: 1024
                };
                return $cordovaCamera.getPicture(options);
            },
            getRollPicture: function () {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    correctOrientation: true,
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    targetWidth: 1024,
                    targetHeight: 1024
                };
                return $cordovaCamera.getPicture(options);
            }
        }
    })

    .factory('AvatarService', function ($q) {
        return {
            getScore: function (userId) {
                console.log('Getting avatar score for userId ' + userId);
                var defer = $q.defer();

                Parse.Cloud.run('getAvatarRating', {userId: userId}, {
                    success: function (result) {
                        console.log('Rating : ' + JSON.stringify(result));
                        defer.resolve(result);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });

                return defer.promise;
            }
        };
    })

    .factory('UploadService', ['$q', function ($q) {
        var lastUploadedData = '/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAZKADAAQAAAABAAAAZAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAZABkAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAGxsbGxsbLxsbL0IvLy9CWUJCQkJZcFlZWVlZcIhwcHBwcHCIiIiIiIiIiKOjo6Ojo76+vr6+1dXV1dXV1dXV1f/bAEMBISMjNjI2XTIyXd+XfJff39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3//dAAQAB//aAAwDAQACEQMRAD8AxmxnIpKt28KMpZhmmzwBBvTp3FPmV7AVqWmVYV4xHjblqdwIxTs1Yit8/NJ+VTeRF6UudBYpZpc1c8iP3pPs8fqaOdBYqZo3GrX2ZPU0fZl/vGnzoLFbcfWk3n1qz9lH979KT7Kf736UcyCxX3mjeamNq/Yik+yv6ilzILH/0M23kx+7PU9KtS8Rtu44qhGquCD17Gm5y+2Q8Ck1qMZV61RSpbvmqFWYXCqcjPNVLYSNAnFN3iogVb7vP0FAxis7FEu7NOBFRCjIoAmzS1AXCjJPFO3UWAkOe1IXCjJphfAJqrhWIJOfqaLAWcSNznH50bH9f1NM8vPIz+dHln3/ADoCx//RxEYqcihjk5ptFMAqaKR4wduPxFQ1PCetD2BCs7sc9/bNAaWpaMVNyrDUkwfnyPrU2SeRUdNwByp2n9KQEpGetLzUPmODlv0pDKx6CmBOxGOarqoz04poyfmc07zlAxjNAEwbAwKN5qt53tR53tRYLn//0sGloxS4pgJTlYr0owamijzu3DjFJsBgkaniU9xUNFFh3LIlQ9QRUi+U3Q1SopWC5o+SKgmAXCjvU9s+9MHqKWWMt8y9RUXs9TS11oZzMWOOlPELFd2ajYHvQkjIeK09DP1HmB6PIerqzIVBJGaXzY/UVHMy+VH/06IFKAKoiWQd6XzpPWlYdy/wOTxVaWYMNidO5qsWLdTmiiwXFpabS0xC0UlFAFi3fZIM9DxWix7VjVpRuHQMazmuppB9CORAfmA471TdNvIrRO4j5ari2cnLEfWiMu4SXYqYY9qNrelXTbc8HP1pPs1VzonlZ//UwaSlopgJS0UUALRRRQAUtFFIAq5aMMlD9RVOpISRKuPWlJXQ09TWxSYp1JWBuNooxRigD//Vw6KKKYBSgUlOXrQA8IDUyxIaYtTrUsYogjqQW8XpTlqQVNwGC2h9KeIIl+ZRyKkFOPSkNEVJS0lZmwlFFFAH/9k=';
        return {
            getLastUploadB64: function () {
                return 'data:image/png;base64,' + lastUploadedData;
            },
            setLastUploadData: function (data) {
                lastUploadedData = data;
            },
            getLastUploadData: function () {
                return lastUploadedData;
            }
        }
    }]);

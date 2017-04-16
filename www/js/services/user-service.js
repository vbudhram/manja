/**
 * Created by vbudhram on 5/31/15.
 */
var app = angular.module('manja.services');
app.factory('UserService', function ($http, $q) {
    var users = [];

    function getUserObject(objectId) {
        var defer = $q.defer();
        if (users[objectId]) {
            defer.resolve(users[objectId]);
        } else {
            var query = new Parse.Query(Parse.User);
            query.equalTo("objectId", objectId);
            query.find({
                success: function (user) {
                    if (user.length === 0) {
                        defer.reject(new Error('User does not exist'));
                    }
                    users[objectId] = user[0];
                    defer.resolve(user[0]);
                }
            });
        }
        return defer.promise;
    }

    function updateInstallationId(user) {
        return new Promise(function (resolve, reject) {
            parsePlugin.initialize('DEV', 'DEV', function () {
                parsePlugin.subscribe('MainChannel', function () {
                    parsePlugin.getInstallationId(function (installationId) {
                        if (installationId === user.get('installationId')) {
                            resolve(user);
                        } else {
                            user.set('installationId', installationId);
                            user.save(null, {
                                success: function (userObj) {
                                    resolve(userObj);
                                },
                                error: function (userObj, error) {
                                    resolve(user);
                                }
                            });
                        }
                    }, function (err) {
                        reject(err);
                    })
                }, function (err) {
                    reject(err);
                });
            }, function (err) {
                reject(err);
            });

        });
    };

    function updateUserProfileImage(user, imageUrl) {
        return new Promise(function (resolve, reject) {
            function getBase64FromImageUrl(URL) {
                var img = new Image();
                img.setAttribute('crossOrigin', 'anonymous');
                img.src = URL;
                img.onload = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = this.width;
                    canvas.height = this.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                    var dataURL = canvas.toDataURL("image/png");

                    // Set image
                    var base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                    var image = new Parse.File("image.png", {base64: base64});
                    user.set('picture', image);
                    user.save(null, {
                        success: function (userObj) {
                            console.log('Updated profile picture...' + JSON.stringify(userObj));
                            resolve(userObj);
                        },
                        error: function (userObj, error) {
                            console.log('Failed to profile picture...');
                            resolve(userObj);
                        }
                    });
                }
            }

            getBase64FromImageUrl(imageUrl);
        });
    }

    function handleFacebookLogin(user) {
        return new Promise(function (resolve, reject) {
            if (!user.existed()) {
                console.log("User signed up and logged in through Facebook!");

                // Use REST api to get user data
                var userReq = {
                    method: 'GET',
                    url: 'https://graph.facebook.com/v2.3/me',
                    params: {
                        access_token: user.attributes.authData.facebook.access_token,
                        format: 'json'
                    }
                };

                $http(userReq).
                    success(function (response, status, headers, config) {
                        console.log('User response: ' + JSON.stringify(response));
                        user.set("username", response.email.toLowerCase());
                        user.set("displayName", response.name);
                        user.set("email", response.email.toLowerCase());
                        user.set('lvl', 1);
                        user.set('curXP', 0);
                        user.set('nextXP', 3);

                        var imageReq = {
                            method: 'GET',
                            url: 'https://graph.facebook.com/v2.3/me/picture',
                            params: {
                                access_token: user.attributes.authData.facebook.access_token,
                                width: 180,
                                height: 180,
                                redirect: false // Returns url if false, data if true
                            }
                        };
                        $http(imageReq).
                            success(function (response, status, headers, config) {
                                console.log('Image response: ' + JSON.stringify(response));
                                updateUserProfileImage(user, response.data.url).then(function (updatedUser) {
                                    updateInstallationId(updatedUser).then(function () {
                                        resolve(updatedUser);
                                    }, function (err) {
                                        resolve(updatedUser);
                                    });
                                });
                            }).
                            error(function (data, status, headers, config) {
                                reject(data);
                            });
                    }).
                    error(function (data, status, headers, config) {
                        reject(data);
                    });
            } else {
                console.log("User logged in through Facebook!");
                updateInstallationId(user).then(function () {
                    resolve(user);
                }, function (err) {
                    resolve(user);
                });
            }
        })
    }

    return {
        getUserFollowers: function (objectId) {
            var defer = $q.defer();
            getUserObject(objectId).then(function (user) {
                var UserFollow = Parse.Object.extend("User_Follow");
                var query = new Parse.Query(UserFollow);
                query.equalTo("toUserId", user);
                query.include("toUserId");
                query.include("user");
                query.find({
                    success: function (result) {
                        var following = [];
                        result.forEach(function (item) {
                            following.push(item.attributes['user']);
                        });
                        defer.resolve(following);
                    },
                    error: function (err) {
                        defer.reject(err);
                    }
                });
            });
            return defer.promise;
        },
        getUserFollowing: function (objectId, includeSelf) {
            var defer = $q.defer();
            getUserObject(objectId).then(function (user) {
                var UserFollow = Parse.Object.extend("User_Follow");

                var query = new Parse.Query(UserFollow);
                query.equalTo("user", user);
                query.equalTo("type", "follow");
                query.include("toUserId");
                query.include("user");
                query.find({
                    success: function (result) {
                        var followers = [];
                        result.forEach(function (item) {
                            followers.push(item.attributes['toUserId']);
                        });

                        if (includeSelf) {
                            followers.push(Parse.User.current());
                        }
                        defer.resolve(followers);
                    },
                    error: function (err) {
                        defer.reject(err);
                    }
                });
            });
            return defer.promise;
        },
        getUserObject: getUserObject,
        getUser: function (objectId) {
            var defer = $q.defer();
            //return new Promise(function (resolve, reject) {
            getUserObject(objectId)
                .then(function (user) {
                    var tempUser = user.attributes;
                    tempUser.id = user.id;
                    if (!tempUser.picture) {
                        tempUser.picture = {
                            _url: 'http://files.parsetfss.com/18761c9b-2909-46df-851a-faa69a390d35/tfss-b170e544-39e0-488f-91c9-2ae413965a40-image.png'
                        }
                    }
                    defer.resolve(tempUser);
                });
            //});
            return defer.promise;
        },
        getCurrentUser: function () {
            var user = Parse.User.current();
            if (user && user.attributes && !user.attributes.picture) {
                user.attributes.picture = {
                    _url: 'http://files.parsetfss.com/18761c9b-2909-46df-851a-faa69a390d35/tfss-b170e544-39e0-488f-91c9-2ae413965a40-image.png'
                }
            }
            console.log('Logged in user: ' + JSON.stringify(user));
            return user;
        },
        facebookLogin: function () {
            return new Promise(function (resolve, reject) {
                return Parse.FacebookUtils.logIn(null, {
                    success: function (user) {
                        handleFacebookLogin(user).then(function (updatedUser) {
                            resolve(updatedUser);
                        });
                    },
                    error: function (user, error) {
                        console.log("User cancelled the Facebook login or did not fully authorize.");
                        reject(error);
                    }
                });
            });
        },
        login: function (email, password) {
            return new Promise(function (resolve, reject) {
                Parse.User.logIn(email, password, {
                    //Parse.User.logIn("vbudhram2@gmail.com", "password", {
                    success: function (user) {
                        updateInstallationId(user).then(function (updatedUser) {
                            resolve(updatedUser);
                        }, function (err) {
                            resolve(user);
                        });
                    },
                    error: function (user, error) {
                        console.log("Unable to login with credentials.");
                        reject(error);
                    }
                });
            });
        },
        logout: function () {
            return Parse.User.logOut();
        },
        createUser: function (userOptions) {
            return new Promise(function (resolve, reject) {
                var user = new Parse.User();
                /**
                 * Set user properties. Email and usernames are lowercase, user's start at level 1 with 0 XP.
                 */
                user.set("username", userOptions.email.toLowerCase());
                user.set("displayName", userOptions.username);
                user.set("password", userOptions.password);
                user.set("email", userOptions.email.toLowerCase());
                user.set('lvl', 1);
                user.set('curXP', 0);
                user.set('nextXP', 3);
                user.signUp(null, {
                    success: function (user) {
                        resolve(user);
                    },
                    error: function (user, error) {
                        reject(error);
                    }
                });
            });
        },
        searchUsers: function (term) {
            return new Promise(function (resolve, reject) {
                var query = new Parse.Query(Parse.User);

                if (term) {
                    var searchTerms = term.toLowerCase().split(' ');
                    query.containsAll("nameTokens", searchTerms);
                }

                //query.limit(100);
                query.find({
                    success: function (users) {
                        console.log('Found users ' + users.length);
                        resolve(users);
                    },
                    error: reject
                });
            });
        },
        blockUser: function (currentUserId, blockUserId) {
            var defer = $q.defer();
            getUserObject(currentUserId).then(function (currentUser) {
                getUserObject(blockUserId).then(function (blockUser) {
                    var query = new Parse.Query('User_Follow');
                    query.equalTo("toUserId", blockUser);
                    query.equalTo("user", currentUser);
                    query.find({
                        success: function (result) {
                            console.log('Block result: ' + JSON.stringify(result));
                            if (result.length === 0) {
                                var UserFollow = Parse.Object.extend("User_Follow");
                                var userFollow = new UserFollow();
                                userFollow.set('toUserId', blockUser);
                                userFollow.set('user', currentUser);
                                userFollow.set('type', 'blocked');
                                userFollow.save(null, {
                                    success: function (result) {
                                        defer.resolve(result);
                                    },
                                    error: function (err) {
                                        defer.reject(err);
                                    }
                                });
                            } else {
                                console.log('User is already following/blocked user, updating');
                                result[0].set('type', 'blocked');
                                result[0].save({
                                    success: function (myObject) {
                                        defer.resolve();
                                    },
                                    error: function (myObject, error) {
                                        defer.reject(error);
                                    }
                                });
                            }
                            defer.resolve(result);
                        },
                        error: function (error) {
                            console.log('Block error: ' + JSON.stringify(error));
                            defer.reject(error);
                        }
                    });
                });
            });

            return defer.promise;
        },
        // UserId follows toUserId
        toggleFollowUser: function (userId, toUserId) {
            var defer = $q.defer();
            //return new Promise(function (resolve, reject) {
            getUserObject(userId).then(function (user) {
                getUserObject(toUserId).then(function (toUser) {
                    var UserFollow = Parse.Object.extend("User_Follow"),
                        query = new Parse.Query(UserFollow);
                    query.equalTo("toUserId", toUser);
                    query.equalTo("user", user);
                    query.find({
                        success: function (result) {
                            console.log('Found result: ' + JSON.stringify(result));
                            if (result.length === 0) {
                                var userFollow = new UserFollow();
                                userFollow.set('toUserId', toUser);
                                userFollow.set('user', user);
                                userFollow.set('type', 'follow');
                                userFollow.save(null, {
                                    success: function (result) {
                                        defer.resolve(result);
                                    },
                                    error: function (err) {
                                        defer.reject(err);
                                    }
                                });
                            } else {
                                console.log('User is already following user, unfollowing user');
                                result[0].destroy({
                                    success: function (myObject) {
                                        defer.resolve();
                                    },
                                    error: function (myObject, error) {
                                        defer.reject(error);
                                    }
                                });
                            }
                        },
                        error: function (err) {
                            defer.reject(err);
                        }
                    });
                });
            });
            //});
            return defer.promise;
        },
        handleFacebookLogin: handleFacebookLogin
    };
});

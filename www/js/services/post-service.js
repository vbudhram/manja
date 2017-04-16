/**
 * Created by vbudhram on 5/31/15.
 */
angular.module('manja.services')
    .factory('PostService', function ($q, $rootScope, UserService, UploadService, UtilService) {
        var posts = [];

        return {
            getFollowingPosts: function (userObjectId, includeSelf, beforeDate) {
                var defer = $q.defer();
                UserService.getUserFollowing(userObjectId, includeSelf).then(function (users) {
                    var Post = Parse.Object.extend('Post');
                    var query = new Parse.Query(Post);
                    query.limit(10);
                    query.containedIn('user', users);
                    query.include('user');
                    query.include('raters');
                    query.descending('createdAt');
                    query.notEqualTo('flagged', true);

                    if (beforeDate) {
                        query.lessThan('createdAt', new Date(beforeDate));
                    }
                    query.find({
                        success: function (posts) {
                            // Add user info to post

                            // Enable disable ability to rate post
                            posts.forEach(function(post){
                               var raters = post.get('raters');
                                if(!raters || raters.indexOf(userObjectId) <= -1){
                                    post.rated = false;
                                }else{
                                    post.rated = true;
                                }
                            });

                            defer.resolve(posts);
                        }
                    });
                });
                return defer.promise;
            },
            getPosts: function (userObjectId) {
                return new Promise(function (resolve, reject) {
                    if (posts[userObjectId]) {
                        resolve(posts[userObjectId]);
                    } else {
                        UserService.getUserObject(userObjectId).then(function (user) {
                            var Post = Parse.Object.extend('Post');
                            var query = new Parse.Query(Post);
                            query.descending('createdAt');
                            query.equalTo('user', user);
                            query.notEqualTo('flagged', true);
                            query.find({
                                success: function (posts) {
                                    resolve(posts);
                                }
                            });
                        });
                    }
                });
            },
            createPost: function (postData) {
                var defer = $q.defer();
                var Post = Parse.Object.extend('Post');
                var post = new Post();
                var currentUser = UserService.getCurrentUser();

                post.set('description', postData.description);
                post.set('user_rating', postData['user_rating']);
                post.set('user', currentUser);

                // Set image
                var base64 = UploadService.getLastUploadData();
                var image = new Parse.File("image.png", {base64: base64});

                post.set('imageFile', image);

                UtilService.showLoading('Posting...');
                post.save(null, {
                    success: function (postObj) {
                        console.log('New object created with objectId: ' + postObj.id);

                        $rootScope.$broadcast('postEvent');

                        // Update user points
                        //var postPoints = 3;
                        //console.log('User posting:' + JSON.stringify(currentUser));
                        //if ((currentUser.attributes.curXP + postPoints) >= currentUser.attributes.nextXP) {
                        //    // Increment level
                        //    var curXP = (currentUser.attributes.curXP + postPoints) - currentUser.attributes.nextXP;
                        //    currentUser.set('lvl', currentUser.attributes.lvl + 1);
                        //    currentUser.set('curXP', curXP);
                        //    currentUser.set('nextXP', currentUser.attributes.nextXP * 2);
                        //} else {
                        //    // Update points
                        //    currentUser.set('curXP', currentUser.attributes.curXP + postPoints);
                        //}
                        //
                        //currentUser.save(null, {
                        //    success: function (user) {
                        //        UtilService.hideLoading();
                        //        defer.resolve();
                        //    },
                        //    error: function (user, err) {
                        //        UtilService.hideLoading();
                        //        defer.reject(err);
                        //    }
                        //});

                        UtilService.hideLoading();
                        defer.resolve();
                    },
                    error: function (postObj, error) {
                        console.log('Failed to create new object, with error code: ' + error.message);
                        UtilService.hideLoading();
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },
            likePost: function (post) {
                console.log('Liking post: ' + post.id);
                var defer = $q.defer();
                var currentUser = UserService.getCurrentUser();
                post.addUnique('fives', currentUser.id);

                // Save post
                post.save(null, {
                    success: function (updatedPost) {
                        defer.resolve(updatedPost);
                    },
                    error: function (post, err) {
                        defer.reject(err);
                    }
                });

                return defer.promise;
            },
            searchPost: function(search){
                var defer = $q.defer();
                var userId = Parse.User.current().id;
                var params = {
                    search: search,
                    userId: userId
                };

                UtilService.showLoading('');
                Parse.Cloud.run('searchPosts', params, {
                    success: function(posts) {
                        UtilService.hideLoading();
                        defer.resolve(posts);
                    },
                    error: function(error) {
                        UtilService.hideLoading();
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            getComments: function(post){
                var defer = $q.defer();

                var Comment = Parse.Object.extend('Comment');
                var query = new Parse.Query(Comment);
                query.ascending('createdAt');
                query.equalTo('Post', post);
                query.include('User');
                query.find({
                    success: function (objects) {
                        defer.resolve(objects);
                    },
                    error: function(objects, err){
                        console.log('Error: ' + error.message);
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },
            addComment: function (post, commentText) {
                var defer = $q.defer();
                var currentUser = UserService.getCurrentUser();

                var Comment = Parse.Object.extend('Comment');
                var comment = new Comment();

                comment.set('User', currentUser);
                comment.set('comment', commentText);
                comment.set('Post', post);

                UtilService.showLoading('');
                comment.save(null, {
                    success: function (object) {
                        console.log('New object created with objectId: ' + object.id);
                        UtilService.hideLoading();
                        defer.resolve(object);
                    },
                    error: function (object, error) {
                        console.log('Failed to create new object, with error code: ' + error.message);
                        UtilService.hideLoading();
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },
            addRating: function (post, rating) {
                var defer = $q.defer();
                var userId = Parse.User.current().id;
                var params = {
                    postId: post.id,
                    raterId: userId,
                    rating: rating
                };

                UtilService.showLoading('');
                Parse.Cloud.run('addRating', params, {
                    success: function(post) {
                        UtilService.hideLoading();
                        post.rated = true;
                        defer.resolve(post);
                    },
                    error: function(error) {
                        UtilService.hideLoading();
                        defer.reject(error);
                    }
                });
                return defer.promise;
            },
            flagPost: function (post) {
                console.log('Flagging post: ' + post.id);
                var defer = $q.defer();
                var currentUser = UserService.getCurrentUser();
                post.set('flagged', true);
                post.set('flaggedBy', currentUser.id);

                UtilService.showLoading('');

                // Save post
                post.save(null, {
                    success: function (updatedPost) {
                        UtilService.hideLoading();
                        defer.resolve(updatedPost);
                    },
                    error: function (post, err) {
                        UtilService.hideLoading();
                        defer.reject(err);
                    }
                });

                return defer.promise;
            }
        };
    });

angular.module('fseControllers', ['fseServices', 'ngCordova'])

.controller('AppCtrl', function ($scope, config, apiService) {

    apiService.getCats($scope);
    
    $scope.menuTitle = config.MENU_TITLE;
    $scope.pageTitle = config.SITE_NAME;
    $scope.facebookText = config.FACEBOOK_TEXT;
    $scope.contactUs = config.CONTACT_US;
    $scope.moreTags = config.MORE_TAGS;
    $scope.home = config.HOME;
    $scope.usefulLinks = config.USEFUL_LINK;
    
    $scope.openFacebookLink = function () {
        window.open(config.FACEBOOK_LINK, '_system', 'location=yes'); return false;
    };
    
    $scope.$watch('cats', function() {
        apiService.getCatsPosts($scope, false, false);
    });
})

.controller('postsCtrl', function ($scope, $stateParams, config, $rootScope, apiService) {
    
    $scope.pageNum = 1;
    if(typeof $stateParams.catId != "undefined"){
        $scope.getCategories = true;    
    } else $scope.getCategories = false;    
    if(typeof $stateParams.tagId != "undefined"){
        getTags = true;    
    } else getTags = false;    
    
    $scope.latestArticles = config.LATEST_ARTICLES;
    $scope.noMoreItemsAvailable = false;
    
    $scope.cats = $rootScope.cats;
    $scope.activeSlide = 0;
    
    $scope.refreshSlideInfo =  function ( index) {
        $scope.cats = $rootScope.cats;
        $scope.pageNum = 1;
        if (index !== 0){
            $scope.whichCat = $scope.cats[index].ID;
            $scope.getCategories = true;
            $scope.catId = $scope.whichCat;
            $scope.pageTitle = $scope.cats[index].name;
            //$scope.postContent = $sce.trustAsHtml(($filter('filter')($scope.posts, { ID: $scope.whichPost }))[0].content);
        } else {
            $scope.getCategories = false;
            
        }
        apiService.getCatsPosts($scope, $scope.getCategories, false);
            
    };
    apiService.getCatsPosts($scope, $scope.getCategories, getTags);
    
    $scope.doRefresh = function () {
        
        if (($scope.refreshDate == null || new Date() - $scope.refreshDate > 100000)) {
            $scope.pageNum = 1;
            $scope.refreshDate = new Date();
            apiService.getMorePosts($scope, $scope.getCategories, $scope.getTags);
        }
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function () {

        if (( (typeof $scope.loadingDate === "undefined") || (new Date() - $scope.loadingDate > 10000))
            && ($scope.pageNum < $scope.totalPageNum)) {
            $scope.loadingDate = new Date();
            $scope.pageNum = $scope.pageNum + 1;
            apiService.getMorePosts($scope, $scope.getCategories, getTags);
        }

        if ($scope.pageNum == $scope.totalPageNum) {
            $scope.noMoreItemsAvailable = true;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };
    
    $scope.shareAnywhere = function (message, subject, image, link) {
        window.plugins.socialsharing.share('','', '', link);
    }
})

.controller('postCtrl', function ($scope, $rootScope, $stateParams, $filter, config) {

    $scope.whichPost = $stateParams.postId;
    $scope.posts = $rootScope.posts;
    $scope.pageTitle = config.SITE_NAME;

//    $scope.postContent = $sce.trustAsHtml(($filter('filter')($scope.posts, { ID: $scope.whichPost }))[0].content);
    $scope.getPostIndex = function(){ 
        currentPost = $filter('filter')($scope.posts, { ID: $scope.whichPost });
        for (var i=0; i<$scope.posts.length; i++) {
            tempPost = $scope.posts[i];
            if (tempPost.ID === currentPost[0].ID){
                return $scope.posts.indexOf(tempPost);
            }
        }
        return -1;
    };
    
    $scope.refreshSlideInfo =  function ( index) {
        $scope.whichPost = $scope.posts[index].ID;
//        $scope.postContent = $sce.trustAsHtml(($filter('filter')($scope.posts, { ID: $scope.whichPost }))[0].content);

    };
    
    $scope.shareAnywhere = function (message, subject, image, link) {
        window.plugins.socialsharing.share('','', '', link);
    }
    
    $scope.browsePostText = config.BROWSE_POST;
    
    $scope.browsePost =function(url){
        window.open(url, '_system', 'location=yes'); return false;
    };
})

.controller('contactCtrl', function($cordovaEmailComposer, $scope, config) {

    
    
     $scope.submitMail = function() {
        if($cordovaEmailComposer) {
            $cordovaEmailComposer.showEmailComposerWithCallback(function(result) {
                console.log("Response -> " + result);
            }, 
            "Feedback for your App", // Subject
            "",                      // Body
            [config.CONTACT_MAIL],    // To
            null,                    // CC
            null,                    // BCC
            false,                   // isHTML
            null,                    // Attachments
            null);                   // Attachment Data
        }
    }
    
    
    //$cordovaEmailComposer.isAvailable().then(function() {
//   // is available
//   alert("available");
// }, function () {
//   // not available
//   alert("not available");
// });
// $scope.submitMail = function(){
//  var email = {
//     to: 'teste@example.com',
//     cc: 'teste@example.com',
//     bcc: ['john@doe.com', 'jane@doe.com'],
//     attachments: [
//       'file://img/logo.png',
//       'res://icon.png',
//       'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
//       'file://README.pdf'
//     ],
//     subject: 'Mail subject',
//     body: 'How are you? Nice greetings from Leipzig',
//     isHtml: true
//  };
//
// $cordovaEmailComposer.open(email).then(null, function () {
//   // user cancelled email
//  });
// }
})

.controller('contactCtrlll', function ($scope, config,$ionicPlatform, $cordovaEmailComposer) {

        $scope.pageTitle = config.SITE_NAME;

        $scope.submitMail = function (username, email, msg) {
            
            $ionicPlatform.ready(function() {
                
                cordova.plugins.email.isAvailable().then(function() {
                   // is available
                   alert("available");
                 }, function () {
                   // not available
                   alert("not available");
                 });
                 $scope.sendEmail = function(){
                  var email = {
                    to:          config.CONTACT_MAIL, // email addresses for TO field
                    cc:          Array, // email addresses for CC field
                    bcc:         Array, // email addresses for BCC field
                    attachments: Array, // file paths or base64 data streams
                    subject:    'رسالة من :' + username + '  ' + email, // subject of the email
                    body:       msg, // email body (for HTML, set isHtml to true)
                    isHtml:    true, // indicats if the body is HTML or plain text
                };

                 cordova.plugins.email.open(email).then(null, function () {
                   // user cancelled email
                  });
                 }
                
                
            });
            
            cordova.plugins.email.open({
                to:          config.CONTACT_MAIL, // email addresses for TO field
                cc:          Array, // email addresses for CC field
                bcc:         Array, // email addresses for BCC field
                attachments: Array, // file paths or base64 data streams
                subject:    'رسالة من :' + username + '  ' + email, // subject of the email
                body:       msg, // email body (for HTML, set isHtml to true)
                isHtml:    true, // indicats if the body is HTML or plain text
            }, function () {
                console.log('email view dismissed');
            },
            this);   
};
            
//            $ionicPlatform.ready(function() {
//                            cordova.plugins.email.open({
//    to:      'max@mustermann.de',
//    cc:      'erika@mustermann.de',
//    bcc:     ['john@doe.com', 'jane@doe.com'],
//    subject: 'Greetings',
//    body:    'How are you? Nice greetings from Leipzig'
//});
                
////            cordova.plugins.email.isAvailable().then(function () {
//
//                var message = {
//                    to: config.CONTACT_MAIL,
//                    subject: 'رسالة من :' + username + '  ' + email,
//                    body: msg,
//                    isHtml: true
//                };
//
//                cordova.plugins.email.open(message).then(null, function () {
//                    // user cancelled email
//                });
//
////            }, function () {
////                // not available
////            });
////            var message = {
////                to: config.CONTACT_MAIL,
////                subject: 'رسالة من :' + username + '  ' + email,
////                body: msg,
////                isHtml: true
////            };
////
////            cordova.plugins.email.open(message).then(null, function () {
////                // user cancelled email
////            });
//
//        });
        
    })
    .controller('tagsCtrl', function ($scope, config, apiService) {
        $scope.pageTitle = config.SITE_NAME;
    $scope.subTitle = config.MORE_TAGS;
        apiService.getTags($scope);
    })

    .controller('homeCtrl', function ($scope, config) {
        $scope.pageTitle = config.SITE_NAME;
    });
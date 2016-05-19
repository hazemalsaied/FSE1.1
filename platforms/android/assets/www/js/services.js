angular.module('fseServices', [])

.service('apiService', function ($http, $rootScope, $filter, $ionicPopup, $stateParams, config, $sce, $ionicLoading) {

    showAlert = function (closeAPP) {
        var alertPopup = $ionicPopup.alert({
            title: config.CONNECTION_ERROR,
            template: config.CONNECTION_ERROR_MSG
        });
        alertPopup.then(function (res) {
            if (closeAPP) {
                ionic.Platform.exitApp();
            }
        });
    };
    
     this.getMapPosts = function($scope, key, shouldBind){
        
        if (typeof $rootScope.postMap !== "undefined") {
            
            tempPosts = $rootScope.postMap[key];
            if(shouldBind){
                $scope.posts = tempPosts;
                $rootScope.posts = tempPosts;
                $scope.totalPageNum = $rootScope.postMap[key + "-totalPageNum"];
            }
        }
        
    }
    
    //Get Post list    
    this.getMorePosts = function ($scope, getCat, getTag) {
        
        httpQuery = this.generateQuery($scope, getCat, getTag);
        this.showLoading();

        return $http.get(httpQuery)
            .then(function (response) {
            
            if(getCat ){
                if (typeof $scope.catId !== "undefined"){
                    key = $scope.catId;
                }
                else key = $stateParams.catId;
            }else if(getTag){
                key = $stateParams.tagId;

            }   else{ 
                key = 0;
            }
            
            
            $rootScope.postMap[key] = $rootScope.postMap[key].concat(response.data.posts);
//            this.getMapPosts($scope, key, true);
            tempPosts = $rootScope.postMap[key];
            $scope.posts = tempPosts;
            $rootScope.posts = tempPosts;
            $scope.totalPageNum = $rootScope.postMap[key + "-totalPageNum"];
                
            $ionicLoading.hide();

            });

    };
    
//    this.setTotalPageNum = function(key , postNum){
//        $rootScope.postMap[key + "-totalPageNum"] = parseInt(postNum / 10) +1 ;
//    }
    
    this.getTagPosts = function($scope){
        
        
        if(typeof $rootScope.postMap[$stateParams.tagId] !== "undefined"){
            $scope.posts = $rootScope.postMap[$stateParams.tagId];
            $rootScope.posts = $rootScope.postMap[$stateParams.tagId];
            $scope.totalPageNum = $rootScope.postMap[$stateParams.tagId + "-totalPageNum"];
            
            return;
        }
        
        // Show loading spinner
        this.showLoading();
        
        // Fetching the tag posts
        httpQuery = config.API + 'posts/?' + config.POST_LIST_DATA + "&tag=" + $stateParams.tagId;
        return $http.get(httpQuery)
        .then(function (response) {
            
            $rootScope.postMap[$stateParams.tagId] = response.data.posts;
            
            $scope.posts = response.data.posts;
            $rootScope.posts = $scope.posts;
            $rootScope.postMap[$stateParams.tagId + "-totalPageNum"] = (response.data.found / 10) | 0;
            $scope.totalPageNum = (response.data.found / 10) | 0;
            $ionicLoading.hide();

        });
    }
    
   
    
    this.getCatsPosts = function ($scope, getCategories, getTags) {

        if (typeof $rootScope.postMap !== "undefined") {

            if (getCategories) {
                if(typeof $scope.catId !=="undefined") 
                    catKey = $scope.catId;
                else catKey = $stateParams.catId;
                this.getMapPosts($scope, catKey, true);
                $scope.pageTitle = this.getCatName(catKey);
                return;
            
            } else if (getTags) {
                this.getTagPosts($scope)
            
            } else {
                this.getMapPosts($scope, 0, true);
                return;
            }
        } else if (typeof $rootScope.cats !== "undefined") {

            if (typeof $rootScope.postMap === "undefined")
                $rootScope.postMap = {};
            else return;
            httpQuery = config.API + 'posts/?' + config.POST_LIST_DATA;
            // Show loading spinner
            this.showLoading();
            // Get the posts of the available categories
            for (var i = 0; i <= $rootScope.cats.length; i++) {

                if (i !== 0) {
                    httpQuery = httpQuery + "&category=" + $rootScope.cats[i - 1].slug;
                    
                    $http.get(httpQuery).then(function (response) {

                        if (response.data.posts.length > 0) {

                            for (var key in response.data.posts[0].categories) {

                                catIDD = response.data.posts[0].categories[key].ID;
                                $rootScope.postMap[catIDD] = response.data.posts;
                                
//                                this.setTotalPageNum(catIDD, response.data.found);
                                $rootScope.postMap[catIDD + "-totalPageNum"] = parseInt(response.data.found / 10) +1 ;
                                if ($stateParams.catId === catIDD) {

                                    $scope.posts = response.data.posts;
                                    $rootScope.posts = $scope.posts;
                                    $ionicLoading.hide();
                                }
                            }
                        }
                    });
                } else {
                    $http.get(httpQuery).then(function (response) {

                        if (response.data.posts.length > 0) {

                            // adding the main posts to the posts map with the key 0
                            $rootScope.postMap[0] = response.data.posts;
//                            this.setTotalPageNum("0", response.data.found);
                            $rootScope.postMap["0" + "-totalPageNum"] = parseInt(response.data.found / 10) +1 ;
                            if (typeof $stateParams.catId === "undefined" && typeof $stateParams.tagId === "undefined") {
                                $scope.posts = response.data.posts;
                                $rootScope.posts = $scope.posts;
//                                $scope.totalPageNum = (response.data.found / 10) | 0;
                                $ionicLoading.hide();
                            }
                        }
                    });
                }
            }

        }
    };
    
  
    
    //Get Categories list
    this.getCats = function ($scope) {

        if (typeof $rootScope.cats === "undefined") {

            return $http.get(
                config.API + "categories/"
            ).then(function successCallback(response) {
                $scope.cats = response.data.categories;
                $rootScope.cats = $scope.cats;

            }, function errorCallback(response) {
                showAlert(true);

            });
        }

    };
    // Get a list of all the Tags of the site
    this.getTags = function ($scope) {

        return $http.get(
            config.API + "tags/"
        ).then(function successCallback(response) {
            $scope.tags = response.data.tags;
        });

    };
    
    this.getCatSlug = function(ID){
        
        if(typeof $rootScope.cats !== "undefined"){
            for (var i = 0; i < $rootScope.cats.length; i++) {
                if($rootScope.cats[i].ID === parseInt(ID))
                    return $rootScope.cats[i].slug;
            }
        }
        return;
        
    };
    
    this.getCatName = function(ID){
        
        if(typeof $rootScope.cats !== "undefined"){
            for (var i = 0; i < $rootScope.cats.length; i++) {
                if($rootScope.cats[i].ID === parseInt(ID))
                    return $rootScope.cats[i].name;
            }
        }
        return;
        
    };
        
    this.generateQuery = function($scope, getCat, getTag){
        
        httpQuery = config.API + 'posts/?page=' + $scope.pageNum + '&' + config.POST_LIST_DATA;
        if (getCat) {
            if (typeof $scope.catId !== "undefined"){
                httpQuery = httpQuery + "&category=" + this.getCatSlug( $scope.catId);
            }
            else httpQuery = httpQuery + "&category=" + this.getCatSlug($stateParams.catId);
        } else if (getTag) {
            httpQuery = httpQuery + "&tag=" + $stateParams.tagId;
        }
        return httpQuery;

    };

    this.showLoading = function(){ 
        
        $ionicLoading.show({
            template: config.LOADING_TEXT,
            hideOnStateChange: true,
            delay: 1500,
            duration: 10000
        });
    };

});
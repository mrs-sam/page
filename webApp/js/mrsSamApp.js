(function() {
    'use strict';

    angular.module('mrsSamApp', [ 'ngResource' ]);

    angular.module('mrsSamApp').factory('siteService', [ '$resource', siteServiceFactory ]);

    function siteServiceFactory($resource) {
        return $resource('./site/:id', {}, {
            query: {
                method: 'GET',
                isArray: true,
                cache: false
            },
            get: {
                method: 'GET',
                isArray: true,
                cache: false
            }
        });
    }



    angular.module('mrsSamApp').controller('siteFormController', [ '$scope', '$http', siteFormControllerFactory ]);

    function siteFormControllerFactory($scope, $http) {
        $scope.options = {
            url: 'http://localhost:8080',
            numberOfSiteWorkers: 1
        };

        $scope.crawl = function(options) {
            $http.post('/site', options).then(function successCallback(response) {
                alert(response.data);
            }, function errorCallback(_response) {});
        };
    }


    angular.module('mrsSamApp').controller('sitesViewController', [ '$scope', '$http', 'siteService', sitesViewControllerFactory ]);

    function sitesViewControllerFactory($scope, $http, $siteService) {
        $scope.sites = $siteService.get();

        $scope.stopCrawling = function(aSite) {
            $http.post(`/site/${aSite._id}`).then(function successCallback(_response) {
                alert('site has been paused');
            }, function errorCallback(_response) {});
        };

        $scope.getNumberOfCrawls = function(aSite) {
            $siteService.get({ id: aSite._id }, result => {
                console.log(result);
                var nop = result[0].numberOfPages;
                alert(`Number of Crawled Pages : ${nop}`);
            });

        };
    }

})();

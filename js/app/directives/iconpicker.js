/**
 * Nextcloud - passman
 *
 * @copyright Copyright (c) 2016, Sander Brand (brantje@gmail.com)
 * @copyright Copyright (c) 2016, Marcos Zuriaga Miguel (wolfi@wolfi.es)
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

(function() {
  'use strict';

  /**
   * @ngdoc directive
   * @name passmanApp.directive:passwordGen
   * @description
   * # passwordGen
   */
  angular.module('passmanApp').directive('iconPicker', [
    '$window', 'IconService', '$http', function($window, IconService, $http) {
      return {
        templateUrl: 'views/partials/icon-picker.html',
        restrict: 'A',
        scope: {
          credential: '=iconPicker'
        },
        link: function(scope, element) {

          IconService.getIcons().then(function(icons) {
            scope.iconGroupsAll = icons;
            scope.iconGroups = icons;
          });

          scope.selectIcon = function(icon) {
            scope.selectedIcon = icon;
          };

          scope.jumpToGroup = function(groupName) {
              var offset = $('#'+groupName).position();
              $('.iconList').scrollTop(offset.top);
          };

          var search = document.getElementById("iconPicker-Search");
          search.addEventListener('keypress', function (e) {
              if(e.keyCode === 13){
                  e.preventDefault();
              }
          });

          search.addEventListener('keyup', function (e) {
              var g={};
              g.Numix=[];
              scope.iconGroupsAll.Numix.forEach(function(element) {
                  if(scope.isAllowedIcon(element))
                      g.Numix.push(element);
              });

              g["essential-collection"]=[];
              scope.iconGroupsAll["essential-collection"].forEach(function(element) {
                  if(scope.isAllowedIcon(element))
                      g["essential-collection"].push(element);
              });

              g["font-awesome"]=[];
              scope.iconGroupsAll["font-awesome"].forEach(function(element) {
              if(scope.isAllowedIcon(element))
                  g["font-awesome"].push(element);
              });

              scope.iconGroups=g;
              scope.$apply();
            });

            scope.isAllowedIcon = function(IconElement) {
                var searchval=search.value.toLowerCase();
                var urlCropped = IconElement.url.substring(IconElement.url.lastIndexOf("/")+1, IconElement.url.length);

                if(urlCropped.includes(searchval) || IconElement.pack.toLowerCase() ===searchval){
                    return true;
                }
                return false;
            };

            $('#iconPicker-CustomIcon').on('change', function(ev) {

                console.log("upload");
                scope.customIcon = {};

                var f = ev.target.files[0];
                var fr = new FileReader();

                fr.onload = function(ev2) {
                    scope.customIcon.data=ev2.target.result;
                    scope.$apply();
                };

                fr.readAsDataURL(f);
            });

            scope.useIcon = function() {

                if(scope.customIcon){
                    var data = scope.customIcon.data;
                    scope.credential.icon.type = data.substring(data.lastIndexOf(":")+1,data.lastIndexOf(";"));
                    scope.credential.icon.content = data.substring(data.lastIndexOf(",")+1, data.length);
                    $('#iconPicker').dialog('close');
                    return;
                }

            $http.get(scope.selectedIcon.url).then(function(result) {
              var base64Data = window.btoa(result.data);
              var mimeType = 'svg+xml';
              if(!scope.credential.icon){
                scope.credential.icon = {};
              }
              scope.credential.icon.type = mimeType;
              scope.credential.icon.content = base64Data;
              $('#iconPicker').dialog('close');
            });
          };

          $(element).click(function() {
            $('#iconPicker').dialog({
              width: 800,
              height: 380,
              close: function() {
                $(this).dialog('destroy');
              }
            });
          });
        }
      };
    }]);
}());

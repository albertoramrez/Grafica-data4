app.controller('mainCtrl', function AppCtrl ($scope) {
  $scope.selectedstate = selectoption;
  $scope.data = arrayedos;
  $scope.year = years;
  $scope.sort = sortData;
})

var selectoption = arrayedos.map(function(edos){return edos.name});
var yyear = arrayedos.map(function(yy){return yy.idhyear});

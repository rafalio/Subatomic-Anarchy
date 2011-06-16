exports.arrayFilter = function(filters, array) {
  var ret = {};
  filters.forEach(function(e){
    if(array[e] != undefined)
      ret[e] = array[e];
  });
  return ret;
}
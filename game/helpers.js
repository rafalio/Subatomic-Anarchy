// Writes a very simple response
simpleWrite =  function(res,data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(data);
}
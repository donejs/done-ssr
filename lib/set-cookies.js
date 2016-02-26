module.exports = function ( req, res ) {
  var cookies = req.canSsrCookies;
  var keys = Object.keys( cookies );
  var i, key, uh;

  for ( i = 0; i < keys.length; i++ ) {
    key = keys[ i ];
    uh = cookies[ key ];
    if ( !uh.isSSRReqCookie ) {
      //not a cookie that was on the initial request, basically any that are new from ssr, so forward them
      res.cookie( key, uh.value, uh.options );
    }
  }
};

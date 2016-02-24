module.exports = function ( doc, request ) {
  var cookieDef = (function () {
    var cookies = {};

    // Give parsed cookie info to the request object so the response can 'Set-Cookie' as needed
    // TODO set up the response object 'Set-Cookie' values. Ommit where cookies[key].isSSRReqCookie is true
    //    because they are already set on the requesting user's dom and we don't have meta info anyway
    request.cookies = cookies;

    return {
      get: function () {
        var cookieUserValue = "";
        var keys = Object.keys( cookies );
        var i, key, uh;
        for ( i = 0, uh = keys.length; i < uh; i++ ) {
          key = keys[ i ];

          //TODO if cookies[ key ].expired < today, do not return it here
          // but DO leave it in the cookies obj because it needs to be set
          // on the ssr response header 'Set-Cookie' to expire it for the end user

          if ( cookies[ key ].propString.indexOf( "HttpOnly" ) === -1 ) {
            cookieUserValue += "; " + cookies[ key ].keyValPair;
          }
        }
        return cookieUserValue.replace( /^; /, "" );
      },
      set: function ( newValue ) {
        var cookie = {};
        cookie.keyValPair = newValue.replace( /^([^;]*).*/, "$1" );
        cookie.propString = newValue.replace( cookie.keyValPair, "" ).replace( /^; ?/, "" );
        cookie.key = cookie.keyValPair.replace( /^([^=]*).*/, "$1" );
        cookie.value = cookie.keyValPair.replace( cookie.key, "" ).replace( /^=/, "" );
        cookie.isSSRReqCookie = false;
        //TODO: split out properties, especially expired one

        if ( cookie.propString.indexOf( "SSR-Mirror-In-DOM" ) !== -1 ) {
          cookie.propString = cookie.propString.replace( /(?:; )?SSR-Mirror-In-DOM/, "" );
          cookie.isSSRReqCookie = true;
        }
        cookies[ cookie.key ] = cookie;

        return newValue;
      }
    };
  })();
  Object.defineProperty( doc, "cookie", cookieDef );

  var cookie = request.headers && request.headers.cookie || "";
  var cookiesArr = cookie.length ? cookie.split( "; " ) : [];

  // Set on the cookies in the document
  // TODO: this is also passing on HttpOnly cookies so this is technically wrong..
  // but there is no way to tell which ones are HttpOnly from a request...
  // SO we need to have a config option that we access right here that'll let us flag them
  for ( var i = 0; i < cookiesArr.length; i++ ) {
    // TODO:
    // cookieName = cookiesArr[ i ].replace( /([^=]*)=.*/, "$1" );
    // if someConfig.HttpOnly.indexOf( cookieName ) !== -1
      //doc.cookie = cookiesArr[ i ] + "; HttpOnly; SSR-Mirror-In-DOM";
    // else
      doc.cookie = cookiesArr[ i ] + "; SSR-Mirror-In-DOM";
  }
};

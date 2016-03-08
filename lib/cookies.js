module.exports = function ( doc, request ) {
  var cookieDef = (function () {
    var cookies = {};

    // Give parsed cookie info to the request object so the ssr response can 'Set-Cookie' as needed
    request.doneSsrCookies = cookies;

    return {
      get: function () {
        var cookieUserValue = "";
        var keys = Object.keys( cookies );
        var i, key, uh;
        for ( i = 0, uh = keys.length; i < uh; i++ ) {
          key = keys[ i ];

          if ( cookies[ key ].options.expires && cookies[ key ].options.expires < new Date() ) {
            //expired, don't return it
            continue;
          }
          if ( cookies[ key ].options.httpOnly ) {
            //is httpOnly, don't return it
            continue;
          }

          cookieUserValue += "; " + cookies[ key ].keyValPair;
        }
        return cookieUserValue.replace( /^; /, "" );
      },
      set: function ( newValue ) {
        var cookie = {};
        cookie.raw = newValue;

        cookie.keyValPair = newValue.replace( /^([^;]*).*/, "$1" );
        cookie.propString = newValue.replace( cookie.keyValPair, "" ).replace( /^; ?/, "" );

        cookie.key = cookie.keyValPair.replace( /^([^=]*).*/, "$1" );
        cookie.value = cookie.keyValPair.replace( cookie.key, "" ).replace( /^=/, "" );
        cookie.options = {};

        cookie.isSSRReqCookie = false;
        if ( cookie.propString.indexOf( "SSR-Mirror-In-DOM" ) !== -1 ) {
          cookie.propString = cookie.propString.replace( /(?:; )?SSR-Mirror-In-DOM/, "" );
          cookie.isSSRReqCookie = true;
        }

        var props = cookie.propString.split( "; " );
        var i, prop, val;
        for ( i = 0; i < props.length; i++ ) {
          prop = props[ i ].split( "=" );
          val = prop[ 1 ] || "";
          prop = prop[ 0 ].toLowerCase();

          if ( prop === "domain" ) {
            cookie.options.domain = val;
          } else if ( prop === "expires" ) {
            // val = "Thu, 18 Dec 2013 12:00:00 UTC" or similar
            cookie.options.expires = new Date( val );
          } else if ( prop === "httponly" ) {
            cookie.options.httpOnly = true;
          } else if ( prop === "path" ) {
            cookie.options.path = val;
          }
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
    // cookieName = cookiesArr[ i ].replace( /([^=]*)=.*/, "$1" );
    // if someConfig.HttpOnly.indexOf( cookieName ) !== -1
      //doc.cookie = cookiesArr[ i ] + "; HttpOnly; SSR-Mirror-In-DOM";
    // else
      doc.cookie = cookiesArr[ i ] + "; SSR-Mirror-In-DOM";
  }
};

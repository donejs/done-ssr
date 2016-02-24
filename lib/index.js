/*global canWait:false */
var Steal = require("steal");
var loadExtension = require("./load_extension");
var trigger = require("./trigger");
var makeMap = require("./make_map");
var mergeResponseData = require("./merge_response_data");
var wait = require("can-wait");
var makeCreateState = require("./create_state");
var makeWaitOptions = require("./make_wait_options");
var addXHR = require( "./middleware/xhr" );

module.exports = function(cfg, options){
	options = getOptions(options);
	var steal = Steal.clone();
	var loader = global.System = steal.System;

	var nodeEnv = process.env.NODE_ENV || "development";
	loader.config({
		env: "server-" + nodeEnv
	});

	steal.config(cfg || {});

	// Ensure the extension is loaded before the main.
	loadExtension(loader, options);

	function getMainModule(main){
		// startup returns an Array in dev
		main = Array.isArray(main) ? main[0] : main;
		return main.importPromise || Promise.resolve(main);
	}

	var startup = steal.startup().then(function(main){
		// If live-reload is enabled we need to get a new main each
		// time a reload cycle is complete.
		if(loader.has("live-reload")) {
			var importOpts = {name: "@ssr"};
			loader.import("live-reload", importOpts).then(function(reload){
				reload(function(){
					startup = loader.import(loader.main).then(getMainModule);
				});
			});
		}
		return getMainModule(main);
	});

	return function(requestOrUrl){
		return startup.then(function(main){
			// Setup options
			var serializeFromBody = !!(main.renderAsync ||
									   main.serializeFromBody);
			var request = typeof requestOrUrl === "string" ? { url: requestOrUrl } : requestOrUrl;

			// Create the document
			var doc = new document.constructor();

			var cookieDef = (function () {
				var cookies = {};

				// Give parsed cookie info to the request object so the response can 'Set-Cookie' as needed
				// TODO set up the response object 'Set-Cookie' values. Ommit where cookies[key].isSSRReqCookie is true
				//		because they are already set on the requesting user's dom and we don't have meta info anyway
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
								cookieUserValue += "; " + cookies[ key ].keyValPair
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
			console.log( "setting doc.__id" );
			doc.__id = "hihi";

			addXHR( global, doc, request );

			// doc.__addSerializerAndParser is not available in CanJS older than 2.3.11
			if (typeof doc.__addSerializerAndParser === "function") {
				doc.__addSerializerAndParser(document.__serializer,
											document.__parser);
			}

			if(!serializeFromBody) {
				doc.head = doc.createElement("head");
				doc.documentElement.insertBefore(doc.head, doc.body);
			}

			// New API is createState, if not fall back to the old API
			var createState = main.createState || makeCreateState(main);

			// Support both the legacy autorender API and the new API
			// specified by https://github.com/canjs/can-ssr/issues/80
			var useLegacyAPI = main.legacy !== false &&
				main.renderAsync;
			var render = !useLegacyAPI ? main.render.bind(main) :
				function(){
				var render = main.render;
				return main.renderAsync(render, state, {}, doc)
					.then(function(result){
						(result.canWaitData || []).forEach(function(data){
							canWait.data(data);
						});
					}, function(err){
						throw err;
					});
			};

			var state, stateMap;
			var run = function(){
				state = createState(request);
				stateMap = makeMap(state);

				Promise.resolve(render(doc, state)).then(null, function(errors){
					(errors || []).forEach(function(error){
						canWait.error(error);
					});
				});
			};

			return wait(run, makeWaitOptions(doc))
				.then(function(resp){
					mergeResponseData(stateMap, resp);
				})
				.then(function(){
					stateMap.attr("__renderingComplete", true);
				})
				.then(function() {
					var html;
					if(serializeFromBody) {
						html = doc.body.innerHTML;
					} else {
						html = doc.documentElement.outerHTML;
					}

					// Cleanup the dom
					trigger(doc, "removed");

					return {
						state: state,
						html: html
					};
				});
		});
	};
};

function getOptions(opts){
	opts = opts || {};

	if(opts.plugins !== false && !opts.plugins) {
		opts.plugins = [
			"canjs"
		];
	}
	if(!opts.plugins) {
		opts.plugins = [];
	}

	return opts;
}

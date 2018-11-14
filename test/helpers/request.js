var http = require("http");
var URL = require("url").URL;
var ua = require("./ua").ua;

exports.makeRequest = async function(url, encoding = "utf8") {
	let urlObj = new URL(url);
	return makeH1Request(urlObj, encoding);
};

function makeH1Request(urlObj, encoding) {
	let response = {body: []};
	return new Promise((resolve, reject) => {
		let options = {
			hostname: urlObj.hostname,
			port: Number(urlObj.port),
			path: urlObj.pathname + urlObj.search,
			method: 'GET',
			headers: {
				"user-agent": ua.chrome
			}
		};

		if(urlObj.protocol === "https:") {
			options.rejectUnauthorized = false;
		}

		http.get(options, res => {
			response.statusCode = res.statusCode;
			response.headers = res.headers;

			if(response.statusCode === 301) {
				let urlObj = new URL(response.headers.location);
				resolve(makeH1Request(urlObj, encoding));
				return;
			}

			if(encoding) {
				res.setEncoding(encoding); // Usually utf8
			}

			res.on("data", chunk => {
				if(!encoding) {
					for (let byte of chunk) {
						response.body.push(byte);
					}
				}

				response.body.push(chunk);
			});
			res.on("end", () => {
				if(encoding) {
					response.body = response.body.join("");
				} else {
					response.body = Uint8Array.from(response.body);
				}

				resolve(response);
			});
		})
		.on("error", error => {
			reject(error);
		});
	});
}

"format cjs";

// Imports
var getIntermediateAndImports = require("can/view/stache/intermediate_and_imports");

// Exports
exports.translate = translate;

function translate(load){
	var intermediateAndImports = getIntermediateAndImports(load.source);

	var ases = intermediateAndImports.ases;
	var imports = intermediateAndImports.imports;
	var args = [];
	can.each(ases, function(from, name){
		// Move the as to the front of the array.
		imports.splice(imports.indexOf(from), 1);
		imports.unshift(from);
		args.unshift(name);
	});
	imports.unshift("can/view/stache/stache");
	args.unshift("stache");

	var definition = "define("+JSON.stringify(intermediateAndImports.imports)+",function(" +
    args.join(", ") + "){\n" +
    "var renderer = stache(" + JSON.stringify(intermediateAndImports.intermediate) + ");\n";

	can.each(ases, function(from, name){
		definition += "renderer['" + name + "'] = " +
			name +"['default'] || " + name +
			";";
	});

	definition += "\nreturn renderer;});";

	return definition;
}


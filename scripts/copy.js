var copy = require("copy-dir").sync;

copy("node_modules", "test/tests/node_modules", function(state, filePath, fileName) {
    return fileName !== '_mocha' && filePath.indexOf(".git/") < 0;
});

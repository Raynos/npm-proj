var fs = require("fs")
var path = require("path")
var parallel = require("continuable-para")
var put = require("dotty").put

var allFiles = require("../lib/all-files")

var templateDir = path.join(__dirname, "..", "default-template")

allFiles(templateDir, function (err, files) {
    if (err) {
        throw err
    }

    parallel(files.map(function (file) {
        return function (callback) {
            fs.readFile(file, function (err, source) {
                if (err) {
                    return callback(err)
                }

                callback(null, {
                    file: file,
                    relative: path.relative(templateDir, file),
                    source: String(source)
                })
            })
        }
    }), function (err, tuples) {
        if (err) {
            throw err
        }

        var hash = tuples.reduce(function (acc, tuple) {
            var key = tuple.relative
            if (key === "._gitignore") {
                key = ".gitignore"
            }

            var parts = key.split(path.sep)

            put(acc, parts, tuple.source.split("\n"))
            return acc
        }, {})

        process.stdout.write("module.exports = " +
            JSON.stringify(hash, null, "    ") + "\n")
    })
})

var fs = require("fs")
var path = require("path")

module.exports = allFiles

function allFiles(uri, callback) {
    fs.stat(uri, function (err, stat) {
        if (err) {
            return callback(err)
        }

        if (stat.isFile()) {
            return callback(null, [uri])
        }

        fs.readdir(uri, onfiles)
    })

    function onfiles(err, files) {
        if (err) {
            return callback(err)
        }

        var count = files.length
        var result = []
        var finished = false
        files.forEach(function (fileName) {
            var fullUri = path.join(uri, fileName)

            allFiles(fullUri, function (err, files) {
                if (err && !finished) {
                    finished = true
                    return callback(err)
                } else if (!err) {
                    result = result.concat(files)

                    if (--count === 0) {
                        callback(null, result)
                    }
                }
            })
        })
    }
}

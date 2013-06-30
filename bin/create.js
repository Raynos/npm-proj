var argv = require("optimist").argv
var path = require("path")
var process = require("process")

var NpmProject = require("../index.js")

if (argv.location[0] === ".") {
    argv.location = path.join(process.cwd(), argv.location)
}

NpmProject({
    location: argv.location,
    locals: argv
}, function (err) {
    if (err) {
        throw new Error(err)
    }
})

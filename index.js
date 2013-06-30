var fs = require("fs")
var path = require("path")
var process = require("process")
var mkdirp = require("mkdirp")
var cpr = require("cpr").cpr
var after = require("after")

var allFiles = require("./lib/all-files")

var HOME = process.env.HOME || process.env.USERPROFILE
var templateDir = path.join(HOME, ".npm-proj")
var defaultTemplate = path.join(__dirname, "default-template")
var isVariableRegex = /\{\{([^}]+)\}\}/g

module.exports = NpmProject

function NpmProject(opts, callback) {
    var location = opts.location
    var locals = opts.locals

    mkdirp(templateDir, function ontemplatedir(err) {
        if (err && err.code === "EEXIST") {
            return scaffold()
        } else if (err) {
            return callback(err)
        }

        cpr(defaultTemplate, templateDir, function ontemplatecopied(errs) {
            if (errs) {
                return callback(errs[0])
            }

            scaffold()
        })
    })

    // copy folder to location
    function scaffold() {
        allFiles(templateDir, function (err, files) {
            if (err) {
                return callback(err)
            }

            fetchSources(files, handleSources)
        })
    }

    function handleSources(err, sources) {
        if (err) {
            return callback(err)
        }

        sources.forEach(function (source) {
            source.content = source.code.replace(isVariableRegex,
                function (_, key) {
                    return locals[key]
                })
        })

        mkdirp(location, function (err) {
            if (err) {
                return callback(err)
            }

            writeSources(location, sources, callback)
        })
    }
}

function fetchSources(files, callback) {
    var next = after(files.length, callback)
    var result = []

    files.forEach(function (file) {
        var relative = path.relative(templateDir, file)

        fs.readFile(file, function (err, source) {
            if (err) {
                return next(err)
            }

            result.push({
                relative: relative,
                file: file,
                code: String(source)
            })
            next(null, result)
        })
    })
}

function writeSources(location, sources, callback) {
    var next = after(sources.length, callback)
    var dirs = []

    sources.forEach(function (source) {
        var relative = source.relative
        var content = source.content
        var dirname = path.dirname(relative)
        var loc = path.join(location, relative)

        if (dirname !== "." && dirs.indexOf(dirname) === -1) {
            dirs.push(dirname)
            var dirLoc = path.join(location, dirname)\

            mkdirp(dirLoc, write)
        } else {
            write()
        }

        function write(err) {
            if (err) {
                return next(err)
            }

            fs.writeFile(loc, content, next)
        }
    })
}

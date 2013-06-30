var test = require("tape")

var npmProj = require("../index")

test("npmProj is a function", function (assert) {
    assert.equal(typeof npmProj, "function")
    assert.end()
})

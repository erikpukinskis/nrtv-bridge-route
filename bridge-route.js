
var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-bridge-route",
  ["nrtv-server", "nrtv-browser-bridge", "nrtv-make-request"],
  function(server, bridge, makeRequest) {

    function BridgeRoute(verb, pattern, handler) {

      verb = verb.toLowerCase()

      var verbIsOk = verb == "get" || verb == "post"

      if (!verbIsOk) {
        throw new Error("the verb you pass ServerBridge.route should be either get or post")
      }

      server.addRoute(verb, pattern, handler)

      this.verb = verb
      this.pattern = pattern
    }

    BridgeRoute.prototype.defineInBrowser =
      function() {
        var binding = bridge.defineFunction([makeRequest.defineInBrowser()], hitRoute)

        return binding.withArgs(
          this.verb,
          this.pattern
        )
      }

    function hitRoute(makeRequest, verb, pattern, data, callback) {
      makeRequest(
        pattern,
        {
          data: data,
          method: verb
        },
        callback
      )
    }

    return BridgeRoute
  }
)

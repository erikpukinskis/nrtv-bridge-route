
var library = require("nrtv-library")(require)


module.exports = library.export(
  "nrtv-bridge-route",
  ["nrtv-server", "nrtv-browser-bridge"],
  function(Server, BrowserBridge) {

    function BridgeRoute(verb, pattern, func) {

      if (verb != "get" && verb != "post") {
        throw new Error("the verb you pass ServerBridge.route should be either get or post")
      }

      Server.collective()[verb](pattern, func)

      this.bridge = BrowserBridge.collective()

      this.verb = verb
      this.pattern = pattern
    }

    BridgeRoute.prototype.makeRequest =
      function() {
        var ajax = this.bridge.defineOnClient(hitRoute)

        var res = ajax(
          this.verb,
          this.pattern
        )

        return res.evalable()
      }

    function hitRoute(verb, path) {
      $.ajax({
        method: verb,
        url: path,
        dataType: "json",
        success: this.handle,
        error: function(a,b,c) {
          document.write(JSON.stringify([a,b,c],null,0))
        }
      })
    }

    return BridgeRoute
  }
)

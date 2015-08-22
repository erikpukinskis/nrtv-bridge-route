
var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-bridge-route",
  ["nrtv-server", "nrtv-browser-bridge"],
  function(Server, BrowserBridge) {

    function BridgeRoute(verb, pattern, handler) {

      if (verb != "get" && verb != "post") {
        throw new Error("the verb you pass ServerBridge.route should be either get or post")
      }

      if (handler.__handler == "sendPage") {

        handler = BrowserBridge.sendPage.apply(BrowserBridge, handler.sendPageArguments)
      }

      // We really only want to do this if Server doesn't already know about us: #todo

      Server.collective()[verb](
        pattern,
        handler
      )

      this.verb = verb
      this.pattern = pattern
    }



    BridgeRoute.sendPage =
      function() {
        var args = Array.prototype.slice.call(arguments)

        return {
          __handler: "sendPage",
          sendPageArguments: args
        }
      }

    BridgeRoute.prototype.bindOnClient =
      function() {
        if (!this.request) {
          var ajax = BrowserBridge.defineOnClient(hitRoute)
          this.request = ajax.withArgs(
            this.verb,
            this.pattern
          )
        }

        return this.request
      }

    function hitRoute(verb, path, data) {
      $.ajax({
        method: verb,
        url: path,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: this.handle,
        error: function(a,b,c) {
          document.write(JSON.stringify([a,b,c],null,0))
        }
      })
    }

    return BridgeRoute
  }
)

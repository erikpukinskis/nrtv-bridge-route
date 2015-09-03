
var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-bridge-route",
  ["nrtv-server", "nrtv-browser-bridge", "nrtv-ajax"],
  function(Server, BrowserBridge, ajax) {

    function BridgeRoute(verb, pattern, handler) {

      if (verb != "get" && verb != "post") {
        throw new Error("the verb you pass ServerBridge.route should be either get or post")
      }

      if (handler.__handler == "sendPage") {

        handler = BrowserBridge.sendPage.apply(BrowserBridge, handler.sendPageArguments)
      }

      // We really only want to do this if Server doesn't already know about us: #todo

      Server[verb](
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

    BridgeRoute.prototype.defineOnClient =
      function() {
        if (!this.request) {

          this.request = BrowserBridge
            .defineOnClient(hitRoute)
            .withArgs(
              BrowserBridge.defineOnClient(ajax),
              this.verb,
              this.pattern
            )
        }

        return this.request
      }

    function hitRoute(ajax, verb, path, one, two) {

      if (typeof one == "object") {
        var data = one
        var callback = two
      } else {
        var callback = one
      }

      var isPost = verb.toUpperCase() == "POST"
      var providedObject = typeof data == "object"

      if (isPost && !providedObject) {
        throw new Error("Can't post to " + path + " because you didn't provide any data to send! You gave us " + data + " but we expected an object there.")
      }
      ajax(path, finish, data)

      function finish(data) {
        bridge.handle(data)
        callback && callback(data)
      }
    }

    return BridgeRoute
  }
)

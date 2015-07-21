
var library = require("nrtv-library")(require)


module.exports = library.export(
  "server-component",
  [
    library.collective({}),
    "nrtv-server"
  ],
  function(collective, Server) {

    function ServerBridge() {
      if (!collective.instance) {
        collective.instance = new Server()
      }
      this.instance = collective.instance
    }

    ServerBridge.prototype.start =
      function(port) {
        this.instance.start(port) 
        this.url = "http://localhost:"+port
      }

    ServerBridge.prototype.stop =
      function() {
        this.instance.stop()
      }

    ServerBridge.prototype.route = 
      function(verb, pattern, func) {
        if (verb != "get" && verb != "post") {
          throw new Error("the verb you pass ServerBridge.route should be either get or post")
        }
        this.instance[verb](pattern, func)

        return {

          // Takes a bridge and returns an onclick that would call the route

          makeRequest: 
            function(bridge) {
              var ajax = bridge
              .defineOnClient(hitRoute)

              return ajax(
                verb,
                pattern
              ).evalable()
            }
        }
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

    return ServerBridge
  }
)
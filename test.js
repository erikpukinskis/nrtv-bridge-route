var library = require("nrtv-library")(require)

library.define(
  "text-server",
  ["./server_bridge"],
  function(ServerBridge) {

    function TextServer(text) {
      this.server = new ServerBridge()

      this.server.route(
        "get",
        "/",
        function(request, response) {
          response.send(text)
        }
      )
    }

    TextServer.prototype.start =
      function(callback) {
        this.server.start(5511, callback)
      }

    TextServer.prototype.stop =
      function(callback) {
        this.server.stop(callback)
      }

    return TextServer
  }
)


library.test(
  "text server serves text",
  ["text-server", "supertest"],
  function(expect, done, TextServer, request) {

    var instance = new TextServer("Hello worldkins!")

    instance.start()

    request(
      "http://localhost:5511"
    )
    .get("/")
    .end(function(x, response) {
      console.log(response.text)
      expect(response.text).to.match(
        /worldkins/
      )
      instance.stop()
      done()
    })

  }
)

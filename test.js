var library = require("nrtv-library")(require)

library.test(
  "text server serves text",
  ["./bridge-route", "nrtv-server", "supertest"],
  function(expect, done, BridgeRoute, Server, request) {

    var route = new BridgeRoute(
      "get",
      "/",
      function(request, response) {
        response.send("Hello worldkins!")
      }
    )

    Server.collective().start(5511)

    expect(route.makeRequest()).to.contain("[\"get\",\"/\"]")

    request(
      "http://localhost:5511"
    )
    .get("/")
    .end(function(x, response) {

      console.log(response.text)

      expect(response.text).to.match(/worldkins/)

      Server.collective().stop()

      done()
    })

  }
)
var library = require("nrtv-library")(require)

library.test(
  "text server serves text",
  ["./bridge-route", "nrtv-server", "supertest"],
  function(expect, done, BridgeRoute, Server, request) {

    var route = new BridgeRoute(
      "get",
      "/",
      BridgeRoute.sendPage("Hello worldkins!")
    )

    Server.collective().start(5511)

    expect(route.makeRequestJs()).to.contain("[\"get\",\"/\"]")

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

var library = require("nrtv-library")(require)

library.test(
  "make a route that returns text and looks like it can be evaluated",
  ["./bridge-route", library.reset("nrtv-server"), "supertest", library.reset("nrtv-browser-bridge")],
  function(expect, done, BridgeRoute, Server, request, x) {

    done.failAfter(3000)

    var route = new BridgeRoute(
      "get",
      "/",
      BridgeRoute.sendPage("Hello worldkins!")
    )

    Server.collective().start(5511)

    expect(route.bindOnClient().evalable()).to.contain("\"get\",\"/\"")

    request(
      "http://localhost:5511"
    )
    .get("/")
    .end(function(x, response) {
      expect(response.text).to.match(/worldkins/)

      Server.collective().stop()

      done()
    })

  }
)

library.test(
  "a button calls a route we set up before and pass along arguments to",
  ["./bridge-route", library.reset("nrtv-browser-bridge"), "nrtv-element", library.reset("nrtv-server"), "nrtv-browse"],
  function(expect, done, BridgeRoute, BrowserBridge, element, Server, browse) {

    var saveRoute = new BridgeRoute(
      "post", 
      "/",
      function(request, response) {
        expect(request.body.name).to.equal("fart")
        expect(request.body.body).to.equal("foo")
        finishTest()
        response.send("ok")
      }
    )

    var bridge = BrowserBridge.collective()

    var save = bridge.defineOnClient(
      [
        saveRoute.bindOnClient()
      ],
      function (makeRequestToSaveRoute, name) {
        makeRequestToSaveRoute({name: name, body: "foo"})
      }
    )

    var button = element(
      "button.fart",
      "Fart!",
      {onclick: save.withArgs("fart").evalable()}
    )

    new BridgeRoute(
      "get",
      "/",
      bridge.sendPage(button)
    )

    var server = Server.collective()

    server.start(5533)

    var browser = browse(5533)

    browser.visit("/", function() {
      browser.pressButton(".fart")
    })

    function finishTest() {
      server.stop()
      done()
    }
  }
)
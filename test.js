var test = require("nrtv-test")(require)
var library = test.library

test.using(
  "sending data to a route and receiving some back",

  ["./bridge-route", "web-element", "browser-bridge", library.reset("nrtv-server"), "nrtv-browse"],
  function(expect, done, BridgeRoute, element, bridge, server, browse) {

    var route = new BridgeRoute(
      "post",
      "/what",
      function(request, response) {
        expect(request.body.some).to.equal("data")
        response.json({bird: "word"})
      }
    )

    var doIt = route
      .defineOn(bridge)
      .withArgs(
        {some: "data"},
        function(stuff) {
          document.write(stuff.bird)
        }
      )

    bridge.asap(doIt)

    new BridgeRoute(
      "get",
      "/",
      bridge.sendPage()
    )

    server.start(4444)

    browse("http://localhost:4444",
      function(browser) {
        browser.assertText("body", "word", browser.done, server.stop, done)
      }
    )

  }
)

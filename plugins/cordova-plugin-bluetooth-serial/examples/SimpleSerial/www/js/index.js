/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/


var app = {
    macAddress: "20:16:06:20:62:52",  // get your mac address from bluetoothSerial.list
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);

            var n = 40,
                random = data;

            function chart(domain, interpolation, tick) {
              var data = d3.range(n).map(random);

              var margin = {top: 6, right: 0, bottom: 6, left: 40},
                  width = 960 - margin.right,
                  height = 120 - margin.top - margin.bottom;

              var x = d3.scale.linear()
                  .domain(domain)
                  .range([0, width]);

              var y = d3.scale.linear()
                  .domain([-1, 1])
                  .range([height, 0]);

              var line = d3.svg.line()
                  .interpolate(interpolation)
                  .x(function(d, i) { return x(i); })
                  .y(function(d, i) { return y(d); });

              var svg = d3.select("body").append("p").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .style("margin-left", -margin.left + "px")
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              svg.append("defs").append("clipPath")
                  .attr("id", "clip")
                .append("rect")
                  .attr("width", width)
                  .attr("height", height);

              svg.append("g")
                  .attr("class", "y axis")
                  .call(d3.svg.axis().scale(y).ticks(5).orient("left"));

              var path = svg.append("g")
                  .attr("clip-path", "url(#clip)")
                .append("path")
                  .datum(data)
                  .attr("class", "line")
                  .attr("d", line);

              tick(path, line, data, x);
            }

            var transition = d3.select({}).transition()
                .duration(750)
                .ease("linear");

            chart([1, n - 2], "basis", function tick(path, line, data, x) {
              transition = transition.each(function() {

                // push a new data point onto the back
                data.push(random());

                // redraw the line, and then slide it to the left, and repeat indefinitely
                path
                    .attr("d", line)
                    .attr("transform", null)
                  .transition()
                    .attr("transform", "translate(" + x(0) + ")");

                // pop the old data point off the front
                data.shift();

              }).transition().each("start", function() { tick(path, line, data, x); });
            });
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app


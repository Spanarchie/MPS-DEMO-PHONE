// Variables you can change
//
var MY_WEBSOCKET_URL = "ws://tutorial.kaazing.com/jms";
var TOPIC_NAME = "/topic/myTopic";
var IN_DEBUG_MODE = true;
var DEBUG_TO_SCREEN = true;

/*** Task 9 ***/
// Message Properties and Message Types
var MESSAGE_PROPERTIES = {
    "messageType": "MESSAGE_TYPE",
    "userId": "USERID",
    "sliderPos": "SLIDER_POS"
};

var MESSAGE_TYPES = {
    "sliderMoved": "SLIDER_MOVED"
};
/*** Task 9 ***/

/*** Task 10 ***/
var userId = Math.random(100000).toString();
/*** Task 10 ***/

// WebSocket and JMS variables
//
var connection;
var session;
var wsUrl;

// *** Task 16 ***
// Internal variables
//
var sending = false;
var sliderQueue = [];
// *** Task 16 ***

// JSFiddle-specific variables
//
var runningOnJSFiddle = (window.location.hostname === "fiddle.jshell.net");
var WEBSOCKET_URL = (runningOnJSFiddle ? MY_WEBSOCKET_URL : "ws://" + window.location.hostname + ":" + window.location.port + "/jms");

// Variable for log messages
//
var screenMsg = "";

// Used for development and debugging. All logging can be turned
// off by modifying this function.
//
var consoleLog = function(text) {
    if (IN_DEBUG_MODE) {
        if (runningOnJSFiddle || DEBUG_TO_SCREEN) {
            // Logging to the screen
            screenMsg = screenMsg + text + "<br>";
            $("#logMsgs").html(screenMsg);
        } else {
            // Logging to the browser console
            console.log(text);
        }
    }
};

var handleException = function (e) {
    consoleLog("EXCEPTION: " + e);
};

// *** Task 6a ***
var handleTopicMessage = function(message) {
    // *** Task 12 ***
    if (message.getStringProperty(MESSAGE_PROPERTIES.userId) != userId) {
        consoleLog("Message received: " + message.getText());
        // *** Task 8b ***
        $("#slider").val(message.getText());
        // *** Task 8b ***
        // *** Task 15 ***
        $("#pic").width(message.getText());
        // *** Task 15 ***        
    }
    // *** Task 12 ***
};
// *** Task 6a ***

// *** Task 7a ***
// Send a message to the topic.
//
var doSend = function(message) {
    /*** Task 11 ***/
    message.setStringProperty(MESSAGE_PROPERTIES.userId, userId);
    /*** Task 11 ***/    
    topicProducer.send(null, message, DeliveryMode.NON_PERSISTENT, 3, 1, function() {
        // *** Task 18 ***
        sendFromQueue();
        // *** Task 18 ***
    });
    consoleLog("Message sent: " + message.getText());
};
// *** Task 7a *** 

// *** Task 2 ***
var sliderChange = function(sliderValue) {
    consoleLog("Slider changed: " + sliderValue);
    // *** Task 14 ***
    $("#pic").width(sliderValue);
    // *** Task 14 ***
    
    // *** Task 19 ***
    if (!sending) {
        sending = true;
        // *** Task 8a ***
        doSend(session.createTextMessage(sliderValue));
        // *** Task 8a ***        
    }
    else {
        sliderQueue.push(sliderValue);
        consoleLog("Busy sending, pushing to slider queue: " + sliderValue);
    }
    // *** Task 19 ***
};
// *** Task 2 ***
// *** Task 17 ***
var sendFromQueue = function() {
    if (sliderQueue.length > 0) {
        consoleLog("Sending last element from queue: " + sliderQueue[sliderQueue.length-1]);
        var msg = sliderQueue[sliderQueue.length-1];
        sliderQueue = [];
        doSend(session.createTextMessage(msg));
    }
    else {
        sending = false;
    }
};
// *** Task 17 ***

// Connecting...
//
var doConnect = function() {
    // Connect to JMS, create a session and start it.
    //
    var stompConnectionFactory = new StompConnectionFactory(WEBSOCKET_URL);
    try {
        var connectionFuture = stompConnectionFactory.createConnection(function() {
            if (!connectionFuture.exception) {
                try {
                    connection = connectionFuture.getValue();
                    connection.setExceptionListener(handleException);

                    consoleLog("Connected to " + WEBSOCKET_URL);
                    session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
                    
                    // *** Task 3 ***
                    // Creating topic
                    var myTopic = session.createTopic(TOPIC_NAME);
                    consoleLog("Topic created...");
                    // *** Task 3 ***
                    
                    // *** Task 4 ***
                    // Creating topic Producer
                    topicProducer = session.createProducer(myTopic);
                    consoleLog("Topic producer created...");
                    // *** Task 4 ***                    

                    // *** Task 5 ***
                    // Creating topic Consumer
                    topicConsumer = session.createConsumer(myTopic);
                    consoleLog("Topic consumer created...");
                    // *** Task 5 ***

                    // *** Task 6b ***
                    topicConsumer.setMessageListener(handleTopicMessage);
                    // *** Task 6b ***                        
                    
                    connection.start(function() {
                        // Put any callback logic here.
                        //
                        consoleLog("JMS session created");
                        
                        // *** Task 7b ***
                        doSend(session.createTextMessage("Hello world..."));
                        // *** Task 7b ***                          
                    });
                } catch (e) {
                    handleException(e);
                }
            } else {
                handleException(connectionFuture.exception);
            }
        });
    } catch (e) {
        handleException(e);
    }
};

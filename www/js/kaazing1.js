function handleConnect() {
    log("CONNECT: " + url.value + " " + username.value);

    var jmsConnectionFactory = new JmsConnectionFactory(url.value);
    
    //setup challenge handler
    setupSSO(jmsConnectionFactory.getWebSocketFactory());
    try {
        var connectionFuture =
            jmsConnectionFactory.createConnection(username.value, password.value, function () {
            if (!connectionFuture.exception) {
                try {
                    connection = connectionFuture.getValue();
                    connection.setExceptionListener(handleException);

                    log("CONNECTED");

                    session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
                    transactedSession = connection.createSession(true, Session.AUTO_ACKNOWLEDGE);

                        connection.start(function () {
                            updateConnectionButtons(true);
                        });
                }
                catch (e) {
                    handleException(e);
                }
            }
            else {
                handleException(connectionFuture.exception);
            }
        });
    }
    catch (e) {
        handleException(e);
    }
}


function handleSubscribe() {
    var name = destination.value;

    var destinationId = destinationCounter++;

    log("SUBSCRIBE: " + name + " <span class=\"subscriptionTag\">[#"+destinationId+"]</span>");

    var dest = createDestination(name, session);

    var consumer;

    if (messageSelector.value.length > 0) {
        consumer = session.createConsumer(dest, messageSelector.value);
    } else {
        consumer = session.createConsumer(dest);
    }

    consumer.setMessageListener(function(message) {
        handleMessage(name, destinationId, message);
    });

    // Add a row to the subscriptions table.
    //

    var tBody = subscriptionsTable.tBodies[0];

    var rowCount = tBody.rows.length;
    var row = tBody.insertRow(rowCount);

    var destinationCell = row.insertCell(0);
    destinationCell.className = "destination";
    destinationCell.appendChild(document.createTextNode(name+" "));
    var destNode = document.createElement("span");
    destNode.className = "subscriptionTag";
    destNode.innerHTML = "[#"+destinationId+"]";
    destinationCell.appendChild(destNode);

    var messageSelectorCell = row.insertCell(1);
    messageSelectorCell.className = "selector";
    messageSelectorCell.appendChild(document.createTextNode(messageSelector.value));

    var unsubscribeCell = row.insertCell(2);
    var unsubscribeButton = document.createElement("button");
    unsubscribeButton.className = "unsubscribeButton";
    unsubscribeButton.innerHTML = "Unsubscribe";
    unsubscribeButton.addEventListener('click', function(event) {
        var targ;
        if (event.target) {
            targ = event.target;
        } else {
            targ=event.srcElement; // The wonders of IE
        }
        log("UNSUBSCRIBE: " + name + " <span class=\"subscriptionTag\">[#"+destinationId+"]</span>");
        if (consumer) {
              consumer.close(null);
        }
        var rowIndex = targ.parentElement.parentElement.rowIndex
        subscriptionsTable.deleteRow(rowIndex);
    }, false);
    unsubscribeCell.appendChild(unsubscribeButton);
}




function handleSend() {
    var name = destination.value;
    var dest = createDestination(name, session);
    var producer = session.createProducer(dest);

    if (!binary.checked) {
        var textMsg = session.createTextMessage(message.value);

        addProperties(textMsg);

        try {
          var future = producer.send(textMsg, function(){
            if (future.exception) {
              handleException(future.exception);
            }
          });
        } catch (e) {
          handleException(e);
        }

        logMessageSend("sendMessage", "SEND TextMessage: ", destination.value, message.value, textMsg);
    }
    else {
        var bytesMsg = session.createBytesMessage();
        bytesMsg.writeUTF(message.value);

        addProperties(bytesMsg);

        try {
          var future = producer.send(bytesMsg, function(){
            if (future.exception) {
              handleException(future.exception);
            }
          });
        } catch (e) {
          handleException(e);
        }

        logMessageSend("sendMessage", "SEND BytesMessage: ", destination.value, message.value, bytesMsg);
    }

    producer.close();
}
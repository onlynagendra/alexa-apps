'use strict';
var http = require('http');
var https = require('https');
exports.handler = function(event,context) {
	var request = event.request;
	var session = event.session;

	if (!event.session.attributes){
		event.session.attributes = {};
	}

	if ( request.type === "LaunchRequest") {
		handleLaunchRequest(context);
    } else {
        let option1 = {};
        if ( request.intent.name === "CoinValue") {
            handleCoinValueIntentRequest(request,context,session);
        }
    } 

     


}



function buildResponse(options) {
 
	 var response = {
		 version: "1.0",
	     response: {
	     outputSpeech: {
	      //type: "PlainText",
	      //text: options.speechText
	      type: "SSML",
	      ssml:"<speak>"+options.speechText+"</speak>"
	     },
	     shouldEndSession: options.endSession
	  }
	};

    if (options.cardTitle){
        response.response.card = {
            type: "simple",
            title: options.cardTitle
        }

        if (options.imageUrl){
            response.response.card.type = "Standard"
            response.response.card.text = options.cardContent;
            response.response.card.image = {
                smallImageUrl: options.imageUrl,
                largeImageUrl: options.imageUrl
            };    
        }else{
            response.response.card.content = options.cardContent;
        }
    }

   if (options.repromptText) {
   		response.response.reprompt = {
   			outputSpeech: {
   				//type: "PlainText",
   				//text: options.repromptText
   				type: "SSML",
	    		ssml:"<speak>"+options.repromptText+"</speak>"
   			}	
   		};
   }

   if (options.session && options.session.attributes)
   {
       response.sessionAttributes = options.session.attributes;
   }

   return response;
}

function getPriceQuote(coin,callback){
    var url =  'https://min-api.cryptocompare.com/data/price?fsym=';
    url+=coin;
    url+='&tsyms=USD';
    console.log(url);
    https.get(url, res => {
      res.setEncoding("utf8");
      let body = "";
      let bodyout = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        bodyout = JSON.parse(body);
        callback(bodyout);
      });
    });
  
  
  }

function handleLaunchRequest(context)
{
	let option = {};
	option.speechText = "Welcome to Coin Value. You can get the latest prices on Crypto Currencies. Just ask me";
	option.repromptText =  "What would you like to know? For Example, you can ask, How much is Bitcoin";
	option.endSession =  true;
	context.succeed(buildResponse(option));
}



function handleCoinValueIntentRequest(request,context,session){
    let option = {};
    let intentvalue = request.intent.slots.Coin.value;
				
					if (intentvalue === "bitcoin"){
									
                        getPriceQuote("BTC",function(quote,err){
                            if(err) {
                                context.fail(err);
                            } else {
                                
                                option.speechText = `The price of Bitcoin is `;
                                option.speechText += ' ';
                                option.speechText += quote.USD;
                                option.speechText += ' US Dollars';
                                option.endSession = true;
                                context.succeed(buildResponse(option));	
                            }
                    });
                    }else if (intentvalue === "ethereum"){
									
                        getPriceQuote("ETH",function(quote,err){
                            if(err) {
                                context.fail(err);
                            } else {
                                
                                option.speechText = `The price of Ethereum is `;
                                option.speechText += ' ';
                                option.speechText += quote.USD;
                                option.speechText += ' US Dollars';
                                option.endSession = true;
                                context.succeed(buildResponse(option));	
                            }
                    });	
                    }else {
							option.speechText = "I don't understand what you are asking";
							option.endSession = true;
							context.succeed(buildResponse(option));
					}
}



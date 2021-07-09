console.log("echidna extension init");

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.cmd === 'get_classes') {
	console.log("sending class list to extension" + sender);
	sendResponse(getAllClasses());
    } else if (msg.cmd === 'get_tags'){
	console.log("sending tags list to extension" + sender);
	sendResponse(getAllTags());
    } else if  (msg.cmd === 'query') {
	chrome.storage.sync.get("query", ({ query }) => {
	    let els = document.querySelectorAll(query);
	    console.log(els);
	    console.log(els.length);
	    sendResponse({ hits: els.length });
	    return true
	})
    } else {
	console.log("received unknown message: " + msg.cmd);
	console.log("message is: " + msg);
    }
});

function getAllTags() {
    var els = document.querySelectorAll('*');
    let results = {};
    els.forEach((el) => {
	let tag = el.tagName;
	if (tag in results) {
	    results[tag] += 1;
	} else {
	    results[tag] = 1;
	}
    });
    return results
}

function getAllClasses() {
    var els = document.querySelectorAll("*");
    var values = {};
    els.forEach((el) => {
	let classes = el.className;
	// classes are gotten successfully here
	// console.log(classes);
	try {
	    
	    let clslist = classes.split(' ');
	    clslist.forEach((cls) => {
		// if (!(cls in values)) {
		//     values.push(cls);
		// }
		if (cls in values) {
		    values[cls] += 1;
		} else {
		    values[cls] = 1;
		}
	    });
	    
	} catch {
	    // this catch is here because of : https://stackoverflow.com/questions/20950902/dart2js-uncaught-typeerror-object-svganimatedstring-has-no-method-split
	    // it was recommended that I implement a type checker.  Perhaps this will come later.
	    console.log("some classes could not be split:::");
	    console.log(classes);
	    console.log("==================================================");
	}
    });
    return values
}


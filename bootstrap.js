const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
	name: 'MatchWord',
	path: {
		chrome: 'chrome://matchword/content/'
	},
	aData: 0,
};
const myServices = {};
var cssUri;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/devtools/Console.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyGetter(myServices, 'sss', function(){ return Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService) });

function startup(aData, aReason) {
	self.aData = aData;
	console.log('aData',aData);
	var css = '.findbar-container { -moz-binding:url("' + self.path.chrome + 'findbar.xml#matchword") }';
	var cssEnc = encodeURIComponent(css);
	var newURIParam = {
		aURL: 'data:text/css,' + cssEnc,
		aOriginCharset: null,
		aBaseURI: null
	}
	cssUri = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI);
	myServices.sss.loadAndRegisterSheet(cssUri, myServices.sss.USER_SHEET);
	
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
	
	myServices.sss.unregisterSheet(cssUri, myServices.sss.USER_SHEET);
	
	var css = '.findbar-container { -moz-binding:url("' + self.path.chrome + 'findbar.xml#matchword_shutdown") }';
	var cssEnc = encodeURIComponent(css);
	var newURIParam = {
		aURL: 'data:text/css,' + cssEnc,
		aOriginCharset: null,
		aBaseURI: null
	}
	var cssUriRemove = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI); 
	myServices.sss.loadAndRegisterSheet(cssUriRemove, myServices.sss.USER_SHEET);
	
	// have to delay the unregister by some ms otherwise it wont trigger the xbl
	var myTimer = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);
	var myTimerEvent = {
		notify: function(timer) {
			var isRegged = myServices.sss.sheetRegistered(cssUriRemove, myServices.sss.USER_SHEET)
			console.log('will now unreg xbl', 'isRegged:', isRegged);
			myServices.sss.unregisterSheet(cssUriRemove, myServices.sss.USER_SHEET)
			var isRegged = myServices.sss.sheetRegistered(cssUriRemove, myServices.sss.USER_SHEET)
			console.log('ok unregged sthudown xbl', 'isRegged:', isRegged);
		}
	}
	myTimer.initWithCallback(myTimerEvent, 500, Ci.nsITimer.TYPE_ONE_SHOT);
}

function install() {}

function uninstall() {}

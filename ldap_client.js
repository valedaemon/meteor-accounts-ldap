LDAP = {
  data : function () { return null; },
  username : function () { return ''; }
};

var firstAttempt = new ReactiveVar(true);
var showForm = new ReactiveVar(false);
var customFormTemplate = new ReactiveVar('');

LDAP.customFormTemplate = customFormTemplate;

LDAP.formHelpers = {
  failedLogin : function () {
    return !firstAttempt.get(); //return true if more than one attempt has been made. Show Error Message
  },
  usernameText: function () {
    return Meteor.settings.public.username || "Username or email";
  }
};

LDAP.formEvents = {
  'click #login-buttons-password': function(e, tpl) {
    initLogin(e,tpl);
  },
  'keyup input' : function (e, tpl){
    if (e.keyCode == 13){ //If Enter Key Pressed
        initLogin(e,tpl);
      }
  },
  'click #login-buttons-logout': function(e) {
    firstAttempt.set(true);
    Meteor.logout(function() {
      showForm.set(false);
    });
  }
};

Meteor.loginWithLdap = function (username, password, callback) {
  var methodArguments = {username: username, pwd: password, ldap: true, data: LDAP.data()};
  Accounts.callLoginMethod({
    methodArguments: [methodArguments],
    validateResult: function (result) {
    },
    userCallback: callback
  });
};

Template.ldapLogin.helpers(LDAP.formHelpers);

Template.ldapLogin.events(LDAP.formEvents);

Template.ldapLoginButtons.helpers({
  showForm : function () {
    return showForm.get();
  },
  template : function () {
    return !!Template[LDAP.customFormTemplate.get()] && LDAP.customFormTemplate.get() || "";
  },
  usernameOrEmail : function () {
	return LDAP.username() || this.username || (this.emails && this.emails[0] && this.emails[0].address) || 'Authenticated user';
  },
  usernameText: function () {
    return Meteor.settings.public.username || "Username or email";
  }
});

Template.ldapLoginButtons.events({
  'click .login-close-text' : function () {
    showForm.set(false);  
  },
  'click .login-link-text' : function () {
    showForm.set(true);
  }
});

// Initiate Login Process:
initLogin = function(e, tpl) {
  firstAttempt.set(true);
  var username = $(tpl.find('input[name="ldap"]')).val();
  var password = $(tpl.find('input[name="password"]')).val();
  var result = Meteor.loginWithLdap(username, password, function() {
	if (Meteor.userId()) {
	  showForm.set(false);
	  return true;
	}
	else {
	  firstAttempt.set(false);
	  return false;
	}
  });
  return result;
};
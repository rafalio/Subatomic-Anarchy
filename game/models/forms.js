// Forms. Make sure to use Rafal's version which can be obtained from 
// git clone git@github.com:radicality/forms.git forms

var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var widgets = forms.widgets;
    
forms.render.setOrdering("after");

var login_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true})
});

var register_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
    email: fields.email({required: true})
});

var message_form = forms.create({
  to: fields.string({
    required:true,
  }),
  message: fields.string({
        widget: widgets.textarea({rows: 6}),
        required: true
    })
})

exports.login_form      = login_form;
exports.register_form   = register_form;
exports.message_form    = message_form;

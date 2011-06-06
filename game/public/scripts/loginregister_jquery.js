$("#register_button").click(function(event) {
  event.preventDefault();
  $("#result").html('');
  $("#register_form #id_username").val($("#login_form #id_username").val());
  $("#login_form").stop().hide("slow", function(){
    $("#register_form").show("slow");
    $('#login_form #id_username').val("");
    $('#login_form #id_password').val("");
  });
  emptySucc();
});

$("#login_button").click(function(event) {
  event.preventDefault();
  $("#result").html('');
  $("#login_form #id_username").val($("#register_form #id_username").val());
  $("#register_form").stop().hide("slow", function(){
    $("#login_form").show("slow");
    $('#register_form #id_username').val("");
    $('#register_form #id_password').val("");
    $('#register_form #id_email').val("");
  });
  emptySucc();
});

$("#loginForm").submit(function(event){
  event.preventDefault();
  $.post("/login", $("#loginForm").serialize(), function(data){
    displayErrors(data);
    if(data.success)
      $(location).attr('href','/');
  });
});

$("#registerForm").submit(function(event){
  event.preventDefault();
  $.post("/register", $("#registerForm").serialize(), function(data){
    displayErrors(data);
    if(data.success) {
      emptyErrors();
      $("#success").html("<p>"+data.success + '</p>');
    }
  });
});

function emptyErrors() {
  $("#errors").stop().hide("slow", function(){
    $("#errors").html('');
    $("#errors").show();
  });
}

function emptySucc() {
  $("#success").stop().hide("slow", function(){
    $("#success").html('');
    $("#success").show();
  });
}

function displayErrors(data) {
  if(data.error) {
    if($("#errors ul").length <= 0)
      $("#errors").html('<ul></ul>');
    $("#errors ul").html('<li>' + data.error + '</li>');
    $('#id_password').val('');
  }
}
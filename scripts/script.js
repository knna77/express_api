function validacion(){
    
 // nom = document.getElementById('nom').value;
 //   mail = document.getElementById('mail');
/*check_contra =checkPass();
check_nom= checkNom();
check_mail= checkMail();
 if (check_contra == true && check_nom==true){
     return true
 }else  return false;
  */
 checkMail();
 return false
}
function checkNom(){
 nom = document.getElementById('nom').value;
console.log("-------"+nom.length)
if (nom.length <= 4){
    document.getElementById("nom").style.color ="red";
    alert ("El camp nom ha de ser al menys de 3 lletres")
 
 return false
}else return false

}
function checkMail(){
    console.log("-------");
    mail_format = /^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/;
    mail = document.getElementById('mail');
    if(mail.match(mail_format)){
        console.log("mail ok")
    }else console.log("mail ko")


    
}
function checkPass(){
    contra = document.getElementById('pass');
    contra2 = document.getElementById('pass2');
    if (contra== ""){
        document.getElementById("pass").style.color ="red";
        alert ("El camp contrassenya està buit")
        return false}
    if (    contra != contra2){
        document.getElementById("pass2").style.color ="red";
        alert ("Les contrasenyes no són igual")
        return false
    }else return true   
}
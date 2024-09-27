var sidebar=document.querySelector(".sidebar");
var menu=document.querySelector(".menu");
var cancel=document.querySelector("#cancel");
menu.addEventListener("click",()=>{
    sidebar.style.display="flex";
});
cancel.addEventListener("click",()=>{
    sidebar.style.display="none";
});
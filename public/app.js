$(function(){
    
    for(let i=0;i<10;i++){
    $('#form'+i).hide();
    $('#'+i).on('click',()=>{
    $('#form'+i).toggle();   
    });  
}


});
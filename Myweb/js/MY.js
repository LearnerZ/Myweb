(function(){
  pos = 0;
  ticking = false;
  var header = document.querySelector(".navbar");
  window.addEventListener("scroll", function(e){
    pos = window.scrollY;
    if(pos > 300&&!ticking){
      header.classList.add("sticky-top");
      $('.logo').show(200);
      ticking = true;
    }
    if(pos < 300 && ticking){
      header.classList.remove("sticky-top");
      $('.logo').hide(200);
      ticking = false;
    }
  });
})();
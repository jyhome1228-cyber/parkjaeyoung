document.querySelector('[data-year]').textContent=new Date().getFullYear();
const h=document.querySelector('[data-header]');
addEventListener('scroll',()=>h&&h.classList.toggle('is-scrolled',scrollY>8),{passive:true});

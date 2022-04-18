
document.querySelector('.user__info-show').addEventListener('click', function(e) {
  console.log(e);
  this.closest('.user__info').classList.toggle('_active');
});

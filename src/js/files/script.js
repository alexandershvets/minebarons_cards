
document.querySelector('.user__info-show').addEventListener('click', function(e) {
  this.closest('.user__info').classList.toggle('_active');
});

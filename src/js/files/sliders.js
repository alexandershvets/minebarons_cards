
let sliders = document.querySelectorAll('._swiper');
if (sliders) {
  for (let index = 0; index < sliders.length; index++) {
    let slider = sliders[index];
    if (!slider.classList.contains('swiper-bild')) {
      let slider_items = slider.children;
      if (slider_items) {
        for (let index = 0; index < slider_items.length; index++) {
          let el = slider_items[index];
          el.classList.add('swiper-slide');
        }
      }
      let slider_content = slider.innerHTML;
      let slider_wrapper = document.createElement('div');
      slider_wrapper.classList.add('swiper-wrapper');
      slider_wrapper.innerHTML = slider_content;
      slider.innerHTML = '';
      slider.appendChild(slider_wrapper);
      slider.classList.add('swiper-bild');

      if (slider.classList.contains('_swiper_scroll')) {
        let sliderScroll = document.createElement('div');
        sliderScroll.classList.add('swiper-scrollbar');
        slider.appendChild(sliderScroll);
      }
    }
    if (slider.classList.contains('_gallery')) {
      //slider.data('lightGallery').destroy(true);
    }
  }
}

if (document.querySelector('.slider_top .slider__body')) {
  let mainSlider = new Swiper('.slider_top .slider__body', {
    observer: true,
    observeParents: true,
    slidesPerView: 5,
    initialSlide: 0,
    spaceBetween: 12,
    speed: 800,
    watchOverflow: true,
    loopAdditionalSlides: 5,
    preloadImages: false,
    navigation: {
      prevEl: '.slider_top .slider-arrow_prev',
      nextEl: '.slider_top .slider-arrow_next',
    },
    breakpoints: {
      300: {
        slidesPerView: 2,
        spaceBetween: 5,
      },
      480: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 4,
      },
      992: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 4,
        spaceBetween: 16,
      },
      1600: {
        slidesPerView: 5,
        spaceBetween: 16,
      },
    },
  });
}

if (document.querySelector('.slider_bottom .slider__body')) {
  let mainSlider = new Swiper('.slider_bottom .slider__body', {
    observer: true,
    observeParents: true,
    slidesPerView: 5,
    initialSlide: 0,
    spaceBetween: 12,
    speed: 800,
    watchOverflow: true,
    loopAdditionalSlides: 5,
    preloadImages: false,
    navigation: {
      prevEl: '.slider_bottom .slider-arrow_prev',
      nextEl: '.slider_bottom .slider-arrow_next',
    },
    breakpoints: {
      300: {
        slidesPerView: 2,
        spaceBetween: 5,
      },
      480: {
        slidesPerView: 3,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 4,
      },
      992: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 4,
        spaceBetween: 16,
      },
      1600: {
        slidesPerView: 5,
        spaceBetween: 16,
      },
    },
  });
}

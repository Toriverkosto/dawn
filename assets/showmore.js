const descriptionTruncated = document.querySelector('.collection-hero__description.rte.truncated');
const descriptionFull = document.querySelector('.collection-hero__description.rte');
const showMores = document.querySelector('.less_button');
const showLess = document.querySelector('.more_button');

function showMore() {
    if (descriptionFull.style.display == "none") {
      descriptionFull.style.display = "block";
      descriptionTruncated.style.display = "none";
      showMores.style.display ="flex";
      showLess.style.display ="none";
    }
    else {
      descriptionFull.style.display = "none";
      descriptionTruncated.style.display = "block";
      showMores.style.display ="none";
      showLess.style.display ="flex";
    }
}
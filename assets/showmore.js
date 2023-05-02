const descriptionTruncated = document.querySelector('.collection-hero__description.rte.truncated');
const descriptionFull = document.querySelector('.collection-hero__description.rte');
const showLess = document.querySelector('.less_button');
const showMores = document.querySelector('.more_button');

function showMore() {
    if (descriptionFull.style.display == "none") {
      descriptionFull.style.display = "block";
      descriptionTruncated.style.display = "none";
      showMores.style.display ="none";
      showLess.style.display ="flex";
    }
    else {
      descriptionFull.style.display = "none";
      descriptionTruncated.style.display = "block";
      showMores.style.display ="flex";
      showLess.style.display ="none";
    }
}
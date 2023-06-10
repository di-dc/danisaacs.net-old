// function randombg() {
//     var random = Math.floor(Math.random() * 10) + 0;
//     var backgrounds = ["url('images/denver-01.jpg')",
//         "url('images/europe-05.jpg')",
//         "url('images/europe-06.jpg')",
//         "url('images/europe-08.jpg')",
//         "url('images/wyoming-01.jpg')",
//         "url('images/wyoming-06.jpg')",
//         "url('images/wyoming-08.jpg')",
//         "url('images/wyoming-09.jpg')",
//         "url('images/wyoming-10.jpg')",
//         "url('images/wyoming-11.jpg')"];

//     $(document).ready(function () {
//         $(".wallpaper").css('background-image', backgrounds[random]);
//     })

// }

document.addEventListener('DOMContentLoaded', randombg, false);

function randombg () {
    var random = Math.floor(Math.random() * 10) + 0;
    var backgrounds = ["url('assets/img/bg/denver-01.jpg')",
        "url('assets/img/bg/europe-05.jpg')",
        "url('assets/img/bg/europe-06.jpg')",
        "url('assets/img/bg/europe-08.jpg')",
        "url('assets/img/bg/wyoming-01.jpg')",
        "url('assets/img/bg/wyoming-06.jpg')",
        "url('assets/img/bg/wyoming-08.jpg')",
        "url('assets/img/bg/wyoming-09.jpg')",
        "url('assets/img/bg/wyoming-10.jpg')",
        "url('assets/img/bg/wyoming-11.jpg')"];
    document.getElementById('wallpaper').style.backgroundImage=backgrounds[random];
}
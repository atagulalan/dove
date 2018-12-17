let dersler = {
    "Robotlar İçin Matematik Temelleri": 2,
    "İşaret ve Sistemler": 3,
    "İşletim Sistemleri": 2,
    "Sayısal Yöntemler": 1,
    "Diferansiyel Denklemler": 0,
    "Afet Yönetimine Giriş": 0,
    "Fotoğrafçılık": 0,
    "Yazılım Laboratuvarı": 0,
}

let modifiedLectures = {};
let turkishTable = {
    "İ":"i",
    "Ğ":"g",
    "Ü":"u",
    "Ş":"s",
    "Ç":"c",
    "Ö":"o",
    "ı":"i",
    "ğ":"g",
    "ü":"u",
    "ş":"s",
    "ç":"c",
    "ö":"o",
}

Object.keys(dersler).map(el => {
    for (let i = 1; i < dersler[el]+1; i++) {
        let uriVersion = el.replace(new RegExp(Object.keys(turkishTable).join("|"), "g"), function (m) {
            return turkishTable[m];
        }).toLowerCase().replace(/[^A-Za-z0-9\-\_\s]+/g, '').replace(/[\s]+/g, '-');
        modifiedLectures[uriVersion + "-" + i] = {
            title: el + " #" + i,
            link: "lecture/"+uriVersion + "-" + i
        }
    }
});

exports.lectures = modifiedLectures
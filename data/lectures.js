let lectures = {
    "Lecture 1": 0,
    "Lecture 2": 0,
    "Lecture 3": 0,
    "Lecture 4": 0,
}

let modifiedLectures = {};

Object.keys(lectures).map(el => {
    for (let i = 1; i < lectures[el]+1; i++) {
        let uriVersion = el.toLowerCase().replace(/[^A-Za-z0-9\-\_\s]+/g, '').replace(/[\s]+/g, '-');
        modifiedLectures[uriVersion + "-" + i] = {
            title: el + " #" + i,
            link: "lecture/"+uriVersion + "-" + i
        }
    }
});

exports.lectures = modifiedLectures
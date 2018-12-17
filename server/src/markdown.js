const md = require('markdown-it')({
    html: true,
    linkify: true
})

md.use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-katex'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-sub'));

var imageRender = md.renderer.rules.image;

getAttr = (token, attr) => {
    let returnObj = token.attrs[token.attrIndex(attr)];
    return typeof returnObj !== "undefined" ? returnObj[1] : "";
}

md.renderer.rules.image = function (tokens, idx, options, env, self) {
    var token = tokens[idx],
        href = getAttr(token, 'src'),
        text = getAttr(token, 'alt'),
        title = getAttr(token, 'title');

    //IF AUDIO
    let audioFiles = ["mp3", "wav", "ogg", "flac", "aiff", "mid", "aac", "wma", "alac", "ape"]
    if (audioFiles.some((s) => href.toLowerCase().endsWith(s))) {
        return ('<div class="audioplayer"><audio preload="true"><source src="' + href + '"></audio><button class="p"><div class="b"></div></button><div class="l"><div class="d"></div></div></div>')
    }

    let modern = '';
    let classes = title;
    if (href.toLowerCase().endsWith(".webp")) modern = 'onerror="this.onerror=null; this.src=\'' + href.slice(0, -5) + '.png\'")';
    return (title ? "<figure class='" + title + "'>" : "") + '<img class="' + classes + '" src="' + href + '" alt="' + text + '" title="' + text + '" ' + modern + '>' + ((title && text) ? "<figcaption>" + text + "</figcaption></figure>" : "</figure>")
};


module.exports = {
    md: (m) => md.render(m)
}
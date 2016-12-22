var http = require('http')
var fs = require('fs');
var path = require('path');
var xlsx2json = require("node-xlsx");
var list = xlsx2json.parse("./text.xlsx");
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var express = require("express");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get("", function(req, res, next) {
    // res.sendFile('./view/index.html');
    res.sendFile(__dirname + '/view/index.html');
});
app.post("", urlencodedParser, function(req, res, next) {
    //接受数据 
    var row = req.body.myrow ? req.body.myrow : 0;
    //老链接是否是一个
    var ismylink = req.body.ismylink;
    if (!ismylink) {
        var oldUrl = [];
    } else {
        var oldUrl = "";
    };
    //下载地址是否替换
    var isdownload = req.body.isdownload ? req.body.isdownload : "";
    //下载地址的选择器是否自定义
    var mydownload = req.body.mydownload ? req.body.mydownload : ".download";
    //下载地址是一个还是多个
    var mydownloadUrl = req.body.mydownloadUrl ? req.body.mydownloadUrl : [];
    //icon是否替换
    var isicon = req.body.isicon ? req.body.isicon : "";
    //icon的选择器是否自定义
    var myicon = req.body.myicon ? req.body.myicon : ".icon";
    //icon是一个还是多个
    var myiconUrl = req.body.myiconUrl ? req.body.myiconUrl : [];
    //logo是否替换
    var islogo = req.body.islogo ? req.body.islogo : "";
    //logo的选择器是否自定义
    var mylogo = req.body.mylogo ? req.body.mylogo : ".logo";
    //logo是一个还是多个
    var mylogoUrl = req.body.mylogoUrl ? req.body.mylogoUrl : [];
    //footer是否替换
    var isfooter = req.body.isfooter ? req.body.isfooter : "";
    //footer的选择器是否自定义
    var myfooter = req.body.myfooter ? req.body.myfooter : ".footer";
    //footer的内容是一个还是多个
    var myfooterText = req.body.myfooterText ? req.body.myfooterText : [];

    // console.log(list[0].data[1][2]);第一个表的第二行的第三个单元格中的数据
    //将excel中数据存入各自的数组中
    var newHtml = []; //存新生成的文件名
    row = 2;
    for (var i = row; i < list[0].data.length; i++) {
        var new_link = list[0].data[i][2];
        var new_pos = parseInt(new_link.lastIndexOf('/')) + 1;
        newHtml.push(new_link.substring(new_pos));
        if (!ismylink) {
            oldUrl.push(list[0].data[i][1]);
        } else {
            oldUrl = list[0].data[row][1];
        }
        if (isdownload && Array.isArray(mydownloadUrl)) {
            mydownloadUrl.push(list[0].data[i][3]);
        }
        if (isfooter && Array.isArray(myfooterText)) {
            myfooterText.push(list[0].data[i][4]);
        }
        if (isicon && Array.isArray(myiconUrl)) {
            myiconUrl.push(list[0].data[i][5]);
        }
        if (islogo && Array.isArray(mylogoUrl)) {
            mylogoUrl.push(list[0].data[i][6]);
        }
    }
    String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2); //这里的gm是固定的，g可能表示global，m可能表示multiple。
    }
    Array.prototype.indexOf = function(el) {
        for (var i = 0, n = this.length; i < n; i++) {
            if (this[i] === el) {
                return i;
            }
        }
        return -1;
    }
    if (Array.isArray(oldUrl)) {
        // 得到一个 eventproxy 的实例
        var ep = new eventproxy();
        // 命令 ep 重复监听 topicUrls.length 次（在这里也就是 40 次） `topic_html` 事件再行动
        ep.after('wap_html', oldUrl.length, function(topics) {
            // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair
            //console.log(topics);
            topics = topics.map(function(topicPair) {
                var html = topicPair[1];
                var $ = cheerio.load(html);
                //此页面在当前数组中的位置
                var url_pos = oldUrl.indexOf(topicPair[0]);
                //替换内容
                if (isdownload && ($(mydownload).length != 0)) {
                    //下载链接选择器是否自定义
                    var downloadUrl = $(mydownload).attr("href");
                    if (Array.isArray(mydownloadUrl)) {
                        html = html.replaceAll(downloadUrl, mydownloadUrl[url_pos]);
                    } else {
                        html = html.replaceAll(downloadUrl, mydownloadUrl);
                    }
                }
                if (isicon && ($(myicon).length != 0)) {
                    //icon选择器是否自定义
                    var myoldicon = $(myicon).attr("src");
                    if (Array.isArray(myiconUrl)) {
                        html = html.replaceAll(myoldicon, myiconUrl[url_pos]);
                    } else {
                        html = html.replaceAll(myoldicon, myiconUrl);
                    }
                }
                if (islogo && ($(mylogo).length != 0)) {
                    //logo选择器是否自定义
                    var myoldlogo = $(mylogo).attr("src");
                    if (Array.isArray(mylogoUrl)) {
                        html = html.replaceAll(myoldlogo, mylogoUrl[url_pos]);
                    } else {
                        html = html.replaceAll(myoldlogo, mylogoUrl);
                    }
                }
                if (isfooter && ($(myfooter).length != 0)) {
                    //替换底部版权      
                    var footText = $(myfooter).text().trim();
                    if (footText.indexOf("[")) {
                        var newArr = footText.split("[");
                        newArr[0] = newArr[0] + "\\[";
                        footText = newArr.join("");
                    }
                    if (footText.indexOf("]")) {
                        var newArr = footText.split("]");
                        newArr[0] = newArr[0] + "\\]";
                        footText = newArr.join("");
                    }
                    if (Array.isArray(myfooterText)) {
                        html = html.replaceAll(footText, myfooterText[url_pos]);
                    } else {
                        html = html.replaceAll(footText, myfooterText);
                    }
                }
                // 更改统计代码中的统计

                //
                fs.writeFile("./" + newHtml[url_pos], html, function(err) {
                    if (err) {
                        console.log('出现错误!')
                    }
                    console.log('已输出至' + newHtml[url_pos] + '中');
                });
            });
        });
        oldUrl.forEach(function(topicUrl, index) {
            superagent.get(topicUrl).end(function(err, res) {
                console.log("抓到" + topicUrl + "了");
                ep.emit('wap_html', [topicUrl, res.text]);
            });
        });
    }
    console.log("oldUrl" + oldUrl);
    if (typeof oldUrl == 'string') {

        superagent.get(oldUrl)
            .end(function(err, res) {
                if (err) {
                    return console.error(err);
                }
                var $ = cheerio.load(res.text);
                newHtml = newHtml.map(function(newHtmlText, index) {
                    var html = res.text;
                    var htmlIndex = index;
                    //替换内容
                    if (isdownload && ($(mydownload).length != 0)) {
                        //下载链接选择器是否自定义
                        var downloadUrl = $(mydownload).attr("href");
                        if (Array.isArray(mydownloadUrl)) {
                            html = html.replaceAll(downloadUrl, mydownloadUrl[htmlIndex]);
                        } else {
                            html = html.replaceAll(downloadUrl, mydownloadUrl);
                        }
                    }
                    if (isicon && ($(myicon).length != 0)) {
                        //icon选择器是否自定义
                        var myoldicon = $(myicon).attr("src");
                        if (Array.isArray(myiconUrl)) {
                            html = html.replaceAll(myoldicon, myiconUrl[htmlIndex]);
                        } else {
                            html = html.replaceAll(myoldicon, myiconUrl);
                        }
                    }
                    if (islogo && ($(mylogo).length != 0)) {
                        //logo选择器是否自定义
                        var myoldlogo = $(mylogo).attr("src");
                        if (Array.isArray(mylogoUrl)) {
                            html = html.replaceAll(myoldlogo, mylogoUrl[htmlIndex]);
                        } else {
                            html = html.replaceAll(myoldlogo, mylogoUrl);
                        }
                    }
                    // console.log(isfooter);
                    if (isfooter && ($(myfooter).length != 0)) {
                        //替换底部版权      
                        var footText = $(myfooter).text().trim();
                        if (footText.indexOf("[")) {
                            var newArr = footText.split("[");
                            newArr[0] = newArr[0] + "\\[";
                            footText = newArr.join("");
                        }
                        if (footText.indexOf("]")) {
                            var newArr = footText.split("]");
                            newArr[0] = newArr[0] + "\\]";
                            footText = newArr.join("");
                        }
                        if (Array.isArray(myfooterText)) {
                            console.log(footText);
                            html = html.replaceAll(footText, myfooterText[htmlIndex]);
                        } else {
                            html = html.replaceAll(footText, myfooterText);
                        }
                    }

                    var newHtmlName = newHtmlText.split(".");
                    var newNum = newHtmlName[0].replace(/[^0-9]+/g, "");
                    var newPage = newHtmlName[0].replace(/[^a-z]+/ig, "");
                    //老链接的统计
                    var old_pos = parseInt(oldUrl.lastIndexOf('/')) + 1;
                    var old_pos2 = parseInt(oldUrl.lastIndexOf('.'));
                    var old_link = oldUrl.substring(old_pos,old_pos2);
                    var oldName = old_link.split(".");
                    var oldNum = oldName[0].replace(/[^0-9]+/g, "");
                    var oldPage = oldName[0].replace(/[^a-z]+/ig, "");
                    // 更改统计代码中的统计
                    var tjCode1 = '_hmt.push(\\[\\"_trackEvent\\", \\"'+old_link+'\\"\\]);';
                    var tjCode2 = '_czc.push(\\[\\"_trackEvent\\",\\"'+oldPage+'\\",\\"'+oldNum+'\\"\\]);';
                    console.log(tjCode1,tjCode2);
                    var tjCode1New = '_hmt.push(\\[\\"_trackEvent\\", \\"' + newHtmlName[0]+'\\"\\]);';
                    var tjCode2New = '_czc.push(\\[\\"_trackEvent\\",\\"' + newPage+'\\",\\"'+ newNum +'\\"\\]);';
                     console.log(tjCode1New,tjCode2New);
                    html = html.replaceAll(tjCode1, tjCode1New);
                    html = html.replaceAll(tjCode2, tjCode2New);
                    //
                    fs.writeFile("./page/" + newHtmlText, html, function(err) {
                        if (err) {
                            console.log('出现错误!')
                        }
                        console.log('已输出至' + newHtmlText + '中');
                    });

                });

            });
    }
});
app.listen(3000, function() {
    console.log("server start");
})

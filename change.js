var http = require('http')
var fs = require('fs');
var path = require('path');
var xlsx2json = require("node-xlsx");
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var express = require("express");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var mytools = require('./lib/tools.js');
// create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var dialog = require('dialog');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));
app.get("/index", function(req, res, next) {
    // res.sendFile('./view/index.html');
    res.sendFile(__dirname + '/views/index.html');
});
app.post("/index", urlencodedParser, function(req, res, next) {
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
    var list = xlsx2json.parse("./test.xlsx");
    //接受数据 
    var row = req.body.myrow ? (parseInt(req.body.myrow) - 1) : 2;
    var rowend = req.body.myrowend ? (parseInt(req.body.myrowend) - 1) : list[0].data.length;
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
    var isdownloadonly = req.body.isdownloadonly;
    //下载地址是一个还是多个
    var mydownloadUrl = req.body.mydownloadUrl;
    if (isdownloadonly == 0) {
        mydownloadUrl = [];
    }
    //是否使用本地模版
    var ismymodel = req.body.ismymodel ? req.body.ismymodel : "";
    //本地模版名字
    var mymodelName = req.body.mymodelName ? req.body.mymodelName : "";
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
    var myfooter = req.body.myfooter ? req.body.myfooter : "footer";
    //footer的内容是一个还是多个
    var myfooterText = req.body.myfooterText ? req.body.myfooterText : [];
    //title是否替换
    var istitle = req.body.istitle ? req.body.istitle : "";
    //title的选择器是否自定义
    var mytitle = req.body.mytitle ? req.body.mytitle : "title";
    var istitleonly = req.body.istitleonly;
    //title的内容是一个还是多个
    var mytitleText = req.body.mytitleText;
    if (istitleonly == 0) {
        mytitleText = [];
    }
    //内容删除
    var delChoose = req.body.delChoose;
    // console.log(list[0].data[1][2]);第一个表的第二行的第三个单元格中的数据
    //将excel中数据存入各自的数组中
    var newHtml = []; //存新生成的文件名
    for (var i = row; i <= rowend; i++) {
        var new_link = list[0].data[i][3];
        var new_pos = parseInt(new_link.lastIndexOf('/')) + 1;
        newHtml.push(new_link.substring(new_pos));
        if (ismymodel) {
            oldUrl = "http://localhost:3000/tmpl/" + mymodelName + ".html";
        } else {
            if (!ismylink) {
                oldUrl.push(list[0].data[i][1]);
            } else {
                oldUrl = list[0].data[row][1];
                // console.log(row,oldUrl);
            }
        }
        if (isdownload && isdownloadonly) {
            if (!mydownloadUrl) {
                mydownloadUrl = list[0].data[row][2];
            }
        }
        if (isdownload && Array.isArray(mydownloadUrl)) {
            mydownloadUrl.push(list[0].data[i][2]);
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
        if (istitle && istitleonly) {
            if (!mytitleText) {
                mytitleText = list[0].data[row][0];
            }
        }
        if (istitle && Array.isArray(mytitleText)) {
            mytitleText.push(list[0].data[i][7]);
        }
    }

    //console.log("oldUrl" + oldUrl);
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
                    var i = 0;
                    //替换内容
                    if (isdownload && ($(mydownload).length != 0)) {
                        for (i = 0; i < $(mydownload).length; i++) {
                            //下载链接选择器是否自定义
                            var downloadUrl = $(mydownload).eq(i).attr("href");
                            // console.log(typeof mydownloadUrl,mydownloadUrl,downloadUrl);

                            html = mytools.replaceCon(html, mydownloadUrl, downloadUrl, htmlIndex);
                        }
                    }
                    if (isicon && ($(myicon).length != 0)) {
                        //icon选择器是否自定义
                        for (i = 0; i < $(myicon).length; i++) {
                            var myoldicon = $(myicon).eq(i).attr("src");
                            html = mytools.replaceCon(html, myiconUrl, myoldicon, htmlIndex);
                        }
                    }
                    if (islogo && ($(mylogo).length != 0)) {
                        //logo选择器是否自定义
                        for (i = 0; i < $(mylogo).length; i++) {
                            var myoldlogo = $(mylogo).eq(i).attr("src");
                            html = mytools.logoChange(myoldlogo, html, htmlIndex, mylogoUrl);
                        }
                    }
                    if (istitle && ($(mytitle).length != 0)) {
                        //title选择器是否自定义
                        for (i = 0; i < $(mytitle).length; i++) {
                            var myoldtitle = $(mytitle).eq(i).text().trim();
                            html = mytools.replaceCon(html, mytitleText, myoldtitle, htmlIndex);
                        }
                    }
                    //console.log($(myfooter).length);
                    if (isfooter && ($(myfooter).length != 0)) {
                        //替换底部版权      
                        var footText = $(myfooter).text().trim();
                        // console.log(footText);
                        //版权无内容的时候
                        if (footText == "") {
                            var outLabel = $.html(myfooter);
                            html = mytools.footTextNone(footText, outLabel, html, myfooterText, htmlIndex);
                        } else {
                            //版权有内容
                            footText = mytools.copySpecial(footText);
                            if (Array.isArray(myfooterText)) {
                                if (typeof myfooterText[htmlIndex] == 'undefined') {
                                    //html = html.replaceAll(footText, ' ');
                                    //找到版权标签添加display:none;
                                    var myfooterkb = $.html(myfooter);
                                    //html = html.replaceAll(myfooterkb,"哈哈哈");
                                    html = mytools.footTextNone(footText, myfooterkb, html, myfooterText, htmlIndex);
                                } else {
                                    html = html.replaceAll(footText, myfooterText[htmlIndex]);
                                };
                            } else {
                                html = html.replaceAll(footText, myfooterText);
                            }
                        }

                    }
                    html = mytools.changeStat(html, newHtmlText);
                    //删除某些内容
                    if (delChoose) {
                        var delChooseArr = delChoose.split(",");
                        for (var k = 0; k < delChooseArr.length; k++) {
                            var delCon = $.html(delChooseArr[k]);
                            //删除节点
                            console.log(delCon);
                            html = mytools.delNode(delCon, html);
                        }
                    }
                    mytools.printFile(newHtmlText, html);
                });
                dialog.info('生成成功！');
            });
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
                var i = 0;
                //此页面在当前数组中的位置
                var url_pos = oldUrl.indexOf(topicPair[0]);
                //替换内容
                if (isdownload && ($(mydownload).length != 0)) {
                    for (i = 0; i < $(mydownload).length; i++) {
                        //下载链接选择器是否自定义
                        var downloadUrl = $(mydownload).eq(i).attr("href");
                        html = mytools.replaceCon(html, mydownloadUrl, downloadUrl, url_pos);
                    }
                }
                if (isicon && ($(myicon).length != 0)) {
                    for (i = 0; i < $(myicon).length; i++) {
                        //icon选择器是否自定义
                        var myoldicon = $(myicon).eq(i).attr("src");
                        html = mytools.replaceCon(html, myiconUrl, myoldicon, url_pos);
                    }
                }
                if (islogo && ($(mylogo).length != 0)) {
                    for (i = 0; i < $(mylogo).length; i++) {
                        //logo选择器是否自定义
                        var myoldlogo = $(mylogo).eq(i).attr("src");
                        html = mytools.logoChange(myoldlogo, html, url_pos, mylogoUrl);
                    }
                }
                if (istitle && ($(mytitle).length != 0)) {
                    for (i = 0; i < $(mytitle).length; i++) {
                        //title选择器是否自定义
                        var myoldtitle = $(mytitle).eq(i).text().trim();
                        html = mytools.replaceCon(html, mytitleText, myoldtitle, url_pos);
                    }
                }
                if (isfooter && ($(myfooter).length != 0)) {

                    //替换底部版权      
                    var footText = $(myfooter).text().trim();

                    // console.log(footText);
                    //版权无内容的时候
                    if (footText == "") {
                        var outLabel = $.html(myfooter);
                        html = mytools.footTextNone(footText,outLabel, html, myfooterText, url_pos);
                    } else {
                        //版权有内容
                        footText = mytools.copySpecial(footText);
                        if (Array.isArray(myfooterText)) {
                            if (typeof myfooterText[url_pos] == 'undefined') {
                                //html = html.replaceAll(footText, ' ');
                                var myfooterkb = $.html(myfooter);
                                html = mytools.footTextNone(footText,myfooterkb, html, myfooterText, htmlIndex);
                            } else {
                                html = html.replaceAll(footText, myfooterText[url_pos]);
                            };
                        } else {
                            html = html.replaceAll(footText, myfooterText);
                        }
                    }

                }
                html = mytools.changeStat(html, newHtml[url_pos]);
                //删除某些内容
                if (delChoose) {
                    var delChooseArr = delChoose.split(",");
                    for (var k = 0; k < delChooseArr.length; k++) {
                        var delCon = $.html(delChooseArr[k]);
                        //删除节点
                        console.log(delCon);
                        html = mytools.delNode(delCon, html);
                    }
                }
                mytools.printFile(newHtml[url_pos], html);
            });
            dialog.info("生成成功！");
        });
        oldUrl.forEach(function(topicUrl, index) {
            superagent.get(topicUrl).end(function(err, res) {
                console.log("抓到" + topicUrl + "了");
                ep.emit('wap_html', [topicUrl, res.text]);
            });
        });
    }
    res.send('生成成功！请到page2下查看！');
});
app.listen(3000, function() {
    console.log("server start http://localhost:3000");
})

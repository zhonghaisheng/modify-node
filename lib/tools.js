var fs = require('fs');
module.exports = {
    changeStat: function(html, newHtmlText) {
        var newHtmlName = newHtmlText.split(".");
        var newNum = newHtmlName[0].replace(/[^0-9]+/g, "");
        var newPage = newHtmlName[0].replace(/[^a-z]+/ig, "");
        // 更改统计代码中的统计
        var hmt = '_hmt.push\(.*\);';
        var czc = '_czc.push\(.*\);';
        var tjCode1New = '_hmt.push(\[\"_trackEvent\", \"' + newHtmlName[0] + '\"\]);';
        var tjCode2New = '_czc.push(\[\"_trackEvent\",\"' + newPage + '\",\"' + newNum + '\"\]);';
        html = html.replaceAll(hmt, tjCode1New);
        html = html.replaceAll(czc, tjCode2New);
        return html;
    },
    printFile: function(newHtmlText, html) {
        fs.writeFile("./page2/" + newHtmlText, html, function(err) {
            if (err) {
                console.log('出现错误!')
            }
            console.log('已输出至' + newHtmlText + '中');

        });
    },
    replaceCon: function(html, mydownloadUrl, downloadUrl, htmlIndex) {
        if (Array.isArray(mydownloadUrl)) {
            html = html.replaceAll(downloadUrl, mydownloadUrl[htmlIndex]);
        } else {
            html = html.replaceAll(downloadUrl, mydownloadUrl);
        }
        return html;
    },
    copySpecial: function(footText) {
        if (footText.indexOf("[") != -1) {
            var newArr = footText.split("[");
            newArr[0] = newArr[0] + "\\[";
            footText = newArr.join("");
        }
        if (footText.indexOf("]") != -1) {
            var newArr = footText.split("]");
            newArr[0] = newArr[0] + "\\]";
            footText = newArr.join("");
        }
        return footText;
    },
    footTextNone: function(outLabel,html, myfooterText, htmlIndex) {
        var outLabelPos1 = outLabel.indexOf(">");
        var outLabelPos2 = outLabel.lastIndexOf("<");
        var outLabelPos3 = outLabel.lastIndexOf("/");
        var outLabelBefore = outLabel.substring(0, outLabelPos1+1);
        var outLabelBefore2 = outLabel.substring(0, outLabelPos1);
        var outLabelAfter = outLabel.substring(outLabelPos2);
        var outLabelAfter2 = outLabel.substring(outLabelPos3+1);
        var footerText = outLabelBefore + "(.*)<\/" + outLabelAfter2;
        if (Array.isArray(myfooterText) && (typeof myfooterText[htmlIndex] != 'undefined')) {
            html = html.replaceAll(footerText, outLabelBefore + myfooterText[htmlIndex] + outLabelAfter);
        } else if (typeof myfooterText == 'string') {
            html = html.replaceAll(footerText, outLabelBefore + myfooterText + outLabelAfter);
        } else if(Array.isArray(myfooterText) && (typeof myfooterText[htmlIndex] == 'undefined')){
            html = html.replaceAll(footerText, outLabelBefore2+ " style='display:none'> "+outLabelAfter);
        }
        return html;
    },
    delNode:function(delCon,html){
        var delConPos1 = delCon.indexOf(">");
        var delConBefore = delCon.substring(0, delConPos1+1);
        var delConBefore2 = delCon.substring(0, delConPos1);
        html = html.replaceAll(delConBefore,delConBefore2+"style='display:none'>"); 
        return html;  
    },
    logoChange: function(myoldlogo, html, htmlIndex, mylogoUrl) {
        if (myoldlogo.indexOf("?") != -1) {
            var newlogoArr = myoldlogo.split("?");
            newlogoArr[0] = newlogoArr[0] + "\\?";
            myoldlogo = newlogoArr.join("");
        }
        if (Array.isArray(mylogoUrl)) {
            html = html.replaceAll(myoldlogo, mylogoUrl[htmlIndex]);
        } else {
            html = html.replaceAll(myoldlogo, mylogoUrl);
        }
        return html;
    }
}

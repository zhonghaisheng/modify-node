# modify-node<br>
根据excel的配置，和页面的选择情况<br>
可以帮我们批量修改logo,icon,下载地址，游戏名称，统计代码默认修改，一对一，一对多，都可以。<br>
一对多支持本地模板和线上地址，一对一只支持线上地址<br>
支持内容删除<br>
test.xlsx中的第一个表是一对一的实例，第二个表是一对多的实例
避免页面中出现++、--可以用+=1、-=1代替，出现++或者--正则无法运行
footer中空白的时候请不要折行<br>
icon中的数据目前是跨域调用

cmd命令行运行：

cd [本地盘目录]

cd modify-node

npm install/cnpm install

cd trunk

node change

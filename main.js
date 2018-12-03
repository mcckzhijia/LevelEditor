'use strict';
let electron = require('electron');
let fs = require('fire-fs');
let path = require('fire-path');

module.exports = {
    load () {
        // 当 package 被正确加载的时候执行
        //this.node.on("")
    },

    unload () {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'selection:activated'(event,type,id)
        {
            /*
            Editor.log(type);
            if(type !== 'node'|| !id)
            {
                return;
            }
            Editor.log(type);
            */
        },
        'dosomething' () {
            Editor.log('一键生成关卡配置');

            //Editor.log(Editor.Selection);
            //let savePath = this._getAppCfgPath();
            let filePath = Editor.projectPath +"\\assets\\Editor\\Level";

            Editor.log('savePath:'+ filePath);

            if (fs.existsSync(filePath)) {
                Editor.log("目录已存在：");
                let list = this.readDirSync(filePath);
                //Editor.log(list);

                for (let i=0;i<list.length;i++)
                {
                    let item = list[i];
                    this.setFileByPath(item);
                }

                //刷新前端工程目录
                Editor.assetdb.refresh('db://assets/resources/Prefabs/Fight/LevelJson', function (err, results) {});
            } else {
                Editor.log("目录不存在：" + filePath);
            }
    }
    },
    setFileByPath(filePath)
    {
        let startIndex = filePath.lastIndexOf("\\");
        let endIndex = filePath.lastIndexOf(".prefab");
        let fileName =filePath.substring(startIndex+1,endIndex);
        //Editor.log("FileName"+fileName);
        //Editor.log("FilePath："+filePath);
        if(fileName!=null)
        {
            fs.readFile(filePath, 'utf-8', function (err, data) {
                if (!err) {
                    let jasonData = JSON.parse(data)
                    Editor.log(jasonData);

                    let itemList =[];//需要存储的数据

                    for(let i=0;i<jasonData.length;i++)
                    {
                        let item = jasonData[i];

                        if(item.__type__ == "cc.Node" && item._parent != null && item._parent.__id__ == 1 && item._components!=null && item._components.length >0)
                        {
                            let itemPos = item._position;
                            //Editor.log(itemPos);
                            //Editor.log(item._components);

                            for (let s =0;s<item._components.length;s++)
                            {
                                let jItem = jasonData[item._components[s].__id__];
                                //Editor.log(jItem);
                                if(jItem!= undefined && jItem.ItemType!=null)
                                {
                                    //Editor.log(jItem);
                                    let newJsonData = {ItemType:jItem.ItemType,ItemID:jItem.ItemID,m_moveSpeed:jItem.m_moveSpeed,EnableMove:jItem.EnableMove,Position:itemPos};
                                    //Editor.log(newJsonData);
                                    itemList.push(newJsonData);
                                }
                            }
                        }
                    }
                    //Editor.log(itemList);
                    this.saveToJson(Editor.projectPath +"\\assets\\resources\\Prefabs\\Fight\\LevelJson\\"+fileName+".json",itemList);
                }
            }.bind(this));
        }
    },
    /**
     * 读取文件夹下的所有文件，并过滤.meta文件
     * @param dirPath
     * @returns {Array}
     */
    readDirSync(dirPath)
    {
        let allFileArr =[];
        let dirInfo = fs.readdirSync(dirPath);
        for (let i = 0; i < dirInfo.length; i++) {
            let item = dirInfo[i];
            let itemFullPath = path.join(dirPath, item);
            let info = fs.statSync(itemFullPath);
            if (info.isDirectory()) {
                // this._addLog('dir: ' + itemFullPath);
                readDirSync(itemFullPath);
            } else if (info.isFile()) {
                if (item.indexOf(".meta") !=-1) {
                    //window.plugin._addLog("检索到excel产生的临时文件:" + itemFullPath);
                } else {
                    allFileArr.push(itemFullPath);
                    //Editor.log(itemFullPath);
                }
                // this._addLog('file: ' + itemFullPath);
            }
        }
        return allFileArr;
    },
    /**
     * 保存文件
     * @param savePath
     * @param data
     */
    saveToJson(savePath,data)
    {
        fs.writeFileSync(savePath, JSON.stringify(data));
    },
};